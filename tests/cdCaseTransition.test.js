import assert from 'node:assert/strict';
import {cdCaseTransitionPose,CD_CASE_TRANSITION_DURATION,playCdCaseTransition} from '../src/cdCaseTransition.js';
import {detailDiscScreenPose} from '../src/workDetailMotion.js';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

assert.deepEqual(cdCaseTransitionPose(-1),{enlarge:0,open:0,detach:0,depart:0});
assert.ok(CD_CASE_TRANSITION_DURATION<1600,'Entry and exit use the faster shared duration');
assert.deepEqual(cdCaseTransitionPose(2),{enlarge:1,open:1,detach:1,depart:1});
assert.equal(cdCaseTransitionPose(.25).enlarge>0,true);
assert.equal(cdCaseTransitionPose(.6).open,1);
assert.equal(cdCaseTransitionPose(.6).detach,0,'The disc stays in its tray until the box is open');
assert.equal(cdCaseTransitionPose(.88).detach,1);
assert.equal(cdCaseTransitionPose(.88).depart,0,'Navigation starts after detachment');
assert.ok(cdCaseTransitionPose(.28).enlarge-cdCaseTransitionPose(.27).enlarge < cdCaseTransitionPose(.14).enlarge-cdCaseTransitionPose(.13).enlarge,'The case decelerates before it settles');
let skippedReturn=0;
await playCdCaseTransition({querySelector:()=>null},async()=>{skippedReturn++;},{reverse:true});
assert.equal(skippedReturn,1,'Exit navigation still completes if animation cannot run');
let previous=cdCaseTransitionPose(0);
for(let step=1;step<=100;step++){
  const pose=cdCaseTransitionPose(step/100);
  for(const key of Object.keys(pose))assert.ok(pose[key]>=previous[key]&&pose[key]<=1);
  previous=pose;
}
let reverse=cdCaseTransitionPose(1);
for(let step=1;step<=100;step++){
  const pose=cdCaseTransitionPose(1-step/100);
  for(const key of Object.keys(pose))assert.ok(pose[key]<=reverse[key]);
  reverse=pose;
}
console.log('CD case transition: enlarge, open, detach and departure stay ordered and monotonic.');
assert.deepEqual(detailDiscScreenPose(1000,800),{x:880,y:400,radius:320});
const mobile=detailDiscScreenPose(400,800);
assert.equal(mobile.x,200);assert.equal(mobile.radius,136);assert.equal(mobile.y,306);
assert.ok(detailDiscScreenPose(900,1000).x-detailDiscScreenPose(900,1000).radius>900*.5,'The desktop disc stays clear of the text column in tall windows');
assert.ok(detailDiscScreenPose(390,844).y-detailDiscScreenPose(390,844).radius>=170,'The mobile disc stays below navigation and the back button');
assert.deepEqual(detailDiscScreenPose(1000,800,1),{x:905,y:152,radius:50});
assert.deepEqual(detailDiscScreenPose(400,800,1),{x:362,y:190,radius:20});

// Keep the outgoing disc visible until the incoming page and its first frame are ready.
const source=readFileSync(new URL('../src/cdCaseTransition.js',import.meta.url),'utf8');
const handoff=source.slice(source.indexOf("          overlay.dataset.phase='handoff';"),source.indexOf('        } else frame='));
let ready,fade;
const order=[];
const context=vm.createContext({
  overlay:{dataset:{},animate(){order.push('reveal');return {finished:new Promise(resolve=>{fade=resolve;})};}},
  finishPage(){order.push('enter');return new Promise(resolve=>{ready=resolve;});},
  settled:false,console,finish:completed=>order.push(completed?'finished':'cancelled'),
});
const completion=vm.runInContext(`(async()=>{${handoff}})()`,context);
assert.deepEqual(order,['enter']);
assert.equal(context.overlay.dataset.phase,'handoff');
ready();await new Promise(setImmediate);
assert.deepEqual(order,['enter','reveal']);
fade();await completion;
assert.deepEqual(order,['enter','reveal','finished']);
