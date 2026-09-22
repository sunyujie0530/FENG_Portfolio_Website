import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import './style.css';

const app = document.querySelector('#app');
const scene = new THREE.Scene();
// Fog-white campus backdrop.
scene.background = new THREE.Color(0xf5f1e8);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.22;
// Soft studio env — kept low so locker matte + lime guitar stay readable.
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35;
pmrem.dispose();
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

const target = new THREE.Vector3(0, LOCKER_CENTER_Y * 0.98 + 0.32, 0);
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
scene.add(new THREE.AmbientLight(0xfaf4e6, 1.15));

const hemisphere = new THREE.HemisphereLight(0xfffaf0, 0xe4d7b0, 1.2);
scene.add(hemisphere);

const keyLight = new THREE.DirectionalLight(0xfff6e8, 1.15);
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

const fillLight = new THREE.DirectionalLight(0xf3e6c8, 0.85);
fillLight.position.set(5, 4.5, 4.5);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xf0e4c4, 0.35);
rimLight.position.set(1.5, 5, -3.5);
scene.add(rimLight);

const softBounce = new THREE.PointLight(0xfff3d8, 14, 12, 2);
softBounce.position.set(0, 2, 3);
scene.add(softBounce);

scene.fog = new THREE.Fog(0xf5f1e8, 16, 30);

