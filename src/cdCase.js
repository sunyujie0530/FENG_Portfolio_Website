import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createDiscGeometry } from './discGeometry.js';

// Standard jewel case proportions: 142 × 125 × 10 mm.
export function createCdCase({ cover = null, opening = 0 } = {}) {
  const model = new THREE.Group();
  model.name = 'cd-jewel-case';
  const clear = new THREE.MeshPhysicalMaterial({color:0xd1dce3,roughness:.13,metalness:0,clearcoat:1,clearcoatRoughness:.06,transmission:.3,thickness:.045,ior:1.49,transparent:true,opacity:.67,depthWrite:false});
  const windowMaterial = clear.clone();
  windowMaterial.transmission = 0;
  windowMaterial.opacity = .055;
  const rim = clear.clone();
  rim.color.set(0xb2c1cb);
  rim.opacity = .85;
  rim.transmission = .15;
  const paper = new THREE.MeshStandardMaterial({color:0xf2f0e8,roughness:.85});
  const artwork = new THREE.MeshBasicMaterial({map:cover,toneMapped:false});
  const discArt = new THREE.MeshBasicMaterial({map:cover,toneMapped:false});
  const silver = new THREE.MeshPhysicalMaterial({color:0xc9d0d8,roughness:.2,metalness:.8,iridescence:1,iridescenceIOR:1.35});
  const mesh = (parent,name,geometry,material,x=0,y=0,z=0) => {
    const part = new THREE.Mesh(geometry,material);
    part.name = name;
    part.position.set(x,y,z);
    part.castShadow = material === paper || material === artwork;
    parent.add(part);
    return part;
  };
  const box = (parent,name,w,h,d,material,x=0,y=0,z=0,r=.018) => mesh(parent,name,new RoundedBoxGeometry(w,h,d,2,Math.min(r,d/2,w/2,h/2)),material,x,y,z);
  const ring = (parent,name,radius,tube,material,x,y,z) => mesh(parent,name,new THREE.TorusGeometry(radius,tube,8,96),material,x,y,z);
  const frame = (parent,prefix,z,material) => {
    box(parent,`${prefix}-top`,2.84,.065,.095,material,0,1.217,z);
    box(parent,`${prefix}-bottom`,2.84,.065,.095,material,0,-1.217,z);
    box(parent,`${prefix}-spine`,.065,2.4,.095,material,-1.387,0,z);
    box(parent,`${prefix}-edge`,.065,2.4,.095,material,1.387,0,z);
  };
  box(model,'back-window',2.84,2.5,.035,windowMaterial,0,0,-.072,.016);
  frame(model,'base',-.035,rim);
  const backPrint = mesh(model,'back-cover',new THREE.PlaneGeometry(2.38,2.35),artwork,.1,0,-.094);
  backPrint.rotation.y = Math.PI;
  box(model,'clear-inner-tray',2.49,2.36,.026,windowMaterial,.13,0,-.045);
  ring(model,'tray-disc-recess',1.147,.021,clear,.13,0,-.005);
  ring(model,'tray-outer-ridge',1.175,.013,rim,.13,0,-.018);
  const removableDisc=new THREE.Group();removableDisc.name='removable-cd';removableDisc.position.set(.13,0,.005);model.add(removableDisc);
  const disc = mesh(removableDisc,'printed-cd',createDiscGeometry(),[discArt,silver]);
  disc.scale.setScalar(1.105);
  ring(removableDisc,'cd-silver-outer-edge',1.104,.009,silver,0,0,.013);
  ring(removableDisc,'cd-clear-hub',.172,.031,clear,0,0,.024);
  ring(removableDisc,'cd-silver-hub',.205,.009,silver,0,0,.023);
  mesh(model,'tray-center-spindle',new THREE.CylinderGeometry(.095,.105,.065,24),rim,.13,0,.027).rotation.x = Math.PI/2;
  for (let i=0;i<12;i++) {
    const a=i*Math.PI/6;
    const tooth=box(model,`spindle-tooth-${i}`,.025,.048,.025,rim,.13+Math.cos(a)*.1,Math.sin(a)*.1,.058,.006);
    tooth.rotation.z=a-Math.PI/2;
  }
  for (const y of [-1.03,1.03]) {
    mesh(model,`hinge-pin-${y}`,new THREE.CylinderGeometry(.041,.041,.32,20),rim,-1.19,y,.068);
    box(model,`hinge-bridge-${y}`,.23,.17,.072,clear,-1.26,y,.005);
  }
  for (let i=0;i<7;i++) box(model,`spine-rib-${i}`,.012,2.13,.06,rim,-1.35+i*.023,0,-.01,.005);
  for (const y of [-.7,.7]) box(model,`base-latch-${y}`,.045,.17,.09,rim,1.38,y,.022);

  const lid = new THREE.Group();
  lid.name='hinged-lid';
  lid.position.set(-1.19,0,.083);
  model.add(lid);
  const lidPanel = new THREE.Group();
  lidPanel.name='lid-panel';
  lidPanel.position.x=1.19;
  lid.add(lidPanel);
  box(lidPanel,'cover-paper-insert',2.38,2.35,.012,paper,.1,0,0,.005);
  mesh(lidPanel,'front-cover',new THREE.PlaneGeometry(2.38,2.35),artwork,.1,0,.008);
  box(lidPanel,'front-clear-window',2.84,2.5,.016,windowMaterial,0,0,.027,.007);
  frame(lidPanel,'lid',.02,clear);
  for (const y of [-.85,.85]) {
    box(lidPanel,`paper-retainer-left-${y}`,.085,.1,.025,rim,-1.13,y,-.015);
    box(lidPanel,`paper-retainer-right-${y}`,.055,.1,.025,rim,1.3,y,-.015);
  }
  box(lidPanel,'opening-grip',.045,.34,.025,rim,1.39,0,.018);
  lid.rotation.y=-THREE.MathUtils.clamp(opening,0,Math.PI);
  model.userData.lid=lid;
  model.userData.disc=removableDisc;
  model.userData.artMaterials=[artwork,discArt];
  return model;
}
