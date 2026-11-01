import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createCdPlayer, updateCdPlayer, canvasMap } from './cdPlayer.js';

// Pile-local reconstruction data; named groups retain independent rest transforms.
export const ARCHIVE_LAYOUT = Object.freeze([
  { id:'case-a', position:[-.055,.18,-.055], rotation:[0,.03,.035], size:[.39,.36,.015], scatter:[-.023,.018,-.012] },
  { id:'case-b', position:[-.035,.37,-.08], rotation:[0,-.08,.23], size:[.34,.32,.015], scatter:[-.012,.037,-.018] },
  { id:'headphones', position:[.12,.26,.012], rotation:[0,0,0], scatter:[.025,.012,.018] },
]);

export function createCdArchive() {
  const root = new THREE.Group(); root.name = 'cd-archive'; root.userData.isCdPlayer = true;
  root.scale.setScalar(.78);
  const player = createCdPlayer({number:'01',accent:'#666269',title:'PERSONAL COLLECTION'});
  player.userData.isCdPlayer = false;
  player.userData.archiveInteraction = 'player';
  player.position.set(0,-.24,.105); root.add(player);
  const parts=[];
  const rubber = new THREE.MeshPhysicalMaterial({color:0xeae7e2,roughness:.43,clearcoat:.15,clearcoatRoughness:.35});
  const clear = new THREE.MeshPhysicalMaterial({color:0xeeeeef,transparent:true,opacity:.16,roughness:.14,metalness:.08,depthWrite:false,side:THREE.DoubleSide});
  const rim = new THREE.MeshStandardMaterial({color:0xc2c1c4,metalness:.45,roughness:.23});
  const dark = new THREE.MeshStandardMaterial({color:0x5a575d,roughness:.6});
  const make = (parent,name,geometry,material) => {
    const mesh=new THREE.Mesh(geometry,material); mesh.name=name;
    mesh.castShadow=mesh.receiveShadow=true; parent.add(mesh); return mesh;
  };
  const box=(parent,name,w,h,d,mat,x=0,y=0,z=0)=>{
    const mesh=make(parent,name,new RoundedBoxGeometry(w,h,d,2,Math.min(.002,w/3,h/3,d/3)),mat);
    mesh.position.set(x,y,z);return mesh;
  };
  const tube=(parent,name,points,radius=.0024)=>make(parent,name,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),Math.max(24,points.length*5),radius,7,false),rubber);
  const print = (number) => canvasMap((ctx,s)=>{
    ctx.fillStyle='#f0ede7';ctx.fillRect(0,0,s,s);
    ctx.fillStyle='#302d32';ctx.textAlign='left';ctx.font='500 35px Arial';
    ctx.fillText('FENG® / PERSONAL COLLECTION',45,65);
    ctx.font='26px monospace';
    ['01  Character studies','02  Game & narrative','03  Notes on making','04  Selected experiments','05  Visual research','06  Work in progress'].forEach((line,i)=>ctx.fillText(line,45,150+i*35));
    ctx.font='22px Arial';ctx.fillText(`CD—BOX / ${number}     MULTIMEDIA ARCHIVE`,45,s-150);
    ctx.fillText('All stories start somewhere.',45,s-115);
    ctx.font='18px monospace';ctx.fillText('2024—2025   /   FENG STUDIO',45,s-70);
    // Deterministic barcode-like print, not a photographic texture of the whole case.
    for(let i=0;i<66;i++)if((i*17%11)>3)ctx.fillRect(s-275+i*3,s-110,1+i%2,45);
    ctx.font='15px monospace';ctx.fillText('ARCHIVE 000'+number,s-270,s-45);
  });
  for(const item of ARCHIVE_LAYOUT) {
    const group = new THREE.Group(); group.name=item.id;
    group.userData.archiveInteraction = 'accessories';
    group.position.fromArray(item.position); group.rotation.fromArray(item.rotation);
    root.add(group); parts.push({group,rest:group.position.clone(),rotation:group.rotation.clone(),scatter:new THREE.Vector3(...item.scatter)});
    if(item.size) {
      const [w,h,d]=item.size;
      box(group,`${item.id}-insert`,w,h,.003,new THREE.MeshStandardMaterial({map:print(item.id==='case-a'?'01':'02'),roughness:.82}),0,0,0);
      const shell=box(group,`${item.id}-rim`,w+.016,h+.016,d,clear,0,0,.002);
      shell.userData.noShadow=true;shell.castShadow=false;
      const caseRims=new THREE.Group();caseRims.name=`${item.id}-edge-system`;group.add(caseRims);
      [-1,1].forEach(side=>{
        const rail=box(caseRims,`${item.id}-edge-${side}`,.003,h+.016,.006,rim,side*(w+.013)/2,0,.008);
        rail.userData.explodeWithParent=true;
        box(caseRims,`${item.id}-hinge-${side}`,.012,.025,.018,clear,-w/2-.003,side*h*.34,.003);
        box(caseRims,`${item.id}-horizontal-${side}`,w+.016,.003,.006,rim,0,side*(h+.013)/2,.008);
      });
      const ribs = new THREE.InstancedMesh(new THREE.BoxGeometry(.012,.0015,.002),rim,22);
      ribs.name=`${item.id}-spine-ribs`;ribs.userData.explodeWithParent=true;
      const transform=new THREE.Object3D();
      for(let i=0;i<22;i++){transform.position.set(-w/2+.012,-h*.39+i*h*.035,.01);transform.updateMatrix();ribs.setMatrixAt(i,transform.matrix);}
      caseRims.add(ribs);
    }
    else {
      const points=[];
      for(let i=0;i<=150;i++) {
        const t=i/150; const angle=t*Math.PI*6.3;
        const radius=.088+t*.012;
        points.push(new THREE.Vector3(Math.cos(angle)*radius,Math.sin(angle)*radius,.008*Math.sin(angle*1.3)+t*.008));
      }
      const curve=new THREE.CatmullRomCurve3(points);
      make(group,'coiled-cable',new THREE.TubeGeometry(curve,220,.0024,7,false),rubber);
      tube(group,'lead-one',[[.098,.02,.014],[.103,-.055,.02],[.065,-.12,.027],[.005,-.15,.035],[-.03595,-.1472,.036]]);
      tube(group,'lead-two',[[.095,.012,.018],[.12,-.045,.015],[.111,-.118,.026],[.07,-.16,.038],[.06758,-.17297,.036]]);
      tube(group,'jack-lead',[[.091,.035,.013],[.137,.048,.016],[.13,.105,.02],[.082,.13,.028],[.032,.125,.035]]);
      [[-.028,-.108,-.2],[.055,-.135,.32]].forEach(([x,y,rotation],i)=>{
        const bud=new THREE.Group();bud.name=i?'earbud-two':'earbud-one';bud.position.set(x,y,.038);bud.rotation.z=rotation;group.add(bud);
        const head=make(bud,`earbud-${i}-housing`,new THREE.SphereGeometry(.013,20,14),rubber);head.scale.set(1.1,.85,.78);
        const stem=make(bud,`earbud-${i}-stem`,new THREE.CylinderGeometry(.0043,.0036,.036,12),rubber);stem.position.set(0,-.022,-.002);
        const grille=make(bud,`earbud-${i}-grille`,new THREE.SphereGeometry(.007,16,10),dark);grille.scale.set(1,.72,.16);grille.position.set(.003,.001,.0095);
        for(let j=0;j<4;j++)box(bud,`earbud-${i}-grille-line-${j}`,.009,.00045,.0005,rim,.003,-.002+j*.002,.011);
      });
      const remote=box(group,'remote',.011,.056,.011,rubber,.111,-.03,.02);remote.rotation.z=-.18;
      box(remote,'remote-seam',.007,.0007,.0008,rim,0,-.012,.006);
      box(remote,'remote-button',.004,.009,.001,rim,0,.008,.006);
      const jack=make(group,'jack-tip',new THREE.CylinderGeometry(.0024,.0024,.023,12),rim);jack.position.set(.032,.137,.035);
      box(group,'jack-grip',.009,.026,.009,rubber,.032,.115,.035);
    }
  }
  const loose = new THREE.Group();loose.name='loose-disc';loose.position.set(.105,.16,-.01);root.add(loose);
  loose.userData.archiveInteraction = 'accessories';
  const discLabel=canvasMap((ctx,s)=>{
    ctx.fillStyle='#efeeea';ctx.fillRect(0,0,s,s);ctx.fillStyle='#464249';ctx.textAlign='center';
    ctx.font='45px monospace';ctx.fillText('FENG / ARCHIVE',s/2,s*.23);ctx.font='24px monospace';ctx.fillText('CD-R · 700 MB · 80 MIN',s/2,s*.77);
  });
  make(loose,'loose-disc-face',new THREE.RingGeometry(.016,.145,72),new THREE.MeshStandardMaterial({map:discLabel,metalness:.35,roughness:.28,side:THREE.DoubleSide}));
  make(loose,'loose-disc-rim',new THREE.RingGeometry(.143,.146,72),rim);
  parts.push({group:loose,rest:loose.position.clone(),rotation:loose.rotation.clone(),scatter:new THREE.Vector3(.025,-.005,.02)});
  root.userData.player=player;root.userData.parts=parts;root.userData.hover=0;
  root.userData.sculptRuntime={nodes:Object.fromEntries(parts.map(p=>[p.group.name,p.group])),destructionGroups:parts.map(p=>p.group.name),collider:{type:'box',size:[.54,1.1,.28]}};
  return root;
}

export function updateCdArchive(root,hoveredPart,dt,reducedMotion=false) {
  const before=root.userData.hover;
  const target=hoveredPart==='accessories'?1:0;
  let value=reducedMotion?target:before+(target-before)*(1-Math.exp(-8*dt));
  if(Math.abs(target-value)<.001)value=target;
  root.userData.hover=value;
  for(const part of root.userData.parts) {
    part.group.position.copy(part.rest).addScaledVector(part.scatter,value);
    part.group.rotation.z=part.rotation.z+part.scatter.x*1.2*value;
  }
  const changed=updateCdPlayer(root.userData.player,hoveredPart==='player',dt,reducedMotion);
  return before!==value||changed;
}

export function cdArchiveHit(object) {
  let part=null;
  for(let node=object;node;node=node.parent) {
    part ||= node.userData.archiveInteraction;
    if(node.userData.isCdPlayer) return {archive:node,part,opensLibrary:part==='player'};
  }
  return null;
}