// Matte butter-yellow lockers — image 3 campus cream.
const soft = { roughness: 0.88, metalness: 0.06 };
const materials = {
  body: new THREE.MeshStandardMaterial({ color: 0xe0c256, ...soft }),
  door: new THREE.MeshStandardMaterial({ color: 0xebcf62, ...soft }),
  frame: new THREE.MeshStandardMaterial({ color: 0xd4b448, ...soft }),
  recess: new THREE.MeshStandardMaterial({ color: 0xc49a2e, roughness: 0.92, metalness: 0.05 }),
  handle: new THREE.MeshStandardMaterial({ color: 0xb88822, roughness: 0.88, metalness: 0.08 }),
  interior: new THREE.MeshStandardMaterial({ color: 0xc9ae48, roughness: 0.92, metalness: 0.04 }),
  gap: new THREE.MeshStandardMaterial({ color: 0xc4a83e, roughness: 0.94, metalness: 0.04 }),
  wire: new THREE.MeshStandardMaterial({ color: 0xf2f6fa, roughness: 0.55, metalness: 0.25 }),
  pinkNote: new THREE.MeshStandardMaterial({ color: 0xffc4d6, roughness: 0.95, metalness: 0 }),
  yellowNote: new THREE.MeshStandardMaterial({ color: 0xfff8d0, roughness: 0.95, metalness: 0 }),
  tape: new THREE.MeshStandardMaterial({ color: 0xf7f2e8, roughness: 0.92, metalness: 0 }),
  // Soft-toy Warlock: deep lime base + emissive → neon under soft wrap / ACES.
  guitarBody: new THREE.MeshStandardMaterial({
    color: 0x2aa800,
    roughness: 0.45,
    metalness: 0.05,
    transparent: true,
    opacity: 0.92,
    emissive: new THREE.Color(0x4ec700),
    emissiveIntensity: 0.48,
    envMapIntensity: 0.15
  }),
  guitarNeck: new THREE.MeshStandardMaterial({ color: 0x1a1c1f, roughness: 0.78, metalness: 0.08 }),
  guitarFretboard: new THREE.MeshStandardMaterial({ color: 0x121416, roughness: 0.86, metalness: 0.04 }),
  guitarInlay: new THREE.MeshStandardMaterial({ color: 0xe8eef4, roughness: 0.55, metalness: 0.05 }),
  guitarHardware: new THREE.MeshStandardMaterial({ color: 0x9aa7b4, roughness: 0.4, metalness: 0.72 }),
  guitarPickup: new THREE.MeshStandardMaterial({ color: 0x101214, roughness: 0.75, metalness: 0.12 }),
  guitarString: new THREE.MeshStandardMaterial({ color: 0xb8c2cc, roughness: 0.4, metalness: 0.65 }),
  limeBoard: new THREE.MeshStandardMaterial({ color: 0xb6e84a, roughness: 0.72, metalness: 0.04 }),
  acrylic: new THREE.MeshPhysicalMaterial({
    color: 0xeef8ff,
    roughness: 0.14,
    metalness: 0,
    transmission: 0.55,
    thickness: 0.06,
    transparent: true,
    opacity: 0.42,
    ior: 1.45,
    side: THREE.DoubleSide
  }),
  pencil: new THREE.MeshStandardMaterial({ color: 0xf2c230, roughness: 0.78, metalness: 0 }),
  eraser: new THREE.MeshStandardMaterial({ color: 0xf4b8c4, roughness: 0.9, metalness: 0 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xe8c27a, roughness: 0.82, metalness: 0 }),
  lead: new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.55, metalness: 0.2 }),
  penBlack: new THREE.MeshStandardMaterial({ color: 0x1c1e22, roughness: 0.45, metalness: 0.15 }),
  penBlue: new THREE.MeshStandardMaterial({ color: 0x2f6fdb, roughness: 0.42, metalness: 0.12 }),
  penClear: new THREE.MeshStandardMaterial({
    color: 0xc5d4e2,
    roughness: 0.22,
    metalness: 0.05,
    transparent: true,
    opacity: 0.55
  }),
  scissorHandle: new THREE.MeshStandardMaterial({ color: 0xe24b3c, roughness: 0.55, metalness: 0.08 }),
  scissorBlade: new THREE.MeshStandardMaterial({ color: 0xc5ced6, roughness: 0.28, metalness: 0.7 }),
  posterCream: new THREE.MeshStandardMaterial({ color: 0xf4ead2, roughness: 0.9, metalness: 0 }),
  posterInk: new THREE.MeshStandardMaterial({ color: 0x1f2430, roughness: 0.86, metalness: 0 }),
  posterRed: new THREE.MeshStandardMaterial({ color: 0xc94b3a, roughness: 0.82, metalness: 0 }),
  posterGold: new THREE.MeshStandardMaterial({ color: 0xf0c94a, roughness: 0.78, metalness: 0 }),
  posterGrid: new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.88, metalness: 0 }),
  stickerY: new THREE.MeshStandardMaterial({ color: 0xffe066, roughness: 0.78, metalness: 0 }),
  stickerY2: new THREE.MeshStandardMaterial({ color: 0xffc107, roughness: 0.76, metalness: 0 }),
  stickerY3: new THREE.MeshStandardMaterial({ color: 0xfff3a0, roughness: 0.82, metalness: 0 }),
  stickerInk: new THREE.MeshStandardMaterial({ color: 0x3b2a08, roughness: 0.7, metalness: 0 }),
  hpShell: new THREE.MeshStandardMaterial({ color: 0x1a1c1f, roughness: 0.42, metalness: 0.18 }),
  hpPad: new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.88, metalness: 0 }),
  hpGrill: new THREE.MeshStandardMaterial({ color: 0x2c3036, roughness: 0.55, metalness: 0.25 }),
  hpCable: new THREE.MeshStandardMaterial({ color: 0x0e0e10, roughness: 0.7, metalness: 0.05 })
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

function cylinder(rTop, rBot, h, material, segs = 8) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), material);
}

function makePencil(len = 0.34) {
  const g = new THREE.Group();
  const bodyH = len * 0.72;
  const body = cylinder(0.011, 0.011, bodyH, materials.pencil, 6);
  body.position.y = 0;
  g.add(body);
  const ferrule = cylinder(0.012, 0.012, 0.022, materials.guitarHardware, 8);
  ferrule.position.y = bodyH / 2 + 0.012;
  g.add(ferrule);
  const eraser = cylinder(0.011, 0.011, 0.02, materials.eraser, 8);
  eraser.position.y = ferrule.position.y + 0.02;
  g.add(eraser);
  const wood = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.036, 6), materials.wood);
  wood.position.y = -bodyH / 2 - 0.01;
  wood.rotation.x = Math.PI;
  g.add(wood);
  const lead = new THREE.Mesh(new THREE.ConeGeometry(0.004, 0.012, 6), materials.lead);
  lead.position.y = -bodyH / 2 - 0.03;
  lead.rotation.x = Math.PI;
  g.add(lead);
  return g;
}

