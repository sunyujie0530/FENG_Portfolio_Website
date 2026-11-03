begin;

create table public.submission_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table public.submission_creators (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  public_id uuid not null unique default gen_random_uuid()
);
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  contact_email text not null,
  student_id text not null,
  status text not null default 'draft' check (status in ('draft','pending','approved','rejected')),
  review_note text not null default '',
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  reviewed_at timestamptz
);
create index submissions_owner_idx on public.submissions(owner_id);
create index submissions_status_idx on public.submissions(status);
create table public.submission_files (
  submission_id uuid not null references public.submissions(id) on delete cascade,
  path text primary key,
  kind text not null check (kind in ('cover','avatar','gallery','document')),
  mime text not null,
  bytes bigint not null check (bytes > 0)
);

alter table public.submission_admins enable row level security;
alter table public.submission_creators enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_files enable row level security;
-- All writes use checked RPCs. A browser may never set its own review status/admin role.
revoke all on public.submission_admins, public.submission_creators, public.submissions, public.submission_files from anon, authenticated;
grant select on public.submission_admins, public.submissions, public.submission_files to authenticated;

create function public.is_submission_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.submission_admins where user_id = auth.uid());
$$;
revoke all on function public.is_submission_admin() from public;
grant execute on function public.is_submission_admin() to authenticated;
create policy admin_self_read on public.submission_admins for select to authenticated using (user_id = auth.uid());
create policy submission_private_read on public.submissions for select to authenticated
  using (owner_id = auth.uid() or public.is_submission_admin());
create policy submission_file_private_read on public.submission_files for select to authenticated
  using (exists(select 1 from public.submissions s where s.id = submission_id and (s.owner_id = auth.uid() or public.is_submission_admin())));

create function public.begin_submission(p_data jsonb, p_student_id text, p_draft_id uuid default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_email text;
  v_id uuid;
  v_status text;
begin
  select email into v_email from auth.users where id = v_user and email_confirmed_at is not null;
  if v_email is null then raise exception '请先验证邮箱并登录'; end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' or pg_column_size(p_data) > 16384 or
     coalesce(length(p_data->>'studentName'),0) not between 2 and 20 or
     coalesce(length(p_data->>'title'),0) not between 2 and 40 or
     coalesce(length(p_data->>'summary'),0) not between 80 and 500 or
     coalesce(length(p_data->>'roles'),0) > 200 or
     coalesce(p_data->>'grade','') not in ('2024级','2025级','2026级') or
     coalesce(p_data->>'category','') not in ('游戏','动画','3D','视觉设计','交互设计','其他') or
     coalesce(p_data->>'year','') !~ '^20[2-3][0-9]$' or
     (p_data->>'year')::int > 2030 or
     coalesce(p_data->>'lockerNumber','') !~ '^0[1-8]$' or
     coalesce(p_data->>'lockerColor','') !~ '^#[0-9a-fA-F]{6}$' or
     coalesce(p_data->>'lockerAccent','') !~ '^#[0-9a-fA-F]{6}$' or
     coalesce(p_data->>'deco','') !~ '^(-1|[0-7])$' or
     coalesce(length(p_student_id),0) not between 1 and 30 then
    raise exception '投稿资料不完整或格式不正确';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_user::text));
  if p_draft_id is not null then
    select id, status into v_id, v_status from public.submissions where id = p_draft_id and owner_id = v_user for update;
    if v_id is null or v_status not in ('draft','rejected') then raise exception '草稿不存在或已提交，请先查看我的投稿'; end if;
    delete from public.submission_files where submission_id = v_id;
    update public.submissions set data = p_data, student_id = p_student_id, contact_email = v_email,
      status = 'draft', review_note = '', submitted_at = null, reviewed_at = null where id = v_id;
  else
    if (select count(*) from public.submissions where owner_id = v_user and created_at >= now() - interval '1 day') >= 3 then
      raise exception '每个账号每天最多创建 3 份投稿，请继续已有草稿或明天再试';
    end if;
    insert into public.submissions(owner_id,data,contact_email,student_id) values(v_user,p_data,v_email,p_student_id) returning id into v_id;
  end if;
  insert into public.submission_creators(owner_id) values(v_user) on conflict do nothing;
  return v_id;
end;
$$;
revoke all on function public.begin_submission(jsonb,text,uuid) from public;
grant execute on function public.begin_submission(jsonb,text,uuid) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('submissions','submissions',false,20971520,array['image/jpeg','image/png','image/webp','application/pdf']);

create function public.can_upload_submission_file(p_name text) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  -- Serialize uploads with finalization so an in-flight upload cannot alter a submitted file.
  perform 1 from public.submissions s where s.owner_id = auth.uid() and s.status = 'draft'
    and p_name ~ ('^' || s.id::text || '/(cover|avatar|document|gallery-(0[0-9]|1[01]))$') for update;
  return found;
