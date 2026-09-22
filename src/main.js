import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import './style.css';

const app = document.querySelector('#app');
const scene = new THREE.Scene();
// Fog-white campus backdrop.
scene.background = new THREE.Color(0xeef2f5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;
app.append(renderer.domElement);

const LOCKER_COUNT = 8;
// Slim tall campus lockers — soft toy proportions.
const LOCKER_WIDTH = 0.84;
const LOCKER_DEPTH = LOCKER_WIDTH * 0.68;
const LOCKER_HEIGHT = LOCKER_WIDTH * 4.25;
const WALL = 0.05;
const FOOT_H = 0.048;
const GAP = 0.028;
const DOOR_THICK = 0.055;
const FRAME = 0.032;
const ROUND = 0.04;
const DOOR_WIDTH = LOCKER_WIDTH - WALL * 2;
const DOOR_HEIGHT = LOCKER_HEIGHT - WALL * 2 - FOOT_H;
const TOTAL_WIDTH = LOCKER_COUNT * LOCKER_WIDTH + (LOCKER_COUNT - 1) * GAP;
const LOCKER_CENTER_Y = FOOT_H + (LOCKER_HEIGHT - FOOT_H) / 2;

const camera = new THREE.OrthographicCamera(-4.3, 4.3, 2.4, -2.4, 0.1, 100);
// Near-front, slight upper-right — weak product perspective.
camera.position.set(1.6, 2.6, 12);

const target = new THREE.Vector3(0, LOCKER_CENTER_Y * 0.98, 0);
camera.lookAt(target);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(target);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minZoom = 0.92;
controls.maxZoom = 1.12;
controls.minAzimuthAngle = -0.32;
controls.maxAzimuthAngle = 0.32;
controls.minPolarAngle = 1.2;
controls.maxPolarAngle = 1.4;
controls.update();

// Soft cool wrap light — clean, healing campus mood.
scene.add(new THREE.AmbientLight(0xf4f8fb, 1.15));

const hemisphere = new THREE.HemisphereLight(0xffffff, 0xc5d0dc, 1.2);
scene.add(hemisphere);

const keyLight = new THREE.DirectionalLight(0xf5f9fc, 1.15);
keyLight.position.set(-2.8, 9, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -9;
keyLight.shadow.camera.right = 9;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -2;
keyLight.shadow.radius = 10;
keyLight.shadow.blurSamples = 18;
keyLight.shadow.bias = -0.0002;
keyLight.shadow.normalBias = 0.04;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xdfeaf4, 0.85);
fillLight.position.set(5, 4.5, 4.5);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xe8eef4, 0.35);
rimLight.position.set(1.5, 5, -3.5);
scene.add(rimLight);

const softBounce = new THREE.PointLight(0xeef5fb, 14, 12, 2);
softBounce.position.set(0, 2, 3);
scene.add(softBounce);

scene.fog = new THREE.Fog(0xeef2f5, 16, 30);

// Matte soft-metal: fog white + light blue-gray.
const soft = { roughness: 0.88, metalness: 0.06 };
const materials = {
  body: new THREE.MeshStandardMaterial({ color: 0xd5e3ee, ...soft }),
  door: new THREE.MeshStandardMaterial({ color: 0xe4eef5, ...soft }),
  frame: new THREE.MeshStandardMaterial({ color: 0xc8d8e6, ...soft }),
  recess: new THREE.MeshStandardMaterial({ color: 0x6d8294, roughness: 0.92, metalness: 0.05 }),
  handle: new THREE.MeshStandardMaterial({ color: 0x556878, roughness: 0.88, metalness: 0.08 }),
  interior: new THREE.MeshStandardMaterial({ color: 0x6f8698, roughness: 0.92, metalness: 0.04 }),
  gap: new THREE.MeshStandardMaterial({ color: 0x7a90a2, roughness: 0.94, metalness: 0.04 }),
  wire: new THREE.MeshStandardMaterial({ color: 0xf2f6fa, roughness: 0.55, metalness: 0.25 }),
  pinkNote: new THREE.MeshStandardMaterial({ color: 0xffc4d6, roughness: 0.95, metalness: 0 }),
  yellowNote: new THREE.MeshStandardMaterial({ color: 0xffe58a, roughness: 0.95, metalness: 0 }),
  tape: new THREE.MeshStandardMaterial({ color: 0xf7f2e8, roughness: 0.92, metalness: 0 })
};

const lockerBank = new THREE.Group();
lockerBank.position.y = 0.05;
scene.add(lockerBank);

const doorPivots = [];
const clickableDoors = [];

// Positive Y: right-hinged door swings outward to ~120°.
const DOOR_OPEN_ANGLE = (Math.PI * 2) / 3;
const doorAnim = {
  open: false,
  progress: 0,
  duration: 0.55
};