function makePen(bodyMat, capMat, len = 0.32) {
  const g = new THREE.Group();
  const barrel = cylinder(0.01, 0.01, len * 0.62, bodyMat, 10);
  g.add(barrel);
  const grip = cylinder(0.011, 0.01, 0.04, materials.penClear, 10);
  grip.position.y = -len * 0.22;
  g.add(grip);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.028, 8), capMat);
  tip.position.y = -len * 0.36;
  tip.rotation.x = Math.PI;
  g.add(tip);
  const cap = cylinder(0.011, 0.011, 0.06, capMat, 10);
  cap.position.y = len * 0.28;
  g.add(cap);
  const clip = boxMesh(0.006, 0.05, 0.01, capMat);
  clip.position.set(0.012, len * 0.26, 0);
  g.add(clip);
  return g;
}

function makeScissors() {
  const g = new THREE.Group();
  const loopL = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 8, 14), materials.scissorHandle);
  loopL.position.set(-0.016, 0.03, 0);
  g.add(loopL);
  const loopR = loopL.clone();
  loopR.position.set(0.018, 0.024, 0);
  g.add(loopR);
  const bladeL = boxMesh(0.012, 0.11, 0.004, materials.scissorBlade);
  bladeL.position.set(-0.006, -0.05, 0.002);
  bladeL.rotation.z = 0.09;
  g.add(bladeL);
  const bladeR = boxMesh(0.012, 0.11, 0.004, materials.scissorBlade);
  bladeR.position.set(0.008, -0.05, -0.002);
  bladeR.rotation.z = -0.07;
  g.add(bladeR);
  const pivot = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 8), materials.guitarHardware);
  pivot.position.set(0.002, -0.01, 0);
  g.add(pivot);
  g.rotation.z = -0.12;
  return g;
}

function createPenCup() {
  const cup = new THREE.Group();
  cup.name = 'pen-cup';

  const board = roundedMesh(0.24, 0.3, 0.014, 0.018, materials.limeBoard, 2);
  board.position.z = -0.02;
  cup.add(board);

  const well = roundedMesh(0.2, 0.16, 0.01, 0.012, materials.interior, 1);
  well.position.set(0, -0.04, -0.008);
  cup.add(well);

  const wallW = 0.22;
  const wallH = 0.17;
  const wallD = 0.07;
  const thick = 0.012;
  const front = roundedMesh(wallW, wallH, thick, 0.008, materials.acrylic, 1);
  front.position.set(0, -0.04, wallD / 2);
  cup.add(front);
  const sideL = roundedMesh(thick, wallH, wallD, 0.006, materials.acrylic, 1);
  sideL.position.set(-wallW / 2, -0.04, 0);
  cup.add(sideL);
  const sideR = sideL.clone();
  sideR.position.x = wallW / 2;
  cup.add(sideR);
  const bottom = roundedMesh(wallW, thick, wallD, 0.006, materials.acrylic, 1);
  bottom.position.set(0, -0.04 - wallH / 2, 0);
  cup.add(bottom);

  const xs = [-0.07, -0.045, -0.02];
  xs.forEach((x, i) => {
    const pencil = makePencil(0.36 - i * 0.012);
    pencil.position.set(x, 0.08, 0.01);
    pencil.rotation.set(0.08, 0, 0.04 * (i - 1));
    cup.add(pencil);
  });

  const black = makePen(materials.penBlack, materials.penBlack, 0.3);
  black.position.set(0.01, 0.07, 0.012);
  black.rotation.z = 0.05;
  cup.add(black);

  const blue = makePen(materials.penClear, materials.penBlue, 0.32);
  blue.position.set(0.038, 0.09, 0.008);
  blue.rotation.z = -0.04;
  cup.add(blue);

  const scissors = makeScissors();
  scissors.position.set(0.078, 0.04, 0.02);
  scissors.scale.setScalar(0.95);
  cup.add(scissors);

  return cup;
}

function posterSheet(w, h, material, graphics) {
  const sheet = new THREE.Group();
  const card = roundedMesh(w, h, 0.012, 0.012, material, 1);
  sheet.add(card);
  graphics.forEach((item) => sheet.add(item));
  return sheet;
}

