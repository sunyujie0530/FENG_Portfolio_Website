import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as THREE from 'three';
import { createDiscGeometry } from '../src/discGeometry.js';
import { cdIntroMarkup } from '../src/studentLanding.js';

const read = file => readFileSync(new URL(`../src/${file}`,import.meta.url),'utf8').replace(/\r\n/g,'\n');
let now = 1000000, signed = 0, fail = false;
const signing = vm.createContext({
  Date:{now:() => now}, checked:result => {if (result.error) throw result.error;return result.data;},
  backend:{storage:{from:() => ({createSignedUrl:async (path,ttl) => {
    assert.equal(ttl,300);
    if (fail) return {error:new Error('network')};
    return {data:{signedUrl:`/${path}?version=${++signed}`}};
  }})}},
});
vm.runInContext(read('submissionBackend.js').match(/export async function signedFiles[\s\S]*?\n\}/)[0].replace('export ',''),signing);
let files = await signing.signedFiles([{kind:'cover',path:'cover'}]);
assert.equal(signed,1);
assert.equal(files[0].expiresAt,now + 300000);
assert.equal((await signing.signedFiles(files))[0].url,files[0].url);
assert.equal(signed,1,'Fresh signatures are reused');
now += 241000;
files = await signing.signedFiles(files);
assert.equal(signed,2,'Near-expiry signatures are renewed');
await signing.signedFiles(files,true);
assert.equal(signed,3,'A failed image can force a fresh signature');
fail = true;
await assert.rejects(() => signing.signedFiles(files,true),/network/);

const image = {attributes:{src:'/old'},getAttribute(name){return this.attributes[name];},setAttribute(name,value){this.attributes[name]=value;},matches:() => false};
const work = {uploaded:true,cover:'/old',files:[{kind:'cover',path:'cover',url:'/old',expiresAt:0}]};
let renewalCalls = 0, eventCount = 0;
const media = vm.createContext({
  WORKS:[work],backendConfigured:true,Date:{now:() => now},console,
  signedFiles:async () => {renewalCalls++;return [{kind:'cover',path:'cover',url:'/renewed',expiresAt:now + 300000}];},
  document:{querySelectorAll:() => [image]},
  window:{dispatchEvent:event => {assert.equal(event.detail.get('/old'),'/renewed');eventCount++;}},
  CustomEvent:class {constructor(type,{detail}){this.type=type;this.detail=detail;}},
});
const browse = read('browse.js');
vm.runInContext(browse.slice(browse.indexOf('  let mediaRefresh,'),browse.indexOf('  const retryMedia ='))+'\nthis.renew = renewMedia;',media);
await Promise.all([media.renew(),media.renew()]);
assert.equal(renewalCalls,1,'Concurrent renewals share one request');
assert.equal(eventCount,1);
assert.equal(work.cover,'/renewed');
assert.equal(image.attributes.src,'/renewed','Existing images update without rerendering the view');
await media.renew();
assert.equal(renewalCalls,1);

let requests = [], disposed = 0;
const art = {1:'/front'}, backs = {1:'/back'};
const context = vm.createContext({
  THREE,COVER_ART:art,BACK_ART:backs,DISC_KIND:{1:'game'},
  faceTexture:() => null,
  coverTexture:url => {requests.push(url);return {dispose(){disposed++;}};},
});
const discsSource = read('worksDiscs.js');
vm.runInContext(discsSource.slice(discsSource.indexOf('function createDisc('),discsSource.indexOf('function hubGeometry(')),context);
const parts = Object.fromEntries(['outerHub','innerHub','rim','glow','halo'].map(key => [key,new THREE.BoxGeometry()]));
const material = new THREE.MeshBasicMaterial();
const disc = context.createDisc(1,createDiscGeometry(),[],material,material,material,parts);
assert.deepEqual(requests,[],'Constructing a hidden disc must not fetch images');
disc.userData.loadArt();
disc.userData.loadArt();
assert.deepEqual(requests,['/front','/back']);
art[1] = '/renewed'; backs[1] = '/renewed';
disc.userData.loadArt();
assert.equal(disposed,2,'Renewed covers release previous GPU textures');
assert.deepEqual(requests,['/front','/back','/renewed','/renewed']);

const markup = cdIntroMarkup([{id:'demo',title:'作品',cover:'/cover.webp'}]);
assert.ok(markup.includes('data-src="/cover.webp"'));
assert.ok(!markup.includes('<img src='),'Homepage orbit images wait for the section to approach');
assert.ok(browse.includes("else if (path === '/works')"),'Only the list route renders the collection');

const classes = new Set(), listeners = new Map();
let initialized = 0, shown = '';
const fallback = vm.createContext({
  loadMain:async () => {throw new Error('Error creating WebGL context');},
  console:{error(){}},
  browseModule:{initBrowse(showScene,options) {assert.equal(options.plain,true);initialized++;showScene('submit');}},
  portalModule:{hidePortals(){},showPortal:name => {shown=name;}},
  document:{body:{classList:{add:name => classes.add(name)}},addEventListener:(type,fn) => listeners.set(type,fn)},
});
const bootstrap = read('bootstrap.js').replace("await import('./main.js')",'await loadMain()')
  .replace("import('./browse.js')",'Promise.resolve(browseModule)')
  .replace("import('./portal.js')",'Promise.resolve(portalModule)');
await vm.runInContext(`(async () => {${bootstrap}})()`,fallback);
assert.equal(initialized,1);
assert.ok(classes.has('no-webgl'));
assert.equal(shown,'submit');
assert.ok(listeners.has('webglcontextlost'));
console.log('Reliability: expiring signatures, concurrent renewal, live media updates and lazy GPU/home images passed.');
