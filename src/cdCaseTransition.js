import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createCdCase } from './cdCase.js';
import { detailDiscScreenPose } from './workDetailMotion.js';

export const CD_CASE_TRANSITION_DURATION=1450;
let cachedScene;

function disposeScene(resources) {
  if(!resources)return;
  const geometries=new Set(),materials=new Set();
  resources.model?.traverse(node=>{if(node.geometry)geometries.add(node.geometry);if(node.material)for(const material of Array.isArray(node.material)?node.material:[node.material])materials.add(material);});
  geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());
  resources.texture?.dispose();resources.environment?.dispose();resources.renderer?.domElement.remove();resources.renderer?.dispose();resources.renderer?.forceContextLoss();
}

export function cdCaseTransitionPose(progress) {
  const phase=(start,end)=>THREE.MathUtils.smootherstep(progress,start,end);
  return {enlarge:phase(0,.28),open:phase(.25,.58),detach:phase(.72,.88),depart:phase(.88,1)};
}

export async function playCdCaseTransition(element, enterDetail, {reverse=false,rect:savedRect}={}) {
  const image=element.querySelector('img');
  if (!image?.complete || !image.naturalWidth || document.body.classList.contains('no-webgl') || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if(reverse)await enterDetail?.();
    return true;
  }
  let origin=location.pathname;
  let rect=savedRect || element.getBoundingClientRect();
  const overlay=document.createElement('div');
  overlay.className='cd-case-transition';
  overlay.dataset.direction=reverse?'exit':'enter';
  overlay.setAttribute('role','status');
  overlay.setAttribute('aria-label',`正在${reverse?'收回':'打开'}${image.alt.replace(/封面$/,'')}`);
  if(cachedScene?.renderer.getContext().isContextLost()){disposeScene(cachedScene);cachedScene=null;}
  const canvas=cachedScene?.renderer.domElement || document.createElement('canvas');
  canvas.setAttribute('aria-hidden','true');overlay.append(canvas);
  let renderer,model,environment,texture,frame=0;
  const hidden=new Map();
  const hide=target=>{hidden.set(target,target.style.visibility);target.style.visibility='hidden';};
  const restore=()=>hidden.forEach((visibility,target)=>{target.style.visibility=visibility;});
  try {
    renderer=cachedScene?.renderer || new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    renderer.setSize(innerWidth,innerHeight);
    renderer.setClearColor(0,0);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    const picture=cachedScene?.picture || document.createElement('canvas');picture.width=picture.height=1024;
    const side=Math.min(image.naturalWidth,image.naturalHeight);
    picture.getContext('2d').drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,0,0,1024,1024);
    texture=cachedScene?.texture || new THREE.CanvasTexture(picture);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    let scene=cachedScene?.scene;
    if(cachedScene){model=cachedScene.model;environment=cachedScene.environment;}
    else{
      scene=new THREE.Scene();
      const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
      environment=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();
      scene.environment=environment.texture;scene.environmentIntensity=.65;
      scene.add(new THREE.HemisphereLight(0xffffff,0x8795a1,1.2));
      const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(-3,7,6);scene.add(light);
      model=createCdCase({cover:texture});
      // ponytail: alpha glass during motion; enable transmission here for full refraction.
      model.traverse(node=>{if(node.material)for(const material of Array.isArray(node.material)?node.material:[node.material])if(material.transmission)material.transmission=0;});
      scene.add(model);
      cachedScene={renderer,scene,model,environment,texture,picture};
    }
    const width=innerWidth,height=innerHeight;
    const camera=new THREE.OrthographicCamera(-width/2,width/2,height/2,-height/2,.1,4000);
    camera.position.z=1000;
    const panel=document.querySelector('.work-detail:not([hidden])');
    const scroll=reverse?THREE.MathUtils.smoothstep(panel?.scrollTop || 0,0,height):0;
    const destination=detailDiscScreenPose(width,height,scroll);
    const drawPose=progress=>{
      const pose=cdCaseTransitionPose(progress);
      overlay.dataset.phase=pose.depart>0?'depart':pose.detach>0?'detach':pose.open===1?'opened':pose.open>0?'open':'enlarge';
      const startScale=rect.width/2.84,targetScale=Math.min(420,width*.46,height*.44)/2.84;
      const startX=rect.left+rect.width/2-width/2,startY=height/2-rect.top-rect.height/2;
      const scale=THREE.MathUtils.lerp(startScale,targetScale,pose.enlarge);
      model.scale.setScalar(scale);
      model.position.set(THREE.MathUtils.lerp(startX,0,pose.enlarge)+1.19*scale*pose.open,THREE.MathUtils.lerp(startY,0,pose.enlarge),0);
      model.userData.lid.rotation.y=-Math.PI*.97*pose.open;
      const disc=model.userData.disc;
      disc.position.set(THREE.MathUtils.lerp(.13,(destination.x-width/2-model.position.x)/scale,pose.depart),THREE.MathUtils.lerp(pose.detach*.35,(height/2-destination.y)/scale,pose.depart),.005+pose.detach*.9+pose.depart*1.2);
      disc.rotation.set(pose.detach*.08*(1-pose.depart),-pose.detach*.16*(1-pose.depart),0);
      disc.scale.setScalar(THREE.MathUtils.lerp(1,destination.radius/(scale*1.105),pose.depart));
      overlay.style.backgroundColor=`rgba(242,244,245,${pose.enlarge*.94})`;
      renderer.render(scene,camera);
    };
    let finishPage=enterDetail;
    document.body.append(overlay);
    if(reverse){
      drawPose(1);
      await overlay.animate([{opacity:0},{opacity:1}],{duration:100,easing:'ease-out'}).finished;
      const target=await enterDetail?.();
      if(!target?.isConnected)return false;
      element=target;rect=target.getBoundingClientRect();origin=location.pathname;hide(target);
      finishPage=async()=>{
        try{await target.querySelector('img')?.decode();}catch{}
        restore();
        await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      };
    }else{hide(element);drawPose(0);}
    return await new Promise(resolve=>{
      let settled=false,start;
      const finish=completed=>{
        if(settled)return;settled=true;cancelAnimationFrame(frame);
        window.removeEventListener('popstate',cancel);window.removeEventListener('resize',cancel);window.removeEventListener('keydown',onKey,true);
        window.removeEventListener('pagehide',cancel);
        resolve(completed);
      };
      const cancel=()=>finish(false);
      const onKey=event=>{if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();cancel();}};
      window.addEventListener('popstate',cancel);window.addEventListener('resize',cancel);window.addEventListener('keydown',onKey,true);
      window.addEventListener('pagehide',cancel);
      const tick=async time=>{
        if(!element.isConnected || location.pathname!==origin){cancel();return;}
        start ??= time;
        const progress=Math.min(1,(time-start)/CD_CASE_TRANSITION_DURATION);
        try{drawPose(reverse?1-progress:progress);}catch{finish(true);return;}
        if(progress===1){
          overlay.dataset.phase='handoff';
          try {
            await finishPage?.();
            if(settled)return;
            overlay.dataset.phase='reveal';
            await overlay.animate([{opacity:1},{opacity:0}],{duration:160,easing:'ease-out',fill:'forwards'}).finished;
          } catch(error) { console.warn('CD 页面交接未完成',error.message); }
          finish(true);
        } else frame=requestAnimationFrame(tick);
      };
      frame=requestAnimationFrame(tick);
    });
  } finally {
    cancelAnimationFrame(frame);overlay.remove();restore();
    if(!cachedScene || cachedScene.renderer!==renderer)disposeScene({renderer,model,environment,texture});
  }
}

if(typeof window!=='undefined')window.addEventListener('pagehide',()=>{disposeScene(cachedScene);cachedScene=null;});