function typeBlock(w, h, d, material, x, y, z = 0.01) {
  const bar = boxMesh(w, h, d, material);
  bar.position.set(x, y, z);
  return bar;
}

function createPosterCluster() {
  const cluster = new THREE.Group();
  cluster.name = 'poster-cluster';

  const back = posterSheet(0.26, 0.32, materials.posterCream, [
    typeBlock(0.16, 0.04, 0.008, materials.posterRed, 0, 0.1),
    typeBlock(0.12, 0.03, 0.008, materials.posterInk, 0, 0.04),
    new THREE.Mesh(new THREE.CircleGeometry(0.04, 12), materials.posterGold)
  ]);
  back.children[2].position.set(-0.05, -0.08, 0.01);
  back.position.set(-0.06, 0.08, 0);
  back.rotation.z = -0.18;
  cluster.add(back);

  const mid = posterSheet(0.24, 0.3, materials.posterInk, [
    typeBlock(0.18, 0.055, 0.008, materials.posterGold, 0, 0.06),
    typeBlock(0.1, 0.02, 0.008, materials.posterCream, 0, -0.02),
    typeBlock(0.14, 0.018, 0.008, materials.posterRed, 0.02, -0.08)
  ]);
  mid.position.set(0.08, 0.1, 0.012);
  mid.rotation.z = 0.16;
  cluster.add(mid);

  const hero = posterSheet(0.28, 0.34, materials.posterGold, [
    typeBlock(0.2, 0.07, 0.01, materials.posterInk, 0, 0.04),
    typeBlock(0.12, 0.025, 0.008, materials.posterRed, -0.03, -0.06),
    typeBlock(0.08, 0.08, 0.008, materials.posterCream, 0.07, -0.1)
  ]);
  hero.position.set(0.0, 0.02, 0.024);
  hero.rotation.z = 0.04;
  cluster.add(hero);

  const front = posterSheet(0.22, 0.28, materials.posterCream, [
    typeBlock(0.16, 0.05, 0.01, materials.posterInk, 0, 0.06),
    typeBlock(0.18, 0.01, 0.008, materials.posterRed, 0, 0.0),
    typeBlock(0.14, 0.01, 0.008, materials.posterGrid, 0, -0.04),
    typeBlock(0.1, 0.04, 0.008, materials.posterGold, -0.03, -0.09)
  ]);
  front.position.set(-0.04, -0.08, 0.036);
  front.rotation.z = -0.08;
  cluster.add(front);

  const grid = posterSheet(0.16, 0.2, materials.posterGrid, [
    typeBlock(0.05, 0.05, 0.008, materials.posterRed, -0.03, 0.03),
    typeBlock(0.05, 0.05, 0.008, materials.posterGold, 0.03, -0.03)
  ]);
  grid.position.set(0.12, -0.04, 0.018);
  grid.rotation.z = 0.22;
  cluster.add(grid);

  return cluster;
}

function faceDisc(r, depth, material) {
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, depth, 16), material);
  disc.rotation.x = Math.PI / 2;
  return disc;
}

