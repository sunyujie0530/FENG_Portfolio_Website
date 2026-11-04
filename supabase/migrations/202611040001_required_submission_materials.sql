-- Apply after the initial submission migration. Existing published works are unchanged.
begin;

create or replace function public.begin_submission(p_data jsonb, p_student_id text, p_draft_id uuid default null)
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
     coalesce(length(trim(p_data->>'roles')),0) not between 1 and 200 or
     coalesce(p_data->>'grade','') not in ('2024级','2025级','2026级') or
     coalesce(p_data->>'category','') not in ('游戏','动画','3D','视觉设计','交互设计','其他') or
     coalesce(p_data->>'year','') !~ '^20[2-3][0-9]$' or
     (p_data->>'year')::int > 2030 or
     coalesce(p_data->>'lockerNumber','') !~ '^0[1-8]$' or
     coalesce(p_data->>'lockerColor','') !~ '^#[0-9a-fA-F]{6}$' or
     coalesce(p_data->>'lockerAccent','') !~ '^#[0-9a-fA-F]{6}$' or
     coalesce(p_data->>'deco','') !~ '^(-1|[0-7])$' then
    raise exception '投稿资料不完整或格式不正确';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_user::text));
  if p_draft_id is not null then
    select id, status into v_id, v_status from public.submissions where id = p_draft_id and owner_id = v_user for update;
    if v_id is null or v_status not in ('draft','rejected') then raise exception '草稿不存在或已提交，请先查看我的投稿'; end if;
    delete from public.submission_files where submission_id = v_id;
    update public.submissions set data = p_data, student_id = '', contact_email = v_email,
      status = 'draft', review_note = '', submitted_at = null, reviewed_at = null where id = v_id;
  else
    if (select count(*) from public.submissions where owner_id = v_user and created_at >= now() - interval '1 day') >= 3 then
      raise exception '每个账号每天最多创建 3 份投稿，请继续已有草稿或明天再试';
    end if;
    insert into public.submissions(owner_id,data,contact_email,student_id) values(v_user,p_data,v_email,'') returning id into v_id;
  end if;
  insert into public.submission_creators(owner_id) values(v_user) on conflict do nothing;
  return v_id;
end;
$$;

create or replace function public.finish_submission(p_id uuid) returns uuid
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
  v_avatar boolean := false;
  v_gallery_count integer := 0;
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
    if v_kind not in ('cover','avatar','gallery') or v_bytes <= 0 then raise exception '文件记录无效，请重新上传'; end if;
    if v_mime not in ('image/jpeg','image/png','image/webp') or v_bytes > (case when v_kind = 'gallery' then 8388608 else 5242880 end) then
      raise exception '图片格式或大小不符合要求';
    end if;
    if v_kind = 'cover' then v_cover := true; end if;
    if v_kind = 'avatar' then v_avatar := true; end if;
    if v_kind = 'gallery' then v_gallery := v_gallery + v_bytes; v_gallery_count := v_gallery_count + 1; end if;
    v_total := v_total + v_bytes;
    insert into public.submission_files(submission_id,path,kind,mime,bytes) values(p_id,v_file.name,v_kind,v_mime,v_bytes);
  end loop;
  if not v_avatar then raise exception '请上传个人头像'; end if;
  if v_gallery_count <> 3 then raise exception '请上传恰好 3 张展示图片'; end if;
  if not v_cover then raise exception '请上传作品封面'; end if;
  if v_gallery > 25165824 or v_total > 94371840 then raise exception '文件总大小超过限制'; end if;
  update public.submissions set status = 'pending', submitted_at = now() where id = p_id;
  return p_id;
end;
$$;

commit;
