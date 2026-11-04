import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {publishedDetail} from '../src/publishedViews.js';
const work={title:'测试作品',authorName:'作者甲',authorGrade:'2026级',year:'2026',creatorId:'creator',roles:'独立完成',summary:'第一段\n第二段',cover:'/cover.png',kind:'game',files:[{kind:'gallery',url:'/gallery.png'},{kind:'document',url:'/file.pdf'}]};
const markup=publishedDetail(work,'全部作品');
for(const cls of ['work-detail__hero','work-detail__intro','work-detail__content','work-detail__body','work-detail__gallery','scroll-more']) assert.ok(markup.includes(cls));
for(const url of ['/cover.png','/gallery.png','/file.pdf']) assert.ok(markup.includes(url));
assert.ok(markup.includes('<p>第一段</p><p>第二段</p>'));
const src=readFileSync(new URL('../src/worksDiscs.js',import.meta.url),'utf8');
let disposed=0,removed=0,opened=[];
const material=()=>({map:{dispose(){disposed++;}},dispose(){disposed++;}});
const ctx=vm.createContext({COUNT:20,resetDetail(){},discs:[],scene:{add(){},remove(){removed++;}},detailPanels:new Map(),detailFactories:{},COVER_ART:{},BACK_ART:{},DISC_KIND:{},geometry:{},palettes:[[]],hubMaterial:{},darkHub:{},rimMaterial:{},discParts:{},createPublishedDetail(){},closeDetail(){},
 createDisc(index){return {userData:{index,glow:{material:material()},halo:{material:material()}},children:[{geometry:{dispose(){disposed++;}},material:[material(),{},material()]}]};},
 openRoutedDetail(index){opened.push(index);},
});
vm.runInContext(src.match(/  openPublishedDetail = \(work, onBack, backLabel\) => \{[\s\S]*?\n  \};/)[0],ctx);
ctx.openPublishedDetail(work,()=>{},'全部作品');
ctx.openPublishedDetail({...work,cover:'/second.png'},()=>{},'作者作品');
assert.equal(ctx.discs.length,1);
assert.equal(ctx.discs[0].userData.uploaded,true);
assert.equal(ctx.COVER_ART[20],'/second.png');
assert.equal(removed,1); assert.equal(disposed,7); assert.deepEqual(opened,[20,20]);
console.log('Published works: shared detail layout, all media, repeat navigation and bounded GPU resources passed.');