function setShadows(root) {
  root.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
}

function boxMesh(width, height, depth, material) {
  return new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
}

function roundedMesh(width, height, depth, radius, material, segments = 2) {
  return new THREE.Mesh(
    new RoundedBoxGeometry(width, height, depth, segments, radius),
    material
  );
}

function addInteriorStructure(locker, bodyH, innerW, innerD) {
  // Two baffles → three compartments.
  const baffleH = 0.036;
  const baffleYs = [FOOT_H + bodyH * (1 / 3), FOOT_H + bodyH * (2 / 3)];

  for (const y of baffleYs) {
    const baffle = boxMesh(innerW, baffleH, innerD * 0.96, materials.door);
    baffle.position.set(0, y, WALL * 0.12);
    locker.add(baffle);
  }
}

function addVents(door, centerY) {
  // Simplified low-poly vent stack (3 slots).
  const count = 3;
  const ventW = DOOR_WIDTH * 0.52;
  const ventH = 0.034;
  const ventD = 0.016;
  const gap = 0.062;
  const startY = centerY + ((count - 1) * gap) / 2;

  for (let i = 0; i < count; i += 1) {
    const vent = roundedMesh(ventW, ventH, ventD, 0.012, materials.recess, 1);
    vent.position.set(0.02, startY - i * gap, DOOR_THICK / 2 + 0.005);
    door.add(vent);
  }
}

function addHandle(door) {
  // Recessed embedded handle — soft toy silhouette.
  const recess = roundedMesh(0.13, 0.4, 0.02, 0.035, materials.recess, 2);
  recess.position.set(-DOOR_WIDTH * 0.3, -DOOR_HEIGHT * 0.015, DOOR_THICK / 2 + 0.006);
  door.add(recess);

  const grip = roundedMesh(0.048, 0.26, 0.028, 0.02, materials.handle, 2);
  grip.position.set(-DOOR_WIDTH * 0.3, -DOOR_HEIGHT * 0.015, DOOR_THICK / 2 + 0.024);
  door.add(grip);
}

function addStickyNote(door, index) {
  // Sparse pink / yellow notes for campus warmth across the eight-door bank.
  if (index === 0) {
    const note = roundedMesh(0.22, 0.18, 0.014, 0.02, materials.yellowNote, 1);
    note.position.set(DOOR_WIDTH * 0.08, DOOR_HEIGHT * 0.18, DOOR_THICK / 2 + 0.01);
    note.rotation.z = -0.08;
    door.add(note);

    const tape = roundedMesh(0.07, 0.14, 0.012, 0.01, materials.tape, 1);
    tape.position.set(DOOR_WIDTH * 0.12, DOOR_HEIGHT * 0.24, DOOR_THICK / 2 + 0.018);
    tape.rotation.z = 0.18;
    door.add(tape);
  }

  if (index === 3) {
    const note = roundedMesh(0.2, 0.16, 0.014, 0.02, materials.pinkNote, 1);
    note.position.set(DOOR_WIDTH * 0.05, -DOOR_HEIGHT * 0.22, DOOR_THICK / 2 + 0.01);
    note.rotation.z = 0.1;
    door.add(note);
  }

  if (index === 6) {
    const note = roundedMesh(0.18, 0.15, 0.014, 0.02, materials.yellowNote, 1);
    note.position.set(DOOR_WIDTH * 0.02, DOOR_HEIGHT * 0.12, DOOR_THICK / 2 + 0.01);
    note.rotation.z = 0.06;
    door.add(note);
  }
}

