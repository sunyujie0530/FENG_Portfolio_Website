import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileRules,validateFiles } from '../src/submissionData.js';
import { validatePublicSupabaseConfig } from '../src/backendConfig.js';

const source = readFileSync(new URL('../src/submissionBackend.js',import.meta.url),'utf8')
  .replace(/^import .*;\n/gm,'').replace(/import\.meta\.env/g,'env').replace(/export /g,'');
const values = {studentName:'学生甲',title:'测试作品',grade:'2025级',category:'3D',year:'2026',roles:'独立完成',summary:'作品介绍。'.repeat(20),lockerNumber:'01',lockerColor:'#9aa3ac',lockerAccent:'#2aa800',studentId:'private-id'};
const form = {elements:Object.fromEntries(Object.entries(values).map(([name,value]) => [name,{value}]))};
for (const kind of Object.keys(fileRules)) form.elements[kind] = {files:[]};
form.elements.cover.files = [{size:1000,type:'image/png'}];
form.elements.document.files = [{size:1000,type:'application/pdf'}];
let failure = '', status = 'draft', rpcCalls = [], uploaded = [], removed = [];
const storage = new Map();
const fake = {
  auth:{ getSession:async () => ({data:{session:{}}}),getUser:async () => ({data:{user:{id:'user-1',email:'test@example.com'}}}) },
  rpc:async (name,args) => {
    rpcCalls.push({name,args});
    if (name === 'begin_submission') return {data:'draft-1'};
    if (failure === 'finish-response') {status = 'pending'; return {error:new Error('response lost')};}
    status = 'pending'; return {data:'draft-1'};
  },
  storage:{from:() => ({
    list:async () => ({data:[{name:'gallery-11'}]}),
    remove:async paths => {removed.push(...paths); return {data:[]};},
    upload:async (path,file) => {if (failure === 'upload') return {error:new Error('network')}; uploaded.push({path,type:file.type});return {data:{path}};},
  })},
  from:() => ({select:() => ({eq:() => ({single:async () => ({data:{status}})})})}),
};
const context = vm.createContext({env:{VITE_SUPABASE_URL:'https://example.supabase.co',VITE_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test'},createClient:() => fake,fileRules,validateFiles,validatePublicSupabaseConfig,
  sessionStorage:{getItem:key => storage.get(key),setItem:(key,value) => storage.set(key,value),removeItem:key => storage.delete(key)},
  document:{querySelector:() => ({dataset:{deco:'-1'}})},
});
vm.runInContext(source + '\nthis.upload = uploadSubmission;',context);
failure = 'upload';
await assert.rejects(() => context.upload(form),/network/);
assert.equal(storage.get('feng-upload-draft:user-1'),'draft-1');
assert.equal(rpcCalls.filter(call => call.name === 'finish_submission').length,0);
failure = ''; rpcCalls = []; uploaded = [];
await context.upload(form);
assert.equal(rpcCalls[0].args.p_draft_id,'draft-1');
assert.ok(removed.includes('draft-1/gallery-11'));
assert.deepEqual(uploaded.map(file => file.path),['draft-1/cover','draft-1/document']);
assert.equal(storage.has('feng-upload-draft:user-1'),false);
assert.equal(rpcCalls.at(-1).name,'finish_submission');
failure = 'finish-response';
assert.equal(await context.upload(form),'draft-1');
assert.equal(storage.has('feng-upload-draft:user-1'),false);
console.log('Upload orchestration: interrupted upload preserves draft, stale slots removed, safe retry and finalization passed.');