function createSticker(kind) {
  const g = new THREE.Group();
  if (kind === 'smiley') {
    g.add(faceDisc(0.055, 0.012, materials.stickerY));
    const eyeL = faceDisc(0.007, 0.01, materials.stickerInk);
    eyeL.position.set(-0.016, 0.012, 0.008);
    g.add(eyeL);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.016;
    g.add(eyeR);
    const smile = new THREE.Mesh(
      new THREE.TorusGeometry(0.022, 0.005, 6, 10, Math.PI),
      materials.stickerInk
    );
    smile.rotation.set(Math.PI, 0, 0);
    smile.position.z = 0.008;
    smile.position.y = -0.006;
    g.add(smile);
  } else if (kind === 'flower') {
    g.add(faceDisc(0.018, 0.012, materials.stickerY2));
    for (let i = 0; i < 5; i += 1) {
      const petal = roundedMesh(0.028, 0.038, 0.01, 0.012, materials.stickerY3, 1);
      const a = (i / 5) * Math.PI * 2;
      petal.position.set(Math.cos(a) * 0.028, Math.sin(a) * 0.028, 0);
      petal.rotation.z = a;
      g.add(petal);
    }
  } else if (kind === 'speech') {
    const bubble = roundedMesh(0.1, 0.072, 0.012, 0.02, materials.stickerY, 2);
    g.add(bubble);
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.03, 3), materials.stickerY);
    tail.rotation.z = 0.6;
    tail.position.set(-0.038, -0.038, 0);
    g.add(tail);
    g.add(typeBlock(0.05, 0.008, 0.008, materials.stickerInk, 0, 0.008, 0.01));
    g.add(typeBlock(0.036, 0.008, 0.008, materials.stickerInk, -0.006, -0.01, 0.01));
  } else if (kind === 'rainbow') {
    [0.042, 0.03, 0.018].forEach((r, i) => {
      const mats = [materials.stickerY2, materials.stickerY, materials.stickerY3];
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.007, 6, 12, Math.PI),
        mats[i]
      );
      arc.rotation.z = Math.PI;
      g.add(arc);
    });
  } else if (kind === 'peace') {
    g.add(faceDisc(0.05, 0.012, materials.stickerY2));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.005, 6, 16), materials.stickerInk);
    ring.rotation.x = Math.PI / 2;
    ring.position.z = 0.006;
    g.add(ring);
    const stem = boxMesh(0.008, 0.062, 0.008, materials.stickerInk);
    stem.position.z = 0.008;
    g.add(stem);
    const armL = boxMesh(0.008, 0.03, 0.008, materials.stickerInk);
    armL.position.set(-0.012, -0.01, 0.008);
    armL.rotation.z = 0.55;
    g.add(armL);
    const armR = armL.clone();
    armR.position.x = 0.012;
    armR.rotation.z = -0.55;
    g.add(armR);
  } else if (kind === 'badge') {
    const plate = roundedMesh(0.12, 0.09, 0.014, 0.016, materials.stickerY, 2);
    g.add(plate);
    g.add(typeBlock(0.08, 0.012, 0.008, materials.stickerInk, 0, 0.016, 0.01));
    g.add(typeBlock(0.06, 0.01, 0.008, materials.stickerInk, 0, 0.0, 0.01));
    g.add(typeBlock(0.05, 0.01, 0.008, materials.stickerInk, 0, -0.016, 0.01));
  }
  return g;
}

function createHeadphones() {
  const hp = new THREE.Group();
  hp.name = 'headphones';

  const band = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.022, 8, 20, Math.PI),
    materials.hpShell
  );
  band.position.y = 0.04;
  hp.add(band);

  const cushion = new THREE.Mesh(
    new THREE.TorusGeometry(0.205, 0.026, 8, 20, Math.PI),
    materials.hpPad
  );
  cushion.position.y = 0.04;
  hp.add(cushion);

  [-1, 1].forEach((side) => {
    const cup = new THREE.Group();
    const shell = cylinder(0.09, 0.1, 0.07, materials.hpShell, 16);
    shell.rotation.x = Math.PI / 2;
    cup.add(shell);

    const face = new THREE.Mesh(new THREE.CircleGeometry(0.072, 16), materials.hpGrill);
    face.position.z = 0.038;
    cup.add(face);

    const pad = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.026, 8, 18), materials.hpPad);
    pad.position.z = 0.02;
    cup.add(pad);

    const yoke = cylinder(0.016, 0.016, 0.1, materials.hpShell, 8);
    yoke.position.set(0, 0.1, -0.01);
    cup.add(yoke);

    cup.position.set(side * 0.22, -0.1, 0.04);
    cup.rotation.y = side * 0.35;
    hp.add(cup);
  });

  const cable = cylinder(0.008, 0.008, 0.5, materials.hpCable, 6);
  cable.position.set(-0.18, -0.38, 0.05);
  cable.rotation.z = 0.2;
  hp.add(cable);

  return hp;
}