function createLocker(index) {
  const locker = new THREE.Group();
  const bodyH = LOCKER_HEIGHT - FOOT_H;
  const bodyY = FOOT_H + bodyH / 2;
  const innerW = LOCKER_WIDTH - WALL * 2;
  const innerD = LOCKER_DEPTH - WALL;
  const frontZ = LOCKER_DEPTH / 2;

  const foot = roundedMesh(
    LOCKER_WIDTH * 0.9,
    FOOT_H,
    LOCKER_DEPTH * 0.86,
    0.02,
    materials.frame,
    2
  );
  foot.position.set(0, FOOT_H / 2, 0);
  locker.add(foot);

  const back = boxMesh(LOCKER_WIDTH, bodyH, WALL, materials.interior);
  back.position.set(0, bodyY, -LOCKER_DEPTH / 2 + WALL / 2);
  locker.add(back);

  const left = boxMesh(WALL, bodyH, LOCKER_DEPTH, materials.body);
  left.position.set(-LOCKER_WIDTH / 2 + WALL / 2, bodyY, 0);
  locker.add(left);

  const right = boxMesh(WALL, bodyH, LOCKER_DEPTH, materials.body);
  right.position.set(LOCKER_WIDTH / 2 - WALL / 2, bodyY, 0);
  locker.add(right);

  const top = roundedMesh(LOCKER_WIDTH, WALL, LOCKER_DEPTH, 0.018, materials.frame, 2);
  top.position.set(0, FOOT_H + bodyH - WALL / 2, 0);
  locker.add(top);

  const bottom = boxMesh(LOCKER_WIDTH, WALL, LOCKER_DEPTH, materials.body);
  bottom.position.set(0, FOOT_H + WALL / 2, 0);
  locker.add(bottom);

  addInteriorStructure(locker, bodyH, innerW, innerD);

  const frameFront = frontZ - FRAME / 2;
  const frameTop = roundedMesh(LOCKER_WIDTH, FRAME, FRAME, 0.012, materials.frame, 1);
  frameTop.position.set(0, FOOT_H + bodyH - FRAME / 2, frameFront);
  locker.add(frameTop);

  const frameBottom = roundedMesh(LOCKER_WIDTH, FRAME, FRAME, 0.012, materials.frame, 1);
  frameBottom.position.set(0, FOOT_H + FRAME / 2, frameFront);
  locker.add(frameBottom);

  const frameLeft = boxMesh(FRAME, bodyH - FRAME * 2, FRAME, materials.frame);
  frameLeft.position.set(-LOCKER_WIDTH / 2 + FRAME / 2, bodyY, frameFront);
  locker.add(frameLeft);

  const frameRight = boxMesh(FRAME, bodyH - FRAME * 2, FRAME, materials.frame);
  frameRight.position.set(LOCKER_WIDTH / 2 - FRAME / 2, bodyY, frameFront);
  locker.add(frameRight);

  const doorPivot = new THREE.Group();
  doorPivot.name = `door-pivot-${index + 1}`;
  doorPivot.position.set(LOCKER_WIDTH / 2 - WALL, FOOT_H + bodyH / 2, frontZ);
  doorPivot.rotation.y = 0;
  locker.add(doorPivot);

  const door = roundedMesh(DOOR_WIDTH, DOOR_HEIGHT, DOOR_THICK, ROUND, materials.door, 3);
  door.position.set(-DOOR_WIDTH / 2, 0, DOOR_THICK / 2);
  door.name = `door-${index + 1}`;
  door.userData.lockerIndex = index;
  doorPivot.add(door);

  addVents(door, DOOR_HEIGHT * 0.3);
  addVents(door, -DOOR_HEIGHT * 0.32);
  addHandle(door);
  addStickyNote(door, index);

  setShadows(locker);
  return { locker, doorPivot, door };
}

for (let index = 0; index < LOCKER_COUNT; index += 1) {
  const { locker, doorPivot, door } = createLocker(index);
  locker.position.x = -TOTAL_WIDTH / 2 + LOCKER_WIDTH / 2 + index * (LOCKER_WIDTH + GAP);
  lockerBank.add(locker);
  doorPivots.push(doorPivot);
  if (index === 0) clickableDoors.push(door);
}

console.assert(
  doorPivots.length === LOCKER_COUNT && doorPivots.every((pivot) => pivot.rotation.y === 0),
  'Eight locker doors must exist and start closed.'
);

setShadows(lockerBank);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 16),
  new THREE.ShadowMaterial({ color: 0x8a97a6, opacity: 0.12 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
scene.add(floor);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();
let pointerDown = null;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function setPointerFromEvent(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function toggleFirstDoor() {
  doorAnim.open = !doorAnim.open;
}

renderer.domElement.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  pointerDown = { x: event.clientX, y: event.clientY };
});

renderer.domElement.addEventListener('pointerup', (event) => {
  if (!pointerDown || event.button !== 0) return;
  const dx = event.clientX - pointerDown.x;
  const dy = event.clientY - pointerDown.y;
  pointerDown = null;
  if (dx * dx + dy * dy > 36) return;

  setPointerFromEvent(event);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(clickableDoors, true);
  if (hits.length > 0) toggleFirstDoor();
});

function resizeScene() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;
  const viewWidth = TOTAL_WIDTH / 0.72;
  const viewHeight = viewWidth / aspect;

  camera.left = -viewWidth / 2;
  camera.right = viewWidth / 2;
  camera.top = viewHeight / 2;
  camera.bottom = -viewHeight / 2;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const dir = doorAnim.open ? 1 : -1;
  doorAnim.progress = THREE.MathUtils.clamp(
    doorAnim.progress + (dir * dt) / doorAnim.duration,
    0,
    1
  );
  const t = easeInOutCubic(doorAnim.progress);
  doorPivots[0].rotation.y = DOOR_OPEN_ANGLE * t;

  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', resizeScene);
resizeScene();
renderer.setAnimationLoop(animate);
