import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {fileRules,validateFiles,escapeHtml,statusLabels} from '../src/submissionData.js';
import {validatePublicSupabaseConfig} from '../src/backendConfig.js';
const ui = readFileSync(new URL('../src/myWorks.js',import.meta.url),'utf8').replace(/\r\n/g,'\n').replace(/^import .*;\n/gm,'').replace(/export /g,'');
const view = vm.createContext({e:escapeHtml,statusLabels,fileRules});
vm.runInContext(ui+'\nthis.editor=editorMarkup;this.current=currentVersions;',view);
const files = ['avatar','cover','gallery','gallery','gallery'].map((kind,i)=>({kind,mime:'image/png',bytes:1024,path:`original/${i}`,url:`/image-${i}.png`}));
const row = {id:'original',status:'approved',created_at:'2026-11-04T01:00:00Z',files,data:{studentName:'学生甲',title:'<script>作品</script>',grade:'2026级',category:'游戏',year:'2026',roles:'独立完成',summary:'背景过程成果。'.repeat(20),deco:'-1'}};
const markup = view.editor(row);
assert.ok(!markup.includes('<script>作品'));
assert.ok(markup.includes('&lt;script&gt;作品'));
assert.equal((markup.match(/name="gallery"/g)||[]).length,1);
assert.ok(!/name="avatar"[^>]*required/.test(markup));
assert.ok(/name="avatar"[^>]*required/.test(view.editor({...row,files:files.filter(file=>file.kind!=='avatar')})));
assert.ok(!markup.includes('name="document"'));
const revision = {...row,id:'revision',work_id:'original',status:'pending',created_at:'2026-11-04T02:00:00Z'};
assert.equal(view.current([row,revision]).length,1);
assert.equal(view.current([row,revision])[0].id,'revision');

const form = {elements:Object.fromEntries(Object.entries(row.data).map(([key,value])=>[key,{value}]))};
for (const kind of Object.keys(fileRules)) form.elements[kind] = {files:[]};
let calls=[],uploads=[],downloads=[],failure='';
const fake = {
 auth:{getSession:async()=>({data:{session:{}}}),getUser:async()=>({data:{user:{id:'owner'}}})},
 rpc:async(name,args)=>{calls.push({name,args});return name==='begin_work_revision' ? {data:'revision'} : {data:'revision'};},
 storage:{from:()=>({list:async()=>({data:[]}),remove:async()=>({data:[]}),download:async path=>{downloads.push(path);return {data:{blob:true}};},upload:async(path,file)=>{if(failure) return {error:new Error('network')};uploads.push({path,file});return {data:{path}};}})},
};
const source = readFileSync(new URL('../src/submissionBackend.js',import.meta.url),'utf8').replace(/\r\n/g,'\n').replace(/^import .*;\n/gm,'').replace(/import\.meta\.env/g,'env').replace(/export /g,'');
const ctx = vm.createContext({env:{VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'},createClient:()=>fake,fileRules,validateFiles,validatePublicSupabaseConfig});
vm.runInContext(source+'\nthis.save=saveWorkRevision;',ctx);
await ctx.save(row,form,null);
assert.equal(downloads.length,5);
assert.ok(uploads.every(file=>file.path.startsWith('revision/')));
assert.equal(calls[0].args.p_id,'original');
assert.ok(!('studentId' in calls[0].args.p_data));
assert.equal(row.status,'approved');
form.elements.gallery.files=[{type:'image/png',size:1024}];
const prior=calls.length;
await assert.rejects(()=>ctx.save(row,form,null),/3 张/);
assert.equal(calls.length,prior);
form.elements.gallery.files=[];
failure='network';
let draftId;
try {await ctx.save(row,form,null);} catch(error) {draftId=error.draftId;}
assert.equal(draftId,'revision');
failure='';calls=[];
await ctx.save(row,form,draftId);
assert.equal(calls[0].args.p_draft_id,'revision');
console.log('My works: escaped editor, version grouping, retained media, private copies, validation and retry passed.');