function dressDoor(door, index) {
  if (index === 0) {
    const hp = createHeadphones();
    hp.position.set(-DOOR_WIDTH * 0.18, -DOOR_HEIGHT * 0.12, DOOR_THICK / 2 + 0.14);
    hp.rotation.set(0.06, -0.22, 0.08);
    hp.scale.setScalar(1.35);
    door.add(hp);
  }

  if (index === 1) {
    const cup = createPenCup();
    cup.scale.setScalar(1.75);
    cup.position.set(0.04, DOOR_HEIGHT * 0.16, DOOR_THICK / 2 + 0.06);
    door.add(cup);
  }

  if (index === 4) {
    const posters = createPosterCluster();
    posters.scale.setScalar(1.85);
    posters.position.set(0.02, DOOR_HEIGHT * 0.2, DOOR_THICK / 2 + 0.04);
    door.add(posters);
  }

  const z = DOOR_THICK / 2 + 0.016;
  const stickerMap = {
    2: [
      ['smiley', 0.2, DOOR_HEIGHT * 0.2, 0.22],
      ['flower', -0.14, -DOOR_HEIGHT * 0.16, -0.18]
    ],
    4: [
      ['speech', -0.22, -DOOR_HEIGHT * 0.1, -0.18],
      ['rainbow', 0.22, DOOR_HEIGHT * 0.06, 0.1]
    ],
    5: [
      ['peace', 0.18, DOOR_HEIGHT * 0.24, 0.14],
      ['badge', -0.1, -DOOR_HEIGHT * 0.16, -0.1]
    ],
    7: [
      ['smiley', -0.16, DOOR_HEIGHT * 0.18, -0.22],
      ['flower', 0.2, -DOOR_HEIGHT * 0.1, 0.16]
    ]
  };

  (stickerMap[index] || []).forEach(([kind, x, y, rz]) => {
    const sticker = createSticker(kind);
    sticker.scale.setScalar(2.1);
    sticker.position.set(x, y, z);
    sticker.rotation.z = rz;
    door.add(sticker);
  });
}

function warlockBodyShape() {
  // Classic Warlock front silhouette — sharp horns, soft-toy scale.
  const shape = new THREE.Shape();
  shape.moveTo(0.0, 0.4);
  shape.lineTo(0.07, 0.34);
  shape.lineTo(0.2, 0.62);
  shape.lineTo(0.36, 0.3);
  shape.lineTo(0.28, 0.1);
  shape.lineTo(0.44, -0.04);
  shape.lineTo(0.26, -0.14);
  shape.lineTo(0.38, -0.36);
  shape.lineTo(0.12, -0.26);
  shape.lineTo(0.2, -0.56);
  shape.lineTo(0.0, -0.4);
  shape.lineTo(-0.2, -0.56);
  shape.lineTo(-0.12, -0.26);
  shape.lineTo(-0.38, -0.36);
  shape.lineTo(-0.26, -0.14);
  shape.lineTo(-0.44, -0.04);
  shape.lineTo(-0.28, 0.1);
  shape.lineTo(-0.36, 0.3);
  shape.lineTo(-0.2, 0.62);
  shape.lineTo(-0.07, 0.34);
  shape.closePath();
  return shape;
}

function warlockHeadstockShape() {
  const shape = new THREE.Shape();
  shape.moveTo(0.0, 0.16);
  shape.lineTo(0.055, 0.1);
  shape.lineTo(0.095, 0.2);
  shape.lineTo(0.078, 0.04);
  shape.lineTo(0.06, -0.12);
  shape.lineTo(0.0, -0.16);
  shape.lineTo(-0.06, -0.12);
  shape.lineTo(-0.078, 0.04);
  shape.lineTo(-0.095, 0.2);
  shape.lineTo(-0.055, 0.1);
  shape.closePath();
  return shape;
}

function extrudeShape(shape, depth, material, bevel = 0.012) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.85,
    bevelSegments: 2,
    curveSegments: 1
  });
  geometry.center();
  return new THREE.Mesh(geometry, material);
}

