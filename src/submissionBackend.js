import { createClient } from '@supabase/supabase-js';
import { fileRules, validateFiles } from './submissionData.js';
import { validatePublicSupabaseConfig } from './backendConfig.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const backendConfigured = validatePublicSupabaseConfig(url,key);
// No secret/service_role key is used in the browser. SQL policies enforce every permission.
export const backend = backendConfigured ? createClient(url, key) : null;
export const checked = result => { if (result.error) throw result.error; return result.data; };
export async function currentUser() {
  if (!backend) return null;
  if (!checked(await backend.auth.getSession())?.session) return null;
  return checked(await backend.auth.getUser())?.user || null;
}
export async function isAdmin() {
  return backend && await currentUser() ? Boolean(checked(await backend.rpc('is_submission_admin'))) : false;
}
export async function signedFiles(files, force = false) {
  return Promise.all(files.map(async file => {
    if (!force && file.url && file.expiresAt > Date.now() + 60000) return file;
    const signed = checked(await backend.storage.from('submissions').createSignedUrl(file.path, 300,
      file.kind === 'document' ? { download:'作品资料.pdf' } : {}));
    return { ...file, url:signed.signedUrl, expiresAt:Date.now() + 300000 };
  }));
}
export async function publishedCatalog() {
  if (!backend) return [];
  const rows = checked(await backend.rpc('published_catalog'));
  return Promise.all(rows.map(async row => ({ ...row, files:await signedFiles(row.files) })));
}
export async function mySubmissions() {
  const user = await currentUser();
  return user ? checked(await backend.from('submissions').select('id,data,status,review_note,created_at').eq('owner_id',user.id).order('created_at',{ ascending:false })) : [];
}
export async function uploadSubmission(form, onProgress = () => {}) {
  if (!backend) throw new Error('后端尚未配置，文件没有上传。请先完成配置说明。');
  const user = await currentUser();
  if (!user) throw new Error('请先完成邮箱验证并登录');
  const { errors } = validateFiles(form);
  if (errors.length) throw new Error(errors.join('；'));
  const data = Object.fromEntries(['studentName','title','grade','category','year','roles','summary']
    .map(name => [name,form.elements[name].value.trim()]));
  if (!data.roles) throw new Error('请填写团队成员与分工，个人作品可填写独立完成');
  // Legacy RPC fields remain internal defaults until the local migration is deployed.
  Object.assign(data,{lockerNumber:'01',lockerColor:'#9aa3ac',lockerAccent:'#2aa800'});
  data.deco = String(document.querySelector('#deco-scroller .is-on')?.dataset.deco || '-1');
  const draftKey = `feng-upload-draft:${user.id}`;
  const draft = sessionStorage.getItem(draftKey);
  const id = checked(await backend.rpc('begin_submission', { p_data:data, p_student_id:'未采集', p_draft_id:draft || null }));
  sessionStorage.setItem(draftKey,id);
  const files = Object.keys(fileRules).flatMap(kind => [...form.elements[kind].files].map((file,index) => ({ file, path:`${id}/${kind === 'gallery' ? `gallery-${String(index).padStart(2,'0')}` : kind}` })));
  // Retry uses the same draft and stable slots. Remove stale slots from the previous failed attempt.
  const existing = checked(await backend.storage.from('submissions').list(id));
  const stale = existing.map(file => `${id}/${file.name}`).filter(path => !files.some(file => file.path === path));
  if (stale.length) checked(await backend.storage.from('submissions').remove(stale));
  let complete = 0;
  for (const { file, path } of files) {
    onProgress(`正在上传 ${complete + 1} / ${files.length} 个文件…`);
    checked(await backend.storage.from('submissions').upload(path,file,{ contentType:file.type, upsert:true, cacheControl:'300' }));
    complete++;
  }
  onProgress('文件已上传，正在提交审核…');
  try { checked(await backend.rpc('finish_submission',{ p_id:id })); }
  catch (error) {
    // A lost final response must not create a duplicate submission or clear the form incorrectly.
    const existing = checked(await backend.from('submissions').select('status').eq('id',id).single());
    if (existing.status !== 'pending') throw error;
  }
  sessionStorage.removeItem(draftKey);
  return id;
}
export function resumeDraft(id, userId) {
  sessionStorage.setItem(`feng-upload-draft:${userId}`,id);
}

export async function ownedWorks() {
  const user = await currentUser();
  if (!user) return [];
  const rows = checked(await backend.from('submissions')
    .select('*,submission_files(*)')
    .eq('owner_id',user.id).order('created_at',{ascending:false}));
  return Promise.all(rows.map(async row => ({...row,files:await signedFiles(row.submission_files)})));
}

export async function saveWorkRevision(row,form,draftId,onProgress = () => {}) {
  if (!await currentUser()) throw new Error('请先登录');
  const data = {...row.data,...Object.fromEntries(['studentName','title','grade','category','year','roles','summary','deco']
    .map(name => [name,form.elements[name].value.trim()]))};
  if (!data.roles) throw new Error('请填写团队成员与分工');
  const groups = Object.fromEntries(Object.keys(fileRules).map(kind => {
    const selected = [...form.elements[kind].files];
    return [kind,selected.length ? selected : row.files.filter(file => file.kind === kind).map(file => ({
      type:file.mime,size:file.bytes,path:file.path,
    }))];
  }));
  const {errors} = validateFiles({elements:Object.fromEntries(Object.entries(groups).map(([kind,files]) => [kind,{files}]))});
  if (errors.length) throw new Error(errors.join('；'));
  let id = draftId;
  try {
    const result = await backend.rpc('begin_work_revision',{p_id:row.id,p_data:data,p_draft_id:id || null});
    if (result.error?.code === 'PGRST202') throw new Error('编辑服务尚未启用，需要先应用作品编辑数据库迁移');
    id = checked(result);
    const files = Object.entries(groups).flatMap(([kind,files]) => files.map((file,index) => ({file,path:`${id}/${kind === 'gallery' ? `gallery-${String(index).padStart(2,'0')}` : kind}`})));
    const existing = checked(await backend.storage.from('submissions').list(id));
    const stale = existing.map(file => `${id}/${file.name}`).filter(path => !files.some(file => file.path === path));
    if (stale.length) checked(await backend.storage.from('submissions').remove(stale));
    for (const [index,item] of files.entries()) {
      onProgress(`正在保存图片 ${index + 1} / ${files.length}…`);
      if (item.file.path) {
        if (item.file.path === item.path) continue;
        // Copy immutable originals into the private revision; published files stay untouched.
        const content = checked(await backend.storage.from('submissions').download(item.file.path));
        checked(await backend.storage.from('submissions').upload(item.path,content,{contentType:item.file.type,upsert:true}));
      } else checked(await backend.storage.from('submissions').upload(item.path,item.file,{contentType:item.file.type,upsert:true}));
    }
    try { checked(await backend.rpc('finish_submission',{p_id:id})); }
    catch (error) {
      const saved = checked(await backend.from('submissions').select('status').eq('id',id).single());
      if (saved.status !== 'pending') throw error;
    }
    return id;
  } catch (error) { error.draftId = id; throw error; }
}
