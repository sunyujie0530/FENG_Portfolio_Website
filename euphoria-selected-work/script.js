import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const canvas = document.querySelector('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0xf4f4f2, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf4f4f2);
const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
camera.position.set(0, 0.15, 11);

scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c1d2, 1.7));
const key = new THREE.DirectionalLight(0xffffff, 3.2);
key.position.set(-4, 7, 9);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
scene.add(key);
const rim = new THREE.PointLight(0xff9b27, 24, 18, 2);
rim.position.set(6, 3, 5);
scene.add(rim);

const backdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 24),
  new THREE.MeshStandardMaterial({ color: 0xf4f4f2, roughness: 0.92 })
);
backdrop.position.z = -0.65;
backdrop.receiveShadow = true;
scene.add(backdrop);

const stage = new THREE.Group();
stage.name = 'root';
stage.userData.sculptRuntime = { parts: ['disc-body', 'hub', 'groove-system'], explodable: true, clickable: true };
scene.add(stage);

function faceTexture(colors, seed) {
  const size = 768;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(size * (.35 + seed * .08), size * .38, 20, size * .5, size * .5, size * .72);
  colors.forEach((color, i) => g.addColorStop(i / (colors.length - 1), color));
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  x.globalCompositeOperation = 'screen';
  for (let i = 0; i < 5; i++) {
    const glow = x.createRadialGradient(size * ((seed * 1.7 + i * .23) % 1), size * (.15 + i * .17), 0, size * .5, size * .5, size * (.25 + i * .04));
    glow.addColorStop(0, `rgba(255,255,255,${.14 - i * .018})`);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = glow;
    x.fillRect(0, 0, size, size);
  }
  x.globalCompositeOperation = 'source-over';
  x.strokeStyle = 'rgba(255,255,255,.055)';
  for (let r = 75; r < 365; r += 7) {
    x.lineWidth = .7;
    x.beginPath(); x.arc(size / 2, size / 2, r, 0, Math.PI * 2); x.stroke();
  }
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

function discGeometry() {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, 1, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, .14, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: .085, bevelEnabled: true, bevelSize: .018, bevelThickness: .018,
    bevelSegments: 3, curveSegments: 96
  });
  geometry.center();
  return geometry;
}

const palettes = [
  ['#090a0c', '#5a5347', '#eca000', '#121214'],
  ['#07151a', '#007f9c', '#101014', '#dc5f2c'],
  ['#090e20', '#17306d', '#7d3f70', '#080b12'],
  ['#0b0d0e', '#ed8b00', '#1b1c1d', '#31111b']
];

const discs = [];
const geometry = discGeometry();
const hubMaterial = new THREE.MeshPhysicalMaterial({ color: 0xaeb4ba, roughness: .28, metalness: .08, clearcoat: .65, clearcoatRoughness: .22 });
const darkHub = new THREE.MeshPhysicalMaterial({ color: 0x737980, roughness: .24, metalness: .18, clearcoat: .45 });
const rimMaterial = new THREE.MeshPhysicalMaterial({ color: 0x2e343a, roughness: .18, metalness: .42, clearcoat: .9 });

function createDisc(index) {
  const group = new THREE.Group();
  group.name = `disc-instance-${index + 1}`;
  group.userData.index = index;
  const face = new THREE.MeshPhysicalMaterial({
    map: faceTexture(palettes[index], .17 + index * .19), roughness: .27,
    metalness: .03, clearcoat: .58, clearcoatRoughness: .2
  });
  const body = new THREE.Mesh(geometry, [face, rimMaterial]);
  body.name = 'disc-body';
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);
  const outerHub = new THREE.Mesh(new THREE.TorusGeometry(.205, .057, 20, 72), darkHub);
  outerHub.name = 'hub';
  outerHub.position.z = .075;
  outerHub.castShadow = true;
  group.add(outerHub);
  const innerHub = new THREE.Mesh(new THREE.TorusGeometry(.165, .035, 16, 64), hubMaterial);
  innerHub.name = 'hub-detail';
  innerHub.position.z = .098;
  innerHub.castShadow = true;
  group.add(innerHub);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.992, .018, 12, 128), rimMaterial);
  rim.name = 'groove-system';
  rim.position.z = .058;
  group.add(rim);
  group.userData.homeZ = 0;
  group.userData.hover = 0;
  return group;
}

