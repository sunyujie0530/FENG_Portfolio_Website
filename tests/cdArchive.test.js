import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createCdArchive,updateCdArchive,cdArchiveHit} from '../src/cdArchive.js';

globalThis.document={createElement:()=>({getContext:()=>new Proxy({}, {
  get:(_,name)=>name==='createLinearGradient'?()=>({addColorStop(){}}):()=>{},set:()=>true
})})};
const archive=createCdArchive();
const pile=new THREE.Group();pile.scale.setScalar(2.05);pile.position.set(0,1.95,-.1);pile.add(archive);archive.position.z=.1;
const rest=archive.userData.parts.map(p=>p.group.position.clone());
const player=archive.userData.player;
assert.equal(archive.scale.x,.78);
let playerCount=0;archive.traverse(n=>{if(n.name.startsWith('cd-player-'))playerCount++;});
assert.equal(playerCount,1);
const settled=(part)=>{for(let i=0;i<120;i++)updateCdArchive(archive,part,1/60);};
const withinCabinet=()=>{
  const box=new THREE.Box3().setFromObject(pile);
  assert.ok(box.min.x>-.54&&box.max.x<.54,`x ${box.min.x}..${box.max.x}`);
  assert.ok(box.min.y>1.0&&box.max.y<3.05,`y ${box.min.y}..${box.max.y}`);
};
withinCabinet();settled('player');withinCabinet();
assert.equal(player.userData.hover,1);assert.equal(archive.userData.hover,0);
archive.userData.parts.forEach((p,i)=>assert.ok(p.group.position.equals(rest[i])));
settled('accessories');withinCabinet();
assert.equal(player.userData.hover,0);assert.equal(archive.userData.hover,1);
archive.userData.parts.forEach((p,i)=>assert.ok(!p.group.position.equals(rest[i])));
settled(null);withinCabinet();
assert.equal(player.userData.hover,0);assert.equal(archive.userData.hover,0);
archive.userData.parts.forEach((p,i)=>assert.ok(p.group.position.equals(rest[i])));
assert.equal(cdArchiveHit(player.getObjectByName('disc')).part,'player');
assert.equal(cdArchiveHit(archive.getObjectByName('coiled-cable')).part,'accessories');
assert.equal(cdArchiveHit(new THREE.Mesh()),null);
updateCdArchive(archive,'player',0,true);assert.equal(player.userData.hover,1);assert.equal(archive.userData.hover,0);
updateCdArchive(archive,'accessories',0,true);assert.equal(player.userData.hover,0);assert.equal(archive.userData.hover,1);
let triangles=0,meshes=0;
archive.traverse(n=>{if(n.isMesh){assert.ok(n.name);meshes++;triangles+=(n.geometry.index?n.geometry.index.count:n.geometry.attributes.position.count)/3*(n.isInstancedMesh?n.count:1);}});
assert.ok(triangles<30000,`Triangle budget: ${triangles}`);
console.log(`Archive bounds, one player, separate hover zones and retraction passed. ${meshes} meshes / ${triangles} triangles.`);
