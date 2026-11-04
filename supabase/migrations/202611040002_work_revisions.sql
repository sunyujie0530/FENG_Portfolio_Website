-- Local migration: review revisions before replacing the published version.
begin;
alter table public.submissions add column work_id uuid references public.submissions(id);
create index submissions_work_idx on public.submissions(work_id);

create function public.begin_work_revision(p_id uuid,p_data jsonb,p_draft_id uuid default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_source public.submissions; v_id uuid; v_root uuid;
begin
  select * into v_source from public.submissions where id=p_id and owner_id=auth.uid();
  if not found then raise exception '作品不存在或不属于当前账号'; end if;
  v_root := coalesce(v_source.work_id,v_source.id);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_root::text));
  if p_draft_id is not null and not exists(select 1 from public.submissions where id=p_draft_id and owner_id=auth.uid() and work_id=v_root and status='draft') then
    raise exception '修改草稿不存在或已经提交';
  end if;
  v_id := public.begin_submission(p_data,'',p_draft_id);
  update public.submissions set work_id=v_root where id=v_id;
  return v_id;
end;
$$;
revoke all on function public.begin_work_revision(uuid,jsonb,uuid) from public;
grant execute on function public.begin_work_revision(uuid,jsonb,uuid) to authenticated;

alter function public.finish_submission(uuid) rename to finish_submission_materials;
revoke all on function public.finish_submission_materials(uuid) from public,anon,authenticated;
create function public.finish_submission(p_id uuid) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_root uuid; v_result uuid;
begin
  select coalesce(work_id,id) into v_root from public.submissions where id=p_id and owner_id=auth.uid();
  if v_root is null then raise exception '作品不存在或不属于当前账号'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_root::text));
  v_result := public.finish_submission_materials(p_id);
  update public.submissions set status='rejected',review_note='已有新的修改稿提交审核。'
    where id<>p_id and coalesce(work_id,id)=v_root and status='pending';
  return v_result;
end;
$$;
revoke all on function public.finish_submission(uuid) from public;
grant execute on function public.finish_submission(uuid) to authenticated;

alter function public.review_submission(uuid,boolean,text) rename to review_submission_version;
revoke all on function public.review_submission_version(uuid,boolean,text) from public,anon,authenticated;
create function public.review_submission(p_id uuid,p_approve boolean,p_note text default '') returns void
language plpgsql security definer set search_path = '' as $$
declare v_root uuid;
begin
  if not public.is_submission_admin() then raise exception '无审核权限'; end if;
  select coalesce(work_id,id) into v_root from public.submissions where id=p_id;
  if v_root is null then raise exception '投稿不存在'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_root::text));
  if p_approve then
    update public.submissions set status='rejected',review_note='已由审核通过的新版本替换。'
      where id<>p_id and coalesce(work_id,id)=v_root and status in ('approved','pending');
  end if;
  perform public.review_submission_version(p_id,p_approve,p_note);
end;
$$;
revoke all on function public.review_submission(uuid,boolean,text) from public;
grant execute on function public.review_submission(uuid,boolean,text) to authenticated;
create unique index submissions_one_published_version on public.submissions((coalesce(work_id,id))) where status='approved';

create or replace function public.published_catalog() returns setof jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('id',coalesce(s.work_id,s.id),'creator_id',c.public_id,'published_at',s.reviewed_at,
    'student_name',s.data->>'studentName','grade',s.data->>'grade','title',s.data->>'title',
    'category',s.data->>'category','year',s.data->>'year','summary',s.data->>'summary','roles',s.data->>'roles',
    'files',(select coalesce(jsonb_agg(jsonb_build_object('path',f.path,'kind',f.kind) order by f.path),'[]'::jsonb)
      from public.submission_files f where f.submission_id = s.id))
  from public.submissions s join public.submission_creators c on c.owner_id = s.owner_id
  where s.status = 'approved' order by s.reviewed_at desc;
$$;

commit;