for (let i = 0; i < 4; i++) {
  const disc = createDisc(i);
  stage.add(disc);
  discs.push(disc);
}

function layout() {
  const mobile = innerWidth < 700;
  if (mobile) {
    const positions = [[-2.1,-1.7,.15],[-.95,-.45,.35],[.35,.65,.55],[1.75,1.72,.75]];
    discs.forEach((disc, i) => {
      disc.position.set(...positions[i]);
      const s = .76 + i * .04;
      disc.scale.setScalar(s);
      disc.rotation.set(-.22 + i * .05, .28 - i * .08, [-.2,.12,-.12,.16][i]);
      disc.userData.homeX = positions[i][0];
      disc.userData.homeZ = positions[i][2];
    });
    camera.position.z = 10.8;
  } else {
    const positions = [[-5.15,-1.55,.1],[-3.05,-.55,.35],[-.25,.05,.65],[4.05,1.45,.95]];
    const scales = [1.18,1.5,1.92,2.08];
    discs.forEach((disc, i) => {
      disc.position.set(...positions[i]);
      disc.scale.setScalar(scales[i]);
      disc.rotation.set([-.05,-.1,-.12,-.18][i], [.12,-.16,.12,-.18][i], [-.18,.14,-.12,.14][i]);
      disc.userData.homeX = positions[i][0];
      disc.userData.homeZ = positions[i][2];
    });
    camera.position.z = 11;
  }
}

const pointer = new THREE.Vector2(4, 4);
const raycaster = new THREE.Raycaster();
let dragging = false;
let px = 0, py = 0, rx = 0, ry = 0, targetRx = 0, targetRy = 0, dragDistance = 0, exploded = 0, targetExploded = 0;
canvas.addEventListener('pointerdown', e => { dragging = true; dragDistance = 0; px = e.clientX; py = e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => {
  pointer.x = e.clientX / innerWidth * 2 - 1;
  pointer.y = -(e.clientY / innerHeight * 2 - 1);
  if (!dragging) return;
  dragDistance += Math.abs(e.clientX - px) + Math.abs(e.clientY - py);
  targetRy += (e.clientX - px) * .003;
  targetRx += (e.clientY - py) * .002;
  px = e.clientX; py = e.clientY;
});
canvas.addEventListener('pointerup', () => {
  if (dragDistance < 8 && raycaster.intersectObjects(discs, true).length) targetExploded = targetExploded ? 0 : 1;
  dragging = false;
});
canvas.addEventListener('pointerleave', () => { pointer.set(4, 4); dragging = false; });

function resize() {
  const width = innerWidth, height = innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.fov = width < 700 ? 45 : 36;
  camera.updateProjectionMatrix();
  layout();
}
addEventListener('resize', resize);
resize();

const clock = new THREE.Clock();
function render() {
  const t = clock.getElapsedTime();
  exploded += (targetExploded - exploded) * .06;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(discs, true);
  const hovered = hits[0]?.object?.parent;
  discs.forEach((disc, i) => {
    const active = hovered === disc || hovered?.parent === disc;
    disc.userData.hover += ((active ? 1 : 0) - disc.userData.hover) * .09;
    const spread = (i - 1.5) * exploded * .34;
    disc.position.x += ((disc.userData.homeX ?? disc.position.x) + spread - disc.position.x) * .08;
    disc.position.z = disc.userData.homeZ + disc.userData.hover * .42 + Math.abs(spread) * .22;
    disc.rotation.z += Math.sin(t * .42 + i * 1.7) * .00012;
  });
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) targetRy += .00012;
  rx += (targetRx - rx) * .06;
  ry += (targetRy - ry) * .06;
  stage.rotation.x = THREE.MathUtils.clamp(rx, -.28, .28);
  stage.rotation.y = ry;
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