function createWarlockGuitar() {
  const guitar = new THREE.Group();
  guitar.name = 'warlock-guitar';

  const bodyDepth = 0.068;
  const body = extrudeShape(warlockBodyShape(), bodyDepth, materials.guitarBody, 0.014);
  body.position.set(0, 0.02, 0);
  guitar.add(body);

  // Soft cavity silhouette through the candy-lime body.
  const cavity = roundedMesh(0.15, 0.32, 0.018, 0.02, materials.guitarPickup, 1);
  cavity.position.set(0.02, -0.02, -0.008);
  guitar.add(cavity);

  // Neck + fretboard sit proud of the translucent body.
  const neckLen = 0.72;
  const neck = roundedMesh(0.072, neckLen, 0.034, 0.01, materials.guitarNeck, 2);
  neck.position.set(0, 0.42 + neckLen / 2 - 0.04, 0.012);
  guitar.add(neck);

  const fretboard = roundedMesh(0.078, neckLen * 0.98, 0.012, 0.008, materials.guitarFretboard, 2);
  fretboard.position.set(0, neck.position.y, 0.032);
  guitar.add(fretboard);

  const fretCount = 12;
  for (let i = 1; i <= fretCount; i += 1) {
    const t = i / (fretCount + 1);
    const fret = boxMesh(0.076, 0.004, 0.006, materials.guitarHardware);
    fret.position.set(0, fretboard.position.y + neckLen * 0.46 - t * neckLen * 0.9, 0.04);
    guitar.add(fret);

    if ([3, 5, 7, 9].includes(i)) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.006, 8, 8),
        materials.guitarInlay
      );
      dot.position.set(0, fret.position.y - 0.018, 0.044);
      guitar.add(dot);
    }
  }

  const head = extrudeShape(warlockHeadstockShape(), 0.028, materials.guitarNeck, 0.006);
  head.position.set(0, neck.position.y + neckLen / 2 + 0.08, 0.01);
  head.scale.set(1.15, 1.15, 1);
  guitar.add(head);

  // 3+3 chrome tuners on the Widow headstock.
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i += 1) {
      const peg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.028, 10),
        materials.guitarHardware
      );
      peg.rotation.x = Math.PI / 2;
      peg.position.set(side * 0.055, head.position.y + 0.05 - i * 0.045, 0.03);
      guitar.add(peg);

      const button = roundedMesh(0.018, 0.03, 0.014, 0.005, materials.guitarHardware, 1);
      button.position.set(side * 0.078, peg.position.y, 0.03);
      guitar.add(button);
    }
  }

  const pickupYs = [0.12, -0.04];
  for (const y of pickupYs) {
    const pickup = roundedMesh(0.118, 0.048, 0.028, 0.01, materials.guitarPickup, 2);
    pickup.position.set(0, y, bodyDepth / 2 + 0.01);
    guitar.add(pickup);

    for (let pole = -2; pole <= 2; pole += 1) {
      const screw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.004, 0.01, 8),
        materials.guitarHardware
      );
      screw.rotation.x = Math.PI / 2;
      screw.position.set(pole * 0.018, y, bodyDepth / 2 + 0.026);
      guitar.add(screw);
    }
  }

  const bridge = roundedMesh(0.12, 0.04, 0.03, 0.008, materials.guitarHardware, 2);
  bridge.position.set(0, -0.18, bodyDepth / 2 + 0.012);
  guitar.add(bridge);

  // Diagonal control knobs on lower-right wing.
  const knobYs = [-0.08, -0.16, -0.24];
  knobYs.forEach((y, i) => {
    const knob = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.02, 0.022, 12),
      materials.guitarHardware
    );
    knob.rotation.x = Math.PI / 2;
    knob.position.set(0.16 - i * 0.012, y, bodyDepth / 2 + 0.028);
    guitar.add(knob);
  });

  // Six soft metallic strings from bridge to headstock.
  for (let i = 0; i < 6; i += 1) {
    const x = -0.04 + i * 0.016;
    const stringLen = 1.18;
    const string = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0016, 0.0016, stringLen, 5),
      materials.guitarString
    );
    string.position.set(x, 0.28, bodyDepth / 2 + 0.03);
    guitar.add(string);
  }

  setShadows(guitar);
  // Acrylic body should not cast heavy shadows — keep soft contact from hardware only.
  body.castShadow = false;
  return guitar;
}

