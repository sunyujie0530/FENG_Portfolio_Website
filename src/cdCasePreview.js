import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createCdCase } from './cdCase.js';

const stage=document.querySelector('#stage');
const status=document.querySelector('#status');
const renderer=new THREE.WebGLRenderer({canvas:stage.querySelector('canvas'),antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const pmrem=new THREE.PMREMGenerator(renderer);
const room=new RoomEnvironment();
const environment=pmrem.fromScene(room,.04);
room.dispose();
pmrem.dispose();
const views=['closed','open'].map((name,index)=>{
  const element=document.querySelector(`#${name}-view`);
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0xf2f4f5);
  scene.environment=environment.texture;
  scene.environmentIntensity=.65;
  scene.add(new THREE.HemisphereLight(0xffffff,0x8795a1,1.2));
  const light=new THREE.DirectionalLight(0xffffff,2);
  light.position.set(-3,7,6);
  light.castShadow=true;
  light.shadow.mapSize.set(1024,1024);
  light.shadow.camera.left=-5;light.shadow.camera.right=5;
  light.shadow.camera.top=4;light.shadow.camera.bottom=-4;
  light.shadow.normalBias=.025;
  light.shadow.radius=8;
  scene.add(light);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({opacity:.065}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-1.285;floor.receiveShadow=true;scene.add(floor);
  const model=createCdCase({opening:index?THREE.MathUtils.degToRad(170):0});
  model.position.x=index?1.17:0;
  scene.add(model);
  const camera=new THREE.PerspectiveCamera(35,1,.1,50);
  camera.position.set(index ? .6 : 2.3,index ? 1.3 : 1.2,index ? 9.6 : 7.2);
  const controls=new OrbitControls(camera,element);
  controls.target.set(index?-.02:0,0,0);
  controls.enablePan=false;controls.enableDamping=false;
  controls.minDistance=index?6.5:4.2;controls.maxDistance=14;
  controls.minPolarAngle=.25;controls.maxPolarAngle=Math.PI*.78;
  controls.update();controls.saveState();
  return {element,scene,camera,controls,model};
});
let pending=true;
function draw(){
  pending=false;
  const area=stage.getBoundingClientRect();
  renderer.setScissorTest(false);
  renderer.setSize(area.width,area.height,false);
  renderer.setScissorTest(true);
  for(const view of views){
    const rect=view.element.getBoundingClientRect();
    const x=rect.left-area.left,y=area.bottom-rect.bottom;
    view.camera.aspect=rect.width/rect.height;
    view.camera.zoom=Math.min(1,view.camera.aspect/1.1);
    view.camera.updateProjectionMatrix();
    renderer.setViewport(x,y,rect.width,rect.height);renderer.setScissor(x,y,rect.width,rect.height);
    renderer.render(view.scene,view.camera);
  }
}
function redraw(){if(!pending){pending=true;requestAnimationFrame(draw);}}
views.forEach(view=>view.controls.addEventListener('change',redraw));
addEventListener('resize',redraw);
const covers={clay:'/assets/works/clay-doll.jpg',wrong:'/assets/works/wrong-plane.png',velvet:'/assets/works/fluff-flowers.jpg'};
const loader=new THREE.TextureLoader();
let currentTexture,loadVersion=0;
async function changeCover(){
  const version=++loadVersion;
  status.textContent='正在加载封面图片…';
  try{
    const texture=await loader.loadAsync(covers[document.querySelector('#cover').value]);
    if(version!==loadVersion){texture.dispose();return;}
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);
    const {width,height}=texture.image;
    texture.repeat.set(Math.min(1,height/width),Math.min(1,width/height));
    texture.offset.set((1-texture.repeat.x)/2,(1-texture.repeat.y)/2);
    for(const view of views)for(const material of view.model.userData.artMaterials){material.map=texture;material.needsUpdate=true;}
    currentTexture?.dispose();currentTexture=texture;
    status.textContent='图片封面已加载 · 独立效果预览';redraw();
  }catch{status.textContent='封面图片未能加载，请重新选择封面重试。';}
}
document.querySelector('#cover').addEventListener('change',changeCover);
document.querySelector('#opening').addEventListener('input',event=>{
  const degrees=Number(event.target.value);
  views[1].model.userData.lid.rotation.y=-THREE.MathUtils.degToRad(degrees);
  document.querySelector('#angle').value=`${degrees}°`;redraw();
});
document.querySelectorAll('[data-background]').forEach(button=>button.addEventListener('click',()=>{
  const blue=button.dataset.background==='blue';
  document.body.classList.toggle('blue',blue);
  views.forEach(view=>view.scene.background.set(blue?0x5e8bac:0xf2f4f5));
  document.querySelectorAll('[data-background]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));redraw();
}));
document.querySelector('#reset').addEventListener('click',()=>{views.forEach(view=>view.controls.reset());redraw();});
draw();changeCover();
