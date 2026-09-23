import * as THREE from 'three';
import './worksDiscs.css';
import { createDiscGeometry } from './discGeometry.js';

let renderer;
let camera;
let scene;
let discs = [];
let started = false;
let reveal = 1;
const source = new THREE.Vector2(0, 0);
const smooth = (a, b, value) => THREE.MathUtils.smoothstep(value, a, b);

export function setWorksTransition(progress, anchor) {
  reveal = progress;
  if (anchor) source.copy(anchor);
}

const COUNT = 20;
// Fixed reference framing; input moves the works, never the camera.
const CAMERA_POS = new THREE.Vector3(0, 0, 20);
const CAMERA_LOOK = new THREE.Vector3(0, 0, 0);

const COVER_ART = {
  1: '/assets/works/clay-doll.jpg',
  2: '/assets/works/barbarian.jpg',
  3: '/assets/works/axionm.jpg',
};

const palettes = [
  ['#090a0c', '#5a5347', '#eca000', '#121214'],
  ['#07151a', '#007f9c', '#101014', '#dc5f2c'],
  ['#090e20', '#17306d', '#7d3f70', '#080b12'],
  ['#0b0d0e', '#ed8b00', '#1b1c1d', '#31111b'],
  ['#101418', '#3d6b4f', '#c8d36a', '#0c1012'],
  ['#140c18', '#6a2d6d', '#e08ad4', '#120814'],
  ['#0c1218', '#1f4f7a', '#7ec8e3', '#0a0e12'],
  ['#16110c', '#8a4a22', '#f0b27a', '#120e0a'],
];

export function initWorks(background = 0xf6f7fa) {
  const canvas = document.querySelector('#works-scene');
  if (!canvas || started) return;
  started = true;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(background, 0);
  renderer.shadowMap.enabled = false;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;

  scene = new THREE.Scene();
  scene.background = null;
  camera = new THREE.OrthographicCamera(-5.5, 5.5, 3, -3, 0.1, 80);
  camera.position.copy(CAMERA_POS);
  camera.lookAt(CAMERA_LOOK);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xc5c8d0, 1.55));
  const key = new THREE.DirectionalLight(0xffffff, 2.8);
  key.position.set(-3.2, 8, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -12;
  key.shadow.camera.right = 12;
  key.shadow.camera.top = 10;
  key.shadow.camera.bottom = -10;
  scene.add(key);
  const warm = new THREE.PointLight(0xff9b27, 18, 20, 2);
  warm.position.set(5.5, 2.4, 6);
  scene.add(warm);

  const geometry = createDiscGeometry();
  const hubMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xaeb4ba, roughness: 0.28, metalness: 0.08, clearcoat: 0.65, clearcoatRoughness: 0.22,
  });
  const darkHub = new THREE.MeshPhysicalMaterial({
    color: 0x737980, roughness: 0.24, metalness: 0.18, clearcoat: 0.45,
  });
  const rimMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x2e343a, roughness: 0.18, metalness: 0.42, clearcoat: 0.9,
  });

  for (let i = 0; i < COUNT; i += 1) {
    const disc = createDisc(i, geometry, palettes[i % palettes.length], hubMaterial, darkHub, rimMaterial);
    scene.add(disc);
    discs.push(disc);
  }

  let angle = 0;
  let targetAngle = 0;
  let velocity = 0;
  let dragging = false;
  let lastX = 0;
  const pointer = new THREE.Vector2(4, 4);
  const raycaster = new THREE.Raycaster();

  const onDown = (e) => {
    if (reveal < 1) return;
    dragging = true;
    velocity = 0;
    lastX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    if (!dragging) return;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    const step = dx * 0.0042;
    targetAngle += step;
    velocity = step;
  };
  const onUp = () => {
    dragging = false;
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', () => pointer.set(4, 4));
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (reveal < 1) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    targetAngle += delta * 0.0016;
    velocity = 0;
  }, { passive: false });

  const loop = () => {
    requestAnimationFrame(loop);
    if (!document.body.classList.contains('is-works')) return;
    if (!dragging) {
      targetAngle += velocity;
      velocity *= 0.94;
      if (Math.abs(velocity) < 0.00005) velocity = 0;
    }
    angle += (targetAngle - angle) * 0.16;

    placeDiscs(angle);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(discs.filter((disc) => disc.visible), true);
    const hovered = hits[0]?.object?.parent;
    discs.forEach((disc) => {
      const active = hovered === disc;
      disc.userData.hover += ((active ? 1 : 0) - disc.userData.hover) * 0.1;
      disc.position.z += disc.userData.hover * 0.04;
    });
    // Project the open locker into this fixed camera's coordinate system.
    const originX = source.x * camera.right;
    const originY = source.y * camera.top;
    const visible = discs.filter((disc) => disc.visible);
    const hero = visible.reduce((best, disc) =>
      !best || Math.abs(disc.position.x) < Math.abs(best.position.x) ? disc : best, null);
    visible.forEach((disc, i) => {
      const isHero = disc === hero;
      const start = isHero ? 0.14 : 0.47 + i * 0.025;
      const p = smooth(start, isHero ? 0.78 : 0.94 + i * 0.01, reveal);
      disc.visible = p > 0;
      disc.position.x = THREE.MathUtils.lerp(originX, disc.position.x, p);
      disc.position.y = THREE.MathUtils.lerp(originY, disc.position.y, p);
      disc.scale.multiplyScalar(THREE.MathUtils.lerp(isHero ? 0.035 : 0, 1, p));
      disc.rotation.y = THREE.MathUtils.lerp(1.3, 0.52, p);
      disc.rotation.z = THREE.MathUtils.lerp(0.08, -0.42, p);
    });
    renderer.render(scene, camera);
  };
  loop();

  const resize = () => {
    const width = innerWidth;
    const height = innerHeight;
    renderer.setSize(width, height, false);
    const viewWidth = width < 700 ? 6.8 : 11;
    const viewHeight = viewWidth * height / width;
    camera.left = -viewWidth / 2;
    camera.right = viewWidth / 2;
    camera.top = viewHeight / 2;
    camera.bottom = -viewHeight / 2;
    camera.updateProjectionMatrix();
    placeDiscs(angle);
  };
  addEventListener('resize', resize);
  resize();
}