function ransomPaperTexture(char, spec) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = spec.bg;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  for (let i = 0; i < 40; i += 1) {
    ctx.fillRect(Math.random() * size, Math.random() * size, 8, 2);
  }
  ctx.fillStyle = spec.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = spec.font;
  if (spec.stroke) {
    ctx.strokeStyle = spec.stroke;
    ctx.lineWidth = spec.strokeWidth || 10;
    ctx.strokeText(char, size / 2, size / 2 + 16);
  }
  ctx.fillText(char, size / 2, size / 2 + 16);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function createRansomLetter(char, spec) {
  const tex = ransomPaperTexture(char, spec);
  const paper = new THREE.MeshStandardMaterial({
    color: new THREE.Color(spec.bg),
    roughness: 0.92,
    metalness: 0
  });
  const face = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.86,
    metalness: 0
  });
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(spec.w, spec.h, 0.028), [
    paper,
    paper,
    paper,
    paper,
    face,
    paper
  ]);
  mesh.rotation.z = spec.rot;
  return mesh;
}

function createRansomTitle() {
  // Magazine-cut letters, mixed case / paper like the locker collage.
  const specs = [
    { ch: 'P', bg: '#1f4a3a', ink: '#f4a0b8', font: 'bold 300px Georgia, serif', w: 0.72, h: 0.84, rot: -0.05, y: 0.04 },
    { ch: 'r', bg: '#f2d24a', ink: '#6b4aa8', font: 'bold 310px "Arial Black", sans-serif', w: 0.6, h: 0.8, rot: 0.1, y: -0.03 },
    { ch: 'o', bg: '#f4c6d8', ink: '#3a1d6e', font: 'italic bold 300px Georgia, serif', w: 0.64, h: 0.72, rot: -0.14, y: 0.06 },
    { ch: 't', bg: '#2a3d28', ink: '#c6e85a', font: 'bold 280px "Comic Sans MS", "Chalkboard SE", cursive', w: 0.58, h: 0.78, rot: 0.12, y: 0.0 },
    { ch: 'f', bg: '#3d6ec9', ink: '#f7f2e4', font: 'bold 290px Impact, sans-serif', w: 0.6, h: 0.76, rot: -0.06, y: 0.05, stroke: '#c94b3a', strokeWidth: 14 },
    { ch: 'l', bg: '#f2a0c0', ink: '#222222', font: 'bold 330px "Times New Roman", serif', w: 0.52, h: 0.88, rot: 0.16, y: -0.05 },
    { ch: 'i', bg: '#f0c93a', ink: '#1a1a1a', font: 'bold 300px "Trebuchet MS", sans-serif', w: 0.48, h: 0.74, rot: -0.09, y: 0.03 },
    { ch: 'o', bg: '#243028', ink: '#f7f2e4', font: 'bold 300px Georgia, serif', w: 0.68, h: 0.82, rot: 0.06, y: 0.02 }
  ];

  const title = new THREE.Group();
  title.name = 'ransom-protflio';
  specs.forEach((spec, i) => {
    const letter = createRansomLetter(spec.ch, spec);
    const lockerX = -TOTAL_WIDTH / 2 + LOCKER_WIDTH / 2 + i * (LOCKER_WIDTH + GAP);
    letter.position.set(lockerX * 0.86, spec.y, i * 0.004);
    title.add(letter);
  });

  const topY = lockerBank.position.y + LOCKER_HEIGHT + 0.48;
  title.position.set(0, topY, LOCKER_DEPTH / 2 + 0.04);
  setShadows(title);
  return title;
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
  dressDoor(door, index);

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

const ransomTitle = createRansomTitle();
scene.add(ransomTitle);

// Neon Warlock leans on the rightmost locker — same soft campus lighting language.
const guitar = createWarlockGuitar();
const rightLockerX =
  -TOTAL_WIDTH / 2 + LOCKER_WIDTH / 2 + (LOCKER_COUNT - 1) * (LOCKER_WIDTH + GAP);
// Upright, flat on locker fronts (XY plane // doors), feet on floor.
guitar.scale.setScalar(1.15);
guitar.position.set(rightLockerX, 0.62, LOCKER_DEPTH / 2 + 0.1);
guitar.rotation.set(0, 0, 0);
scene.add(guitar);

const guitarFill = new THREE.PointLight(0xb6ff6a, 5.5, 3.4, 2);
guitarFill.position.set(rightLockerX + 0.2, 1.15, LOCKER_DEPTH / 2 + 1.0);
scene.add(guitarFill);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 16),
  new THREE.ShadowMaterial({ color: 0xb8a56a, opacity: 0.14 })
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