end;
$$;
create function public.can_read_submission_file(p_name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.submissions s where
    split_part(p_name,'/',1) = s.id::text and (
      s.owner_id = auth.uid() or exists(select 1 from public.submission_admins a where a.user_id = auth.uid())
      or (s.status = 'approved' and exists(select 1 from public.submission_files f where f.submission_id = s.id and f.path = p_name))
    ));
$$;
revoke all on function public.can_upload_submission_file(text), public.can_read_submission_file(text) from public;
grant execute on function public.can_upload_submission_file(text) to authenticated;
grant execute on function public.can_read_submission_file(text) to anon, authenticated;
create policy submission_storage_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'submissions' and public.can_upload_submission_file(name));
create policy submission_storage_update on storage.objects for update to authenticated
  using (bucket_id = 'submissions' and public.can_upload_submission_file(name))
  with check (bucket_id = 'submissions' and public.can_upload_submission_file(name));
create policy submission_storage_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'submissions' and public.can_read_submission_file(name));
create policy submission_storage_delete on storage.objects for delete to authenticated
  using (bucket_id = 'submissions' and public.can_upload_submission_file(name));

create function public.finish_submission(p_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_status text;
  v_file record;
  v_kind text;
  v_bytes bigint;
  v_mime text;
  v_total bigint := 0;
  v_gallery bigint := 0;
  v_cover boolean := false;
begin
  select status into v_status from public.submissions where id = p_id and owner_id = auth.uid() for update;
  if v_status = 'pending' then return p_id; end if; -- Safe retry if the final response was lost.
  if v_status is distinct from 'draft' then raise exception '草稿不存在或不能提交'; end if;
  delete from public.submission_files where submission_id = p_id;
  for v_file in select name, metadata from storage.objects where bucket_id = 'submissions' and split_part(name,'/',1) = p_id::text loop
    v_kind := split_part(v_file.name,'/',2);
    v_bytes := coalesce((v_file.metadata->>'size')::bigint,0);
    v_mime := coalesce(v_file.metadata->>'mimetype','');
    if v_kind ~ '^gallery-(0[0-9]|1[01])$' then v_kind := 'gallery'; end if;
    if v_kind not in ('cover','avatar','gallery','document') or v_bytes <= 0 then raise exception '文件记录无效，请重新上传'; end if;
    if v_kind = 'document' then
      if v_mime <> 'application/pdf' or v_bytes > 20971520 then raise exception 'PDF 格式或大小不符合要求'; end if;
    else
      if v_mime not in ('image/jpeg','image/png','image/webp') or v_bytes > (case when v_kind = 'gallery' then 8388608 else 5242880 end) then
        raise exception '图片格式或大小不符合要求';
      end if;
    end if;
    if v_kind = 'cover' then v_cover := true; end if;
    if v_kind = 'gallery' then v_gallery := v_gallery + v_bytes; end if;
    v_total := v_total + v_bytes;
    insert into public.submission_files(submission_id,path,kind,mime,bytes) values(p_id,v_file.name,v_kind,v_mime,v_bytes);
  end loop;
  if not v_cover then raise exception '请上传作品封面'; end if;
  if v_gallery > 62914560 or v_total > 94371840 then raise exception '文件总大小超过限制'; end if;
  update public.submissions set status = 'pending', submitted_at = now() where id = p_id;
  return p_id;
end;
$$;
revoke all on function public.finish_submission(uuid) from public;
grant execute on function public.finish_submission(uuid) to authenticated;

create function public.review_submission(p_id uuid, p_approve boolean, p_note text default '') returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_submission_admin() then raise exception '无审核权限'; end if;
  if p_approve is null or length(coalesce(p_note,'')) > 500 then raise exception '审核参数无效'; end if;
  update public.submissions set status = case when p_approve then 'approved' else 'rejected' end,
    review_note = coalesce(p_note,''), reviewed_at = now()
    where id = p_id and (status = 'pending' or (status = 'approved' and not p_approve));
  if not found then raise exception '投稿状态已变化，请刷新列表'; end if;
end;
$$;
revoke all on function public.review_submission(uuid,boolean,text) from public;
grant execute on function public.review_submission(uuid,boolean,text) to authenticated;

-- Public projection: never return email, student ID, auth user ID or review notes.
create function public.published_catalog() returns setof jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('id',s.id,'creator_id',c.public_id,'published_at',s.reviewed_at,
    'student_name',s.data->>'studentName','grade',s.data->>'grade','title',s.data->>'title',
    'category',s.data->>'category','year',s.data->>'year','summary',s.data->>'summary','roles',s.data->>'roles',
    'files',(select coalesce(jsonb_agg(jsonb_build_object('path',f.path,'kind',f.kind) order by f.path),'[]'::jsonb)
      from public.submission_files f where f.submission_id = s.id))
  from public.submissions s join public.submission_creators c on c.owner_id = s.owner_id
  where s.status = 'approved' order by s.reviewed_at desc;
$$;
revoke all on function public.published_catalog() from public;
grant execute on function public.published_catalog() to anon, authenticated;

commit;