export function showWorks(background) {
  initWorks(background);
  document.body.classList.add('is-lockers', 'is-works');
  window.scrollTo(0, 0);
}

export function hideWorks() {
  document.body.classList.remove('is-works');
  reveal = 1;
}

function placeDiscs(offset) {
  // Monotonic track avoids sin(a) == sin(PI-a), which stacked pairs of discs.
  // Reference centers (1100 × 600): (10,410), (255,383), (570,305), (980,120).
  const stops = [
    [-5.40, -1.10, 1.18], [-2.95, -0.83, 1.48],
    [0.20, -0.05, 1.96], [4.30, 1.80, 2.40],
  ];
  const first = -2;
  const interpolate = (slot) => {
    const segment = Math.max(0, Math.min(2, Math.floor(slot)));
    const t = slot - segment;
    return stops[segment].map((value, axis) =>
      THREE.MathUtils.lerp(value, stops[segment + 1][axis], t));
  };
  discs.forEach((disc, i) => {
    const slot = THREE.MathUtils.euclideanModulo(i + offset * 3 - first, COUNT) + first;
    disc.visible = slot > -1.5 && slot < 5;
    if (!disc.visible) return;
    const [x, y, radius] = interpolate(slot);
    disc.position.set(x, y, slot * 0.06);
    disc.scale.setScalar(Math.max(0.6, radius));
    // Tilt around the disc's local vertical axis, then roll the ellipse in screen space.
    disc.rotation.set(0, 0.52, -0.42, 'ZYX');
  });
}

function createDisc(index, geometry, palette, hubMaterial, darkHub, rimMaterial) {
  const group = new THREE.Group();
  const face = new THREE.MeshPhysicalMaterial({
    map: COVER_ART[index] ? coverTexture(COVER_ART[index]) : faceTexture(palette, 0.17 + index * 0.11),
    roughness: COVER_ART[index] ? 0.42 : 0.27,
    metalness: 0.03,
    clearcoat: 0.58,
    clearcoatRoughness: 0.2,
  });
  const body = new THREE.Mesh(geometry, [face, rimMaterial]);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);
  const outerHub = new THREE.Mesh(hubGeometry(0.14, 0.245, 0.018), darkHub);
  outerHub.position.z = 0.014;
  outerHub.castShadow = true;
  group.add(outerHub);
  const innerHub = new THREE.Mesh(hubGeometry(0.14, 0.213, 0.012), hubMaterial);
  innerHub.position.z = 0.031;
  innerHub.castShadow = true;
  group.add(innerHub);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.998, 0.006, 8, 128), hubMaterial);
  rim.position.z = 0.01;
  group.add(rim);
  group.userData.hover = 0;
  return group;
}

function hubGeometry(inner, outer, height) {
  const profile = [
    [inner, 0], [outer - 0.006, 0], [outer, 0.003],
    [outer, height - 0.003], [outer - 0.006, height],
    [inner + 0.003, height], [inner, height - 0.003], [inner, 0],
  ].map(([r, z]) => new THREE.Vector2(r, z));
  const geometry = new THREE.LatheGeometry(profile, 96);
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

function coverTexture(url) {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  new THREE.TextureLoader().load(url, (source) => {
    const image = source.image;
    const scale = Math.max(size / image.width, size / image.height);
    const w = image.width * scale;
    const h = image.height * scale;
    ctx.drawImage(image, (size - w) / 2, (size - h) / 2, w, h);
    texture.needsUpdate = true;
  });
  return texture;
}

function faceTexture(colors, seed) {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(size * (0.35 + seed * 0.08), size * 0.38, 20, size * 0.5, size * 0.5, size * 0.72);
  colors.forEach((color, i) => g.addColorStop(i / (colors.length - 1), color));
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  x.globalCompositeOperation = 'screen';
  for (let i = 0; i < 5; i += 1) {
    const glow = x.createRadialGradient(
      size * ((seed * 1.7 + i * 0.23) % 1),
      size * (0.15 + i * 0.17),
      0,
      size * 0.5,
      size * 0.5,
      size * (0.25 + i * 0.04),
    );
    glow.addColorStop(0, `rgba(255,255,255,${0.14 - i * 0.018})`);
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = glow;
    x.fillRect(0, 0, size, size);
  }
  x.globalCompositeOperation = 'source-over';
  x.strokeStyle = 'rgba(255,255,255,.055)';
  for (let r = 50; r < 245; r += 6) {
    x.lineWidth = 0.7;
    x.beginPath();
    x.arc(size / 2, size / 2, r, 0, Math.PI * 2);
    x.stroke();
  }
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
