import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

// Real PostgreSQL engine; only Supabase's managed auth/storage schemas are fixtures.
const db = new PGlite();
await db.exec(`
  create role anon; create role authenticated;
  create schema auth; create schema storage;
  create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
  grant usage on schema auth,storage,public to anon,authenticated;
  grant execute on function auth.uid() to anon,authenticated;
  create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
  create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text,metadata jsonb,primary key(bucket_id,name));
  alter table storage.objects enable row level security;
  grant select,insert,update,delete on storage.objects to authenticated;
  grant select on storage.objects to anon;
`);
const users = [1,2,9].map(number => `00000000-0000-0000-0000-${String(number).padStart(12,'0')}`);
for (const id of users) await db.query('insert into auth.users values($1,$2,now())',[id,`${id}@example.com`]);
await db.exec(readFileSync(new URL('../supabase/migrations/202611030001_submissions.sql',import.meta.url),'utf8'));
await db.query('insert into public.submission_admins values($1)',[users[2]]);
const as = async (role,uid = '') => {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);
  await db.exec(`set role ${role}`);
};
const data = { studentName:'测试学生',title:'测试作品',summary:'创作背景与过程。'.repeat(15),roles:'独立完成',grade:'2025级',category:'3D',year:'2026',lockerNumber:'04',lockerColor:'#9aa3ac',lockerAccent:'#2aa800',deco:'-1' };
const begin = async (payload = data,id = null) => (await db.query('select public.begin_submission($1,$2,$3) as id',[payload,'PRIVATE-STUDENT-ID',id])).rows[0].id;
const catalog = async () => (await db.query('select * from public.published_catalog()')).rows;
const put = (id,name,mime,size = 4096) => db.query("insert into storage.objects(bucket_id,name,metadata) values('submissions',$1,$2)",[`${id}/${name}`,{mimetype:mime,size}]);
const finish = id => db.query('select public.finish_submission($1)',[id]);
const denied = async fn => { await assert.rejects(fn); };

await as('authenticated',users[0]);
const id = await begin();
assert.equal((await db.query('select * from public.submissions')).rows.length,1);
await denied(() => db.query("update public.submissions set status='approved' where id=$1",[id]));
await denied(() => db.query('insert into public.submission_admins values($1)',[users[0]]));
await as('authenticated',users[1]);
assert.equal((await db.query('select * from public.submissions')).rows.length,0);
await denied(() => put(id,'cover','image/png'));
await denied(() => finish(id));
await as('authenticated',users[0]);
await denied(() => put(id,'video','video/mp4'));
await put(id,'cover','application/pdf');
await denied(() => finish(id));
await db.query("update storage.objects set metadata=$1 where name=$2",[{mimetype:'image/png',size:4096},`${id}/cover`]);
await put(id,'gallery-00','image/jpeg');
await put(id,'document','application/pdf');
await finish(id);
await finish(id); // Finalization is idempotent if the HTTP response was lost.
await denied(() => put(id,'avatar','image/png'));
assert.equal((await db.query("update storage.objects set metadata='{}' where name=$1",[`${id}/cover`])).affectedRows,0);
await denied(() => db.query('select public.review_submission($1,true,$2)',[id,'self approval']));
await as('anon');
assert.equal((await catalog()).length,0);
assert.equal((await db.query('select * from storage.objects')).rows.length,0);
await denied(() => db.query('select * from public.submissions'));
await as('authenticated',users[2]);
assert.equal((await db.query('select public.is_submission_admin() as admin')).rows[0].admin,true);
await db.query('select public.review_submission($1,true,$2)',[id,'approved']);
await as('anon');
const publicRows = await catalog();
assert.equal(publicRows.length,1);
const json = JSON.stringify(publicRows);
for (const secret of ['PRIVATE-STUDENT-ID','@example.com',users[0],'contact_email','owner_id','review_note']) assert.ok(!json.includes(secret),secret);
assert.equal((await db.query('select * from storage.objects')).rows.length,3);
await as('authenticated',users[0]);
await denied(() => begin(data,id)); // Published assets cannot be edited by the uploader.
await as('authenticated',users[2]);
await db.query('select public.review_submission($1,false,$2)',[id,'请修改']);
await as('anon');
assert.equal((await catalog()).length,0);
assert.equal((await db.query('select * from storage.objects')).rows.length,0);
await as('authenticated',users[0]);
assert.equal(await begin(data,id),id);
await begin(); await begin();
await denied(() => begin()); // Per-user/day quota is enforced in the database.
await denied(() => begin({...data,summary:'太短'}));
await as('authenticated',users[1]);
const large = await begin();
await put(large,'cover','image/png',6 * 1024 * 1024);
await denied(() => finish(large));
await db.close();
console.log('PostgreSQL: ownership, quotas, private contacts/files, moderation, no video, immutable publication and unpublish passed.');
