import * as THREE from 'three';

let renderer;
let camera;
let scene;
let discs = [];
let started = false;

const COUNT = 20;
const CAMERA_POS = new THREE.Vector3(0.2, 0.12, 11.2);
const CAMERA_LOOK = new THREE.Vector3(0.15, 0.08, 0);

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

export function initWorks() {
  const canvas = document.querySelector('#works-scene');
  if (!canvas || started) return;
  started = true;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0xf6f7fa, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf6f7fa);
  camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
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

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 50),
    new THREE.MeshStandardMaterial({ color: 0xf6f7fa, roughness: 0.94 }),
  );
  floor.position.z = -1.2;
  scene.add(floor);

  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.006, 8, 128),
    new THREE.MeshBasicMaterial({ color: 0xd5d8de, transparent: true, opacity: 0.55 }),
  );
  scene.add(orbit);

  const geometry = discGeometry();
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
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    targetAngle += delta * 0.0016;
    velocity = 0;
  }, { passive: false });

  const clock = new THREE.Clock();
  const loop = () => {
    requestAnimationFrame(loop);
    camera.position.copy(CAMERA_POS);
    camera.lookAt(CAMERA_LOOK);

    if (!dragging) {
      targetAngle += velocity;
      velocity *= 0.94;
      if (Math.abs(velocity) < 0.00005) velocity = 0;
    }
    angle += (targetAngle - angle) * 0.16;

    placeDiscs(angle);
    orbit.scale.set(orbitRadius(), orbitRadius() * orbitRise(), 1);
    orbit.rotation.set(1.18, 0, 0.38);

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(discs, true);
    const hovered = hits[0]?.object?.parent;
    const t = clock.getElapsedTime();
    discs.forEach((disc, i) => {
      const active = hovered === disc;
      disc.userData.hover += ((active ? 1 : 0) - disc.userData.hover) * 0.1;
      disc.position.z += disc.userData.hover * 0.12;
      disc.rotation.z += Math.sin(t * 0.35 + i) * 0.002;
    });
    renderer.render(scene, camera);
  };
  loop();

  const resize = () => {
    const width = innerWidth;
    const height = innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 700 ? 40 : 34;
    camera.updateProjectionMatrix();
    placeDiscs(angle);
  };
  addEventListener('resize', resize);
  resize();
}

export function showWorks() {
  initWorks();
  document.body.classList.add('is-lockers', 'is-works');
  window.scrollTo(0, 0);
}

export function hideWorks() {
  document.body.classList.remove('is-works');
}

function orbitRadius() {
  return innerWidth < 700 ? 6.4 : 9.6;
}

function orbitRise() {
  return 0.42;
}

function placeDiscs(offset) {
  const radius = orbitRadius();
  const rise = orbitRise();
  const base = innerWidth < 700 ? 0.5 : 0.66;
  discs.forEach((disc, i) => {
    const a = offset + (i / COUNT) * Math.PI * 2;
    const front = (Math.cos(a) + 1) * 0.5;
    disc.position.set(
      radius * Math.sin(a),
      radius * rise * Math.sin(a),
      radius * 0.22 * Math.cos(a),
    );
    disc.scale.setScalar(base * (0.38 + front * 0.95));
    disc.rotation.set(-0.06, 0.02 * Math.sin(a), 0.02 * Math.cos(a));
    disc.traverse((node) => {
      if (node.isMesh) node.castShadow = front > 0.62;
    });
  });
}

function createDisc(index, geometry, palette, hubMaterial, darkHub, rimMaterial) {
  const group = new THREE.Group();
  const face = new THREE.MeshPhysicalMaterial({
    map: faceTexture(palette, 0.17 + index * 0.11),
    roughness: 0.27,
    metalness: 0.03,
    clearcoat: 0.58,
    clearcoatRoughness: 0.2,
  });
  const body = new THREE.Mesh(geometry, [face, rimMaterial]);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);
  const outerHub = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.057, 20, 72), darkHub);
  outerHub.position.z = 0.075;
  outerHub.castShadow = true;
  group.add(outerHub);
  const innerHub = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.035, 16, 64), hubMaterial);
  innerHub.position.z = 0.098;
  innerHub.castShadow = true;
  group.add(innerHub);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.992, 0.018, 12, 128), rimMaterial);
  rim.position.z = 0.058;
  group.add(rim);
  group.userData.hover = 0;
  return group;
}

function discGeometry() {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, 1, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.14, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.085,
    bevelEnabled: true,
    bevelSize: 0.018,
    bevelThickness: 0.018,
    bevelSegments: 3,
    curveSegments: 96,
  });
  geometry.center();
  return geometry;
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
  return texture;
}

showWorks();
