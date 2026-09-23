import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import './style.css';
import { startIntro, returnToIntro } from './introMarquee.js';
import { hideWorks, showWorks, setWorksTransition } from './worksDiscs.js';

const app = document.querySelector('#app');
const scene = new THREE.Scene();
// Fog-white campus backdrop.
scene.background = new THREE.Color(0xf6f7fa);

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
scene.environmentIntensity = 0.16;
pmrem.dispose();
app.append(renderer.domElement);

const LOCKER_COUNT = 8;
// Wider than the first slim pass; height stays put.
const LOCKER_WIDTH = 1.22;
const LOCKER_DEPTH = 0.66;
const LOCKER_HEIGHT = 3.57;
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

const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 80);
// Mild wide lens: the middle of the row stays head-on, the ends pick up a little side.
camera.position.set(0, 3.18, 15);

const target = new THREE.Vector3(0, LOCKER_CENTER_Y * 0.98, 0);
camera.lookAt(target);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(target);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minZoom = 0.7;
controls.maxZoom = 3.4;
controls.minDistance = camera.position.distanceTo(target);
controls.maxDistance = controls.minDistance;
controls.minAzimuthAngle = -0.08;
controls.maxAzimuthAngle = 0.08;
controls.minPolarAngle = 1.25;
controls.maxPolarAngle = 1.52;
controls.update();

// Soft cool wrap light — clean, healing campus mood.
scene.add(new THREE.AmbientLight(0xf7f9fb, 0.52));

const hemisphere = new THREE.HemisphereLight(0xffffff, 0x8b939c, 0.36);
scene.add(hemisphere);

const keyLight = new THREE.DirectionalLight(0xffffff, 2.85);
keyLight.position.set(-0.6, 7.5, 14);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -12;
keyLight.shadow.camera.right = 12;
keyLight.shadow.camera.top = 8;
keyLight.shadow.camera.bottom = -2;
keyLight.shadow.radius = 4;
keyLight.shadow.blurSamples = 12;
keyLight.shadow.bias = -0.0002;
keyLight.shadow.normalBias = 0.04;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xc5ced6, 0.12);
fillLight.position.set(8, 3, 1);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xdfe6ee, 0.18);
rimLight.position.set(1.5, 5, -3.5);
scene.add(rimLight);

const softBounce = new THREE.PointLight(0xe7edf3, 3.5, 10, 2);
softBounce.position.set(0, 2, 3);
scene.add(softBounce);

scene.fog = new THREE.Fog(0xf6f7fa, 32, 60);

// Matte light gray — reference cabinet, not the butter yellow.
const soft = { roughness: 0.88, metalness: 0.06 };
const materials = {
  body: new THREE.MeshStandardMaterial({ color: 0x9aa3ac, ...soft }),
  door: new THREE.MeshStandardMaterial({ color: 0xd8dde3, ...soft }),
  frame: new THREE.MeshStandardMaterial({ color: 0xa7adb4, ...soft }),
  recess: new THREE.MeshStandardMaterial({ color: 0x7d868f, roughness: 0.92, metalness: 0.05 }),
  handle: new THREE.MeshStandardMaterial({ color: 0x5f686f, roughness: 0.88, metalness: 0.08 }),
  interior: new THREE.MeshStandardMaterial({ color: 0xaeb6be, roughness: 0.92, metalness: 0.04 }),
  pages: new THREE.MeshStandardMaterial({ color: 0xf4f0e6, roughness: 0.9, metalness: 0 }),
  pinkNote: new THREE.MeshStandardMaterial({ color: 0xffc4d6, roughness: 0.95, metalness: 0 }),
  yellowNote: new THREE.MeshStandardMaterial({ color: 0xfff8d0, roughness: 0.95, metalness: 0 }),
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
  stickerY: new THREE.MeshStandardMaterial({ color: 0xffe066, roughness: 0.78, metalness: 0 }),
  stickerY2: new THREE.MeshStandardMaterial({ color: 0xffc107, roughness: 0.76, metalness: 0 }),
  stickerY3: new THREE.MeshStandardMaterial({ color: 0xfff3a0, roughness: 0.82, metalness: 0 }),
  stickerInk: new THREE.MeshStandardMaterial({ color: 0x3b2a08, roughness: 0.7, metalness: 0 }),
  hpShell: new THREE.MeshStandardMaterial({
    color: 0x5cff14,
    roughness: 0.38,
    metalness: 0.08,
    emissive: new THREE.Color(0x3dff00),
    emissiveIntensity: 0.45
  }),
  hpPad: new THREE.MeshStandardMaterial({
    color: 0x3fe000,
    roughness: 0.72,
    metalness: 0,
    emissive: new THREE.Color(0x2ad400),
    emissiveIntensity: 0.28
  }),
  hpGrill: new THREE.MeshStandardMaterial({ color: 0x1f9a00, roughness: 0.5, metalness: 0.12 }),
  hpCable: new THREE.MeshStandardMaterial({ color: 0x145c0a, roughness: 0.7, metalness: 0.05 })
};

const lockerBank = new THREE.Group();
lockerBank.position.y = 0.05;
scene.add(lockerBank);

const doorPivots = [];
let idBadge = null;

// Positive Y: right-hinged door swings outward to ~120°.
const DOOR_OPEN_ANGLE = (Math.PI * 2) / 3;
const DOOR_ANIM_DURATION = 0.55;
const doorAnims = [];

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

function popMat(color) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0 });
}

const pop = {
  bookA: popMat(0xd5dbe6),
  bookB: popMat(0xff2d2d),
  bookC: popMat(0x3ec6ff),
  bookD: popMat(0xfff4e4),
  balm: popMat(0xff2f86),
  cap: popMat(0xffffff),
  stackA: popMat(0xf7fbff),
  stackB: popMat(0xffffff),
  stackC: popMat(0x7ad4ff),
  paper: popMat(0xfff0a8),
  paperBlue: popMat(0x2f7dff),
  frame: popMat(0x2a1a12),
  tea: popMat(0x14d35a),
  oval: popMat(0xfff6d8),
  band: popMat(0x7a33ff)
};

function standingBook(thick, height, depth, cover) {
  const book = new THREE.Group();
  book.add(boxMesh(thick, height, depth, cover));
  const pages = boxMesh(0.008, height * 0.92, depth * 0.9, materials.pages);
  pages.position.x = thick * 0.36;
  book.add(pages);
  return book;
}

function createShelfStillLife() {
  const g = new THREE.Group();
  const books = [
    [pop.bookA, 0.3, 0.05],
    [pop.bookB, 0.34, 0.055],
    [pop.bookC, 0.28, 0.042],
    [pop.bookD, 0.33, 0.05]
  ];
  let x = -0.4;
  books.forEach(([cover, height, thick]) => {
    const book = standingBook(thick, height, 0.13, cover);
    book.position.set(x, height / 2, 0);
    g.add(book);
    x += thick + 0.01;
  });

  const balm = cylinder(0.028, 0.028, 0.11, pop.balm, 16);
  balm.position.set(-0.08, 0.055, 0.02);
  g.add(balm);
  const cap = cylinder(0.03, 0.03, 0.028, pop.cap, 16);
  cap.position.set(-0.08, 0.124, 0.02);
  g.add(cap);
  const band = boxMesh(0.058, 0.012, 0.004, pop.cap);
  band.position.set(-0.08, 0.07, 0.048);
  g.add(band);

  [0.02, 0.018, 0.022].forEach((h, i) => {
    const mats = [pop.stackC, pop.stackA, pop.stackB];
    const flat = boxMesh(0.2, h, 0.13, mats[i]);
    flat.position.set(0.06, 0.012 + i * 0.02, 0.03);
    g.add(flat);
  });

  const slip = boxMesh(0.08, 0.12, 0.006, pop.paper);
  slip.position.set(0.02, 0.12, -0.02);
  slip.rotation.z = 0.12;
  g.add(slip);
  const slip2 = boxMesh(0.07, 0.1, 0.006, pop.paperBlue);
  slip2.position.set(0.1, 0.11, -0.03);
  slip2.rotation.z = -0.16;
  g.add(slip2);

  const glasses = new THREE.Group();
  [-1, 1].forEach((side) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.008, 8, 16), pop.frame);
    ring.position.x = side * 0.036;
    glasses.add(ring);
  });
  glasses.add(boxMesh(0.022, 0.008, 0.008, pop.frame));
  glasses.position.set(0.06, 0.09, 0.08);
  glasses.rotation.x = -0.55;
  g.add(glasses);

  const tea = boxMesh(0.22, 0.28, 0.05, pop.tea);
  tea.position.set(0.34, 0.14, 0);
  g.add(tea);
  const oval = new THREE.Mesh(new THREE.CircleGeometry(0.07, 18), pop.oval);
  oval.scale.y = 0.72;
  oval.position.set(0.34, 0.18, 0.027);
  g.add(oval);
  const stripe = boxMesh(0.14, 0.035, 0.004, pop.band);
  stripe.position.set(0.34, 0.08, 0.027);
  g.add(stripe);

  return g;
}

function addTopShelfLife(locker, shelfY, innerW) {
  const life = createShelfStillLife();
  life.scale.setScalar(innerW * 0.95);
  life.position.set(0, shelfY + 0.02, 0.02);
  locker.add(life);
}

function addInteriorStructure(locker, bodyH, innerW, innerD, cavityMat) {
  const topY = FOOT_H + bodyH * 0.86;
  const bayH = FOOT_H + bodyH - topY;

  const board = boxMesh(innerW * 0.94, 0.03, innerD * 0.86, cavityMat);
  board.position.set(0, topY, -innerD * 0.02);
  locker.add(board);

  const backPanel = boxMesh(innerW * 0.9, bayH * 0.92, 0.018, cavityMat);
  backPanel.position.set(0, topY + bayH * 0.46, -innerD * 0.46);
  locker.add(backPanel);

  [-1, 1].forEach((side) => {
    const cheek = boxMesh(0.02, bayH * 0.92, innerD * 0.7, cavityMat);
    cheek.position.set(side * innerW * 0.46, topY + bayH * 0.46, -innerD * 0.08);
    locker.add(cheek);
  });

  addTopShelfLife(locker, topY, innerW);

  const rod = cylinder(0.012, 0.012, innerW * 0.78, cavityMat, 8);
  rod.rotation.z = Math.PI / 2;
  rod.position.set(0, topY - 0.16, innerD * 0.08);
  locker.add(rod);
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

function createSketchNotebook() {
  const book = new THREE.Group();
  book.name = 'sketch-notebook';
  const pageW = 0.5;
  const pageH = 0.62;
  const backing = roundedMesh(pageW + 0.1, pageH + 0.18, 0.012, 0.02, materials.limeBoard, 2);
  backing.position.set(0, -0.02, -0.012);
  book.add(backing);

  const page = coverMesh(pageW, pageH, (ctx, w, h) => {
    ctx.fillStyle = '#f6f3ec';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#1c1c1c';
    ctx.fillStyle = '#1c1c1c';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    const stroke = (draw) => {
      ctx.beginPath();
      draw();
      ctx.stroke();
    };
    stroke(() => {
      ctx.roundRect(48, 70, 130, 110, 18);
      ctx.moveTo(78, 70);
      ctx.quadraticCurveTo(113, 28, 148, 70);
    });
    stroke(() => {
      ctx.roundRect(210, 60, 150, 90, 8);
      ctx.moveTo(250, 60);
      ctx.lineTo(270, 36);
      ctx.lineTo(310, 36);
      ctx.lineTo(330, 60);
    });
    stroke(() => {
      ctx.arc(120, 250, 36, Math.PI, 0);
      ctx.lineTo(156, 290);
      ctx.lineTo(84, 290);
      ctx.closePath();
    });
    stroke(() => {
      ctx.moveTo(230, 240);
      ctx.quadraticCurveTo(280, 200, 340, 250);
      ctx.quadraticCurveTo(300, 310, 230, 280);
    });
    stroke(() => {
      ctx.moveTo(70, 360);
      ctx.lineTo(150, 360);
      ctx.moveTo(110, 360);
      ctx.lineTo(110, 430);
      ctx.moveTo(80, 400);
      ctx.quadraticCurveTo(110, 370, 140, 400);
    });
    stroke(() => {
      ctx.roundRect(250, 360, 90, 55, 6);
      ctx.moveTo(268, 360);
      ctx.lineTo(268, 338);
      ctx.lineTo(322, 338);
      ctx.lineTo(322, 360);
    });
    stroke(() => {
      ctx.ellipse(160, 480, 28, 16, 0, 0, Math.PI * 2);
      ctx.moveTo(188, 480);
      ctx.lineTo(230, 468);
    });
  });
  page.position.z = 0.008;
  book.add(page);

  const ringMat = new THREE.MeshStandardMaterial({ color: 0xc5ccd2, roughness: 0.35, metalness: 0.55 });
  for (let i = 0; i < 11; i += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.0035, 6, 10), ringMat);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(-pageW / 2 + 0.04 + i * 0.042, pageH / 2 - 0.012, 0.01);
    book.add(ring);
  }

  const tray = new THREE.Group();
  tray.add(roundedMesh(pageW * 0.9, 0.055, 0.04, 0.012, materials.acrylic, 1));
  [0x2f6fe0, 0xe23b3b, 0x4aa3e8, 0xf0c21a, 0x39c16a, 0xff4f9a].forEach((color, i) => {
    const marker = new THREE.Group();
    const barrel = cylinder(0.011, 0.011, 0.1, popMat(color), 8);
    marker.add(barrel);
    const cap = cylinder(0.012, 0.012, 0.032, popMat(0xf4f1ea), 8);
    cap.position.y = 0.062;
    marker.add(cap);
    marker.position.set(-0.17 + i * 0.068, 0.02, 0.018);
    tray.add(marker);
  });
  tray.position.set(0, -pageH / 2 + 0.01, 0.028);
  book.add(tray);
  return book;
}

function typeBlock(w, h, d, material, x, y, z = 0.01) {
  const bar = boxMesh(w, h, d, material);
  bar.position.set(x, y, z);
  return bar;
}

function coverMesh(w, h, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = Math.max(64, Math.round(512 * (h / w)));
  const ctx = canvas.getContext('2d');
  paint(ctx, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.86, metalness: 0 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xd8d0c4, roughness: 0.92, metalness: 0 });
  return new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.01), [edge, edge, edge, edge, face, edge]);
}

function placeCover(cluster, mesh, x, y, z, rot) {
  mesh.position.set(x, y, z);
  mesh.rotation.z = rot;
  cluster.add(mesh);
}

function createPosterCluster() {
  // Original stacked covers — same pile as the locker collage, not the source albums.
  const cluster = new THREE.Group();
  cluster.name = 'poster-cluster';

  placeCover(cluster, coverMesh(0.22, 0.26, (ctx, w, h) => {
    ctx.fillStyle = '#f4efe4';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#6a8cff';
    ctx.fillRect(0, h * 0.42, w, h * 0.16);
    ctx.fillStyle = '#111';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('NO WAVE', 24, 48);
    ctx.fillStyle = '#e25a22';
    ctx.font = 'italic bold 78px Georgia, serif';
    ctx.fillText('STATIC', 28, h * 0.38);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 4;
    for (let i = 0; i < 4; i += 1) {
      ctx.strokeRect(40 + i * 70, h * 0.62, 36, 90);
      ctx.beginPath();
      ctx.arc(58 + i * 70, h * 0.66, 12, 0, Math.PI * 2);
      ctx.stroke();
    }
  }), -0.05, 0.06, 0, -0.1);

  placeCover(cluster, coverMesh(0.2, 0.11, (ctx, w, h) => {
    ctx.fillStyle = '#f6c512';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#e23b2f';
    ctx.beginPath();
    ctx.moveTo(w / 2, 8);
    for (let i = 0; i < 18; i += 1) {
      const a = -Math.PI / 2 + (i / 18) * Math.PI;
      const r = i % 2 ? w * 0.48 : w * 0.28;
      ctx.lineTo(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a) * r * 0.55);
    }
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#161616';
    ctx.font = 'bold 54px Impact, sans-serif';
    ctx.fillText('DORM', w / 2, h * 0.42);
    ctx.fillStyle = '#ffe566';
    ctx.strokeStyle = '#161616';
    ctx.lineWidth = 6;
    ctx.font = 'bold 64px Impact, sans-serif';
    ctx.strokeText('JAM!', w / 2, h * 0.82);
    ctx.fillText('JAM!', w / 2, h * 0.82);
  }), 0.02, 0.18, 0.012, 0.14);

  placeCover(cluster, coverMesh(0.1, 0.12, (ctx, w, h) => {
    ctx.fillStyle = '#1f4fa8';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f2d23a';
    ctx.fillRect(0, h * 0.55, w, h * 0.45);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('MIX', w / 2, h * 0.32);
    ctx.fillStyle = '#163a86';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('TAPE', w / 2, h * 0.78);
  }), 0.1, 0.12, 0.02, 0.08);

  placeCover(cluster, coverMesh(0.22, 0.16, (ctx, w, h) => {
    ctx.fillStyle = '#f7f4ee';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#7eb6e8';
    ctx.fillRect(0, h * 0.18, w, 18);
    ctx.fillRect(0, h * 0.72, w, 18);
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#c45a4a';
    ctx.fillText('A LOUD PEEK AT NEW NOISE', w / 2, 28);
    ctx.lineWidth = 8;
    ctx.font = 'bold 92px Impact, sans-serif';
    const word = 'LOUD';
    const colors = ['#3ecf4a', '#2f6fe0', '#f0c21a', '#e23b4a'];
    const start = w / 2 - 150;
    [...word].forEach((ch, i) => {
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 10;
      ctx.strokeText(ch, start + i * 100, h * 0.55);
      ctx.fillStyle = '#f7f4ee';
      ctx.fillText(ch, start + i * 100, h * 0.55);
    });
  }), 0.01, 0.02, 0.032, 0.02);

  placeCover(cluster, coverMesh(0.22, 0.2, (ctx, w, h) => {
    ctx.fillStyle = '#2a2e33';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f4f1ea';
    ctx.font = 'bold 92px Impact, sans-serif';
    ctx.fillText('NOISE!', 16, 100);
    ctx.font = 'bold 16px sans-serif';
    const lines = ['CAMP SET  ·  LIVE CUTS', 'HALL 2  /  LATE SHOW', 'OPENERS  ·  ENCORE'];
    lines.forEach((line, i) => ctx.fillText(line, 18, 140 + i * 28));
    ctx.fillStyle = '#e23b2f';
    ctx.fillRect(w * 0.62, h * 0.55, w * 0.3, h * 0.28);
  }), -0.05, -0.1, 0.044, -0.12);

  placeCover(cluster, coverMesh(0.16, 0.18, (ctx, w, h) => {
    ctx.fillStyle = '#111318';
    ctx.fillRect(0, 0, w, h);
    for (let y = 8; y < h; y += 10) {
      for (let x = 8; x < w; x += 10) {
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(x, y, 2, 2);
      }
    }
    ctx.fillStyle = '#f2f2f2';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('DEEP END', 16, 42);
    ['LANE A', 'LANE B', 'LANE C'].forEach((name, i) => {
      ctx.fillStyle = '#e23b2f';
      ctx.fillRect(18, 70 + i * 36, w - 36, 16);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(name, 28, 83 + i * 36);
    });
  }), 0.1, -0.06, 0.056, 0.08);

  return cluster;
}

function createMoodBoard() {
  const board = new THREE.Group();
  board.name = 'mood-board';
  const ink = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.7, metalness: 0 });
  const stringMat = new THREE.MeshStandardMaterial({ color: 0x7a45d6, roughness: 0.45, metalness: 0.05 });
  const tapeMat = new THREE.MeshStandardMaterial({ color: 0xc5c9a4, roughness: 0.85, metalness: 0 });
  const red = new THREE.MeshStandardMaterial({ color: 0xe23b3b, roughness: 0.6, metalness: 0 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.7, metalness: 0 });

  const scrapTex = (w, h, draw) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    draw(canvas.getContext('2d'), w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(w / 520, h / 520),
      new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.9, metalness: 0 })
    );
    return mesh;
  };

  const polaroid = (x, y, rot, caption, paint) => {
    const card = coverMesh(0.28, 0.34, (ctx, cw, ch) => {
      ctx.fillStyle = '#f7f4ee';
      ctx.fillRect(0, 0, cw, ch);
      ctx.save();
      ctx.beginPath();
      ctx.rect(cw * 0.08, ch * 0.06, cw * 0.84, ch * 0.68);
      ctx.clip();
      paint(ctx, cw, ch);
      ctx.restore();
      ctx.fillStyle = '#3a3a3a';
      ctx.textAlign = 'center';
      ctx.font = '28px Georgia, serif';
      ctx.fillText(caption, cw / 2, ch * 0.9);
    });
    card.position.set(x, y, 0.012);
    card.rotation.z = rot;
    board.add(card);
  };

  const link = (ax, ay, bx, by) => {
    const a = new THREE.Vector3(ax, ay, 0.03);
    const b = new THREE.Vector3(bx, by, 0.03);
    const dir = b.clone().sub(a);
    const mesh = cylinder(0.0032, 0.0032, dir.length(), stringMat, 5);
    mesh.position.copy(a).lerp(b, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    board.add(mesh);
  };

  const pin = (x, y) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), stringMat);
    mesh.position.set(x, y, 0.04);
    board.add(mesh);
  };

  polaroid(-0.16, 0.32, -0.04, 'May 12', (ctx, w, h) => {
    ctx.fillStyle = '#f3e2d4';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#c4372f';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.32, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7f1e6';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('HALL', w * 0.5, h * 0.48);
    ctx.fillText('PASS', w * 0.5, h * 0.58);
  });
  polaroid(0.2, 0.22, 0.05, 'May 13', (ctx, w, h) => {
    ctx.fillStyle = '#f0cfc4';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2c3a4a';
    ctx.fillRect(w * 0.34, h * 0.28, 36, 90);
    ctx.fillStyle = '#e07a5f';
    ctx.fillRect(w * 0.52, h * 0.34, 40, 78);
    ctx.fillStyle = '#6b2d3c';
    ctx.font = 'bold 48px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STAY PUT', w * 0.5, h * 0.22);
  });
  polaroid(-0.28, 0.0, -0.08, 'May 14', (ctx, w, h) => {
    ctx.fillStyle = '#8ec8ea';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f4e2b0';
    [[0.12, 0.7], [0.32, 0.55], [0.52, 0.75], [0.7, 0.5]].forEach(([x, ht]) => {
      ctx.fillRect(w * x, h * (1 - ht), w * 0.16, h * ht);
    });
    ctx.fillStyle = '#1d4e89';
    ctx.font = 'bold 64px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STOOP', w * 0.5, h * 0.28);
  });
  polaroid(-0.02, -0.18, 0.04, 'May 14', (ctx, w, h) => {
    ctx.fillStyle = '#f6f1e4';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#c8bfb0';
    ctx.lineWidth = 3;
    for (let i = 0; i < 5; i += 1) ctx.strokeRect(w * 0.12 + i * 70, h * 0.22, 18, 28);
    ctx.fillStyle = '#1f8a4c';
    ctx.font = 'bold 54px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('COUNT MAY', w * 0.5, h * 0.62);
  });
  polaroid(0.26, -0.32, 0.07, 'May 15', (ctx, w, h) => {
    ctx.fillStyle = '#1c3d32';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#f4efe6';
    ctx.font = 'bold 120px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('12', w * 0.5, h * 0.42);
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('HOME SET', w * 0.5, h * 0.62);
  });

  const pins = [[-0.04, 0.18], [0.08, 0.08], [-0.16, 0.12], [-0.02, -0.02], [0.14, -0.26], [0.02, -0.5]];
  [[0, 1], [0, 2], [2, 3], [3, 4], [3, 5], [4, 5]].forEach(([i, j]) => {
    link(pins[i][0], pins[i][1], pins[j][0], pins[j][1]);
  });
  pins.forEach(([x, y]) => pin(x, y));

  const squiggle = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.08, 0.52, 0.02),
        new THREE.Vector3(0.02, 0.58, 0.02),
        new THREE.Vector3(0.1, 0.5, 0.02),
        new THREE.Vector3(0.02, 0.46, 0.02)
      ]),
      10, 0.006, 5, false
    ),
    ink
  );
  board.add(squiggle);

  const tape = boxMesh(0.16, 0.07, 0.008, tapeMat);
  tape.position.set(0.4, 0.5, 0.02);
  tape.rotation.z = 0.55;
  board.add(tape);

  const heart = new THREE.Shape();
  heart.moveTo(0, 0.012);
  heart.bezierCurveTo(0, 0.04, 0.04, 0.04, 0.04, 0.012);
  heart.bezierCurveTo(0.04, -0.012, 0, -0.028, 0, -0.04);
  heart.bezierCurveTo(0, -0.028, -0.04, -0.012, -0.04, 0.012);
  heart.bezierCurveTo(-0.04, 0.04, 0, 0.04, 0, 0.012);
  [0.36, 0.42].forEach((x, i) => {
    const mesh = extrudeShape(heart, 0.006, ink, 0.001);
    mesh.position.set(x, 0.3 - i * 0.04, 0.02);
    mesh.scale.setScalar(0.7 + i * 0.25);
    board.add(mesh);
  });

  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), ink);
  ball.scale.set(1.35, 0.82, 0.25);
  ball.position.set(0.42, -0.05, 0.02);
  board.add(ball);
  const lace = boxMesh(0.006, 0.05, 0.006, white);
  lace.position.set(0.42, -0.05, 0.034);
  board.add(lace);

  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.008, 6, 10, Math.PI), red);
  hook.position.set(0.1, -0.4, 0.02);
  board.add(hook);
  const cane = cylinder(0.008, 0.008, 0.07, white, 6);
  cane.position.set(0.128, -0.45, 0.02);
  board.add(cane);

  const noteA = scrapTex(280, 140, (ctx) => {
    ctx.fillStyle = '#1c1c1c';
    ctx.font = 'italic 34px Georgia, serif';
    ctx.fillText('ring the bell,', 8, 48);
    ctx.fillText('not for class.', 8, 96);
  });
  noteA.scale.setScalar(0.72);
  noteA.position.set(-0.32, 0.34, 0.02);
  noteA.rotation.z = -0.08;
  board.add(noteA);

  const noteB = scrapTex(280, 140, (ctx) => {
    ctx.fillStyle = '#1c1c1c';
    ctx.font = 'italic 32px Georgia, serif';
    ctx.fillText('already feels', 8, 48);
    ctx.fillText('like friday', 8, 96);
  });
  noteB.scale.setScalar(0.72);
  noteB.position.set(-0.32, -0.22, 0.02);
  noteB.rotation.z = -0.12;
  board.add(noteB);

  const mark = scrapTex(360, 150, (ctx, w, h) => {
    ctx.fillStyle = '#1c1c1c';
    ctx.font = 'bold 64px Impact, sans-serif';
    ctx.fillText('CAMP', 8, 62);
    ctx.fillText('READS', 8, 124);
    ctx.font = '16px sans-serif';
    ctx.fillText('LOCKER STORIES', 8, h - 8);
  });
  mark.scale.setScalar(0.62);
  mark.position.set(-0.18, -0.52, 0.02);
  board.add(mark);

  return board;
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
    new THREE.TorusGeometry(0.11, 0.012, 8, 18, Math.PI),
    materials.hpShell
  );
  band.position.y = 0.02;
  hp.add(band);

  const cushion = new THREE.Mesh(
    new THREE.TorusGeometry(0.1, 0.014, 8, 18, Math.PI),
    materials.hpPad
  );
  cushion.position.y = 0.02;
  hp.add(cushion);

  [-1, 1].forEach((side) => {
    const cup = new THREE.Group();
    const shell = cylinder(0.048, 0.052, 0.04, materials.hpShell, 14);
    shell.rotation.x = Math.PI / 2;
    cup.add(shell);

    const face = new THREE.Mesh(new THREE.CircleGeometry(0.038, 14), materials.hpGrill);
    face.position.z = 0.022;
    cup.add(face);

    const pad = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.014, 8, 14), materials.hpPad);
    pad.position.z = 0.012;
    cup.add(pad);

    const yoke = cylinder(0.01, 0.01, 0.055, materials.hpShell, 8);
    yoke.position.set(0, 0.055, -0.006);
    cup.add(yoke);

    cup.position.set(side * 0.11, -0.055, 0.02);
    cup.rotation.y = side * 0.08;
    hp.add(cup);
  });

  const cable = cylinder(0.005, 0.005, 0.22, materials.hpCable, 6);
  cable.position.set(-0.08, -0.18, 0.02);
  cable.rotation.z = 0.12;
  hp.add(cable);

  return hp;
}

function varsityBadge(digit) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 256, 320);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.font = 'bold 250px Impact, "Arial Black", sans-serif';
  ctx.lineWidth = 28;
  ctx.strokeStyle = '#f4efe6';
  ctx.strokeText(String(digit), 128, 168);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#145208';
  ctx.strokeText(String(digit), 128, 168);
  ctx.fillStyle = '#3dbe12';
  ctx.fillText(String(digit), 128, 168);

  ctx.beginPath();
  ctx.arc(128, 176, 34, 0, Math.PI * 2);
  ctx.fillStyle = '#f3ecdf';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#c4b49a';
  ctx.stroke();
  ctx.fillStyle = '#3dbe12';
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const b = a + Math.PI / 5;
    ctx.lineTo(128 + Math.cos(a) * 16, 176 + Math.sin(a) * 16);
    ctx.lineTo(128 + Math.cos(b) * 7, 176 + Math.sin(b) * 7);
  }
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const face = new THREE.MeshStandardMaterial({
    map: tex,
    transparent: true,
    roughness: 0.82,
    metalness: 0
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.75), face);
  mesh.name = `locker-no-${digit}`;
  return mesh;
}

function createBackpack() {
  const pack = new THREE.Group();
  pack.name = 'backpack';
  const shell = new THREE.MeshStandardMaterial({ color: 0x5ec4f2, roughness: 0.62, metalness: 0.02 });
  const pocketMat = new THREE.MeshStandardMaterial({ color: 0x3eace6, roughness: 0.62, metalness: 0.02 });
  const ink = new THREE.MeshStandardMaterial({ color: 0x1c1e22, roughness: 0.72, metalness: 0.04 });
  const cavity = new THREE.MeshStandardMaterial({ color: 0x1a6aa3, roughness: 0.85, metalness: 0 });

  const body = roundedMesh(0.46, 0.52, 0.16, 0.07, shell, 3);
  body.position.y = 0.02;
  pack.add(body);
  const mouth = roundedMesh(0.32, 0.08, 0.1, 0.03, cavity, 2);
  mouth.position.set(0, 0.22, 0.02);
  pack.add(mouth);

  const pocket = roundedMesh(0.4, 0.22, 0.07, 0.04, pocketMat, 2);
  pocket.position.set(0, -0.1, 0.08);
  pack.add(pocket);
  const zip = boxMesh(0.34, 0.012, 0.014, ink);
  zip.position.set(0, 0.0, 0.12);
  zip.rotation.z = -0.18;
  pack.add(zip);
  const tag = boxMesh(0.1, 0.032, 0.008, ink);
  tag.position.set(0, -0.16, 0.125);
  pack.add(tag);
  const strap = boxMesh(0.04, 0.28, 0.016, ink);
  strap.position.set(0, -0.38, 0.02);
  pack.add(strap);

  const yellow = boxMesh(0.18, 0.16, 0.018, popMat(0xf2d35a));
  yellow.position.set(-0.02, 0.36, 0.02);
  yellow.rotation.z = 0.04;
  pack.add(yellow);
  const orange = boxMesh(0.16, 0.18, 0.018, popMat(0xf0783a));
  orange.position.set(0.1, 0.34, 0.045);
  orange.rotation.z = -0.28;
  pack.add(orange);
  const red = boxMesh(0.028, 0.16, 0.07, popMat(0xe23b3b));
  red.position.set(-0.14, 0.32, 0);
  red.rotation.z = 0.08;
  pack.add(red);

  const pen = cylinder(0.009, 0.009, 0.14, popMat(0x3dbe4a), 8);
  pen.rotation.z = 0.55;
  pen.position.set(-0.06, -0.02, 0.13);
  pack.add(pen);
  const calc = roundedMesh(0.09, 0.07, 0.016, 0.01, popMat(0xf7a8c4), 1);
  calc.position.set(0.06, -0.04, 0.13);
  pack.add(calc);
  return pack;
}

function createHangingCalendar() {
  const hang = new THREE.Group();
  hang.name = 'hanging-calendar';
  const w = 0.46;
  const h = 0.62;
  const tilt = -0.22;
  const chainMat = new THREE.MeshStandardMaterial({ color: 0xd5dbe2, roughness: 0.3, metalness: 0.65 });

  const board = new THREE.Group();
  board.rotation.z = tilt;
  hang.add(board);

  const page = coverMesh(w, h, (ctx, cw, ch) => {
    ctx.fillStyle = '#f7f4ee';
    ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = '#b7e3c8';
    ctx.fillRect(0, 0, cw, ch * 0.1);
    ctx.fillStyle = '#1c1c1c';
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText('CALENDAR', cw / 2, ch * 0.07);
    ctx.strokeStyle = '#f7f4ee';
    ctx.lineWidth = 3;
    for (let i = 0; i < 18; i += 1) {
      ctx.beginPath();
      ctx.arc(24 + i * 28, ch * 0.1, 12, 0, Math.PI);
      ctx.stroke();
    }
    ctx.fillStyle = '#1c1c1c';
    ctx.strokeStyle = '#1c1c1c';
    ctx.lineWidth = 3;
    ctx.strokeRect(36, ch * 0.16, 78, 78);
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText('6', 75, ch * 0.22);
    ctx.font = '16px sans-serif';
    ctx.fillText('JUN', 75, ch * 0.27);
    ctx.font = 'bold 220px Georgia, serif';
    ctx.fillText('28', cw / 2, ch * 0.62);
    ctx.font = '18px sans-serif';
    ctx.fillText('LOCKER  ·  HALL  ·  NOTE', cw / 2, ch * 0.9);
  });
  page.position.y = -h / 2;
  board.add(page);

  const hook = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), chainMat);
  hook.position.set(0, 0.08, 0.02);
  hang.add(hook);

  [-w / 2, w / 2].forEach((x) => {
    const end = new THREE.Vector3(x, 0, 0.02).applyAxisAngle(new THREE.Vector3(0, 0, 1), tilt);
    const start = new THREE.Vector3(0, 0.08, 0.02);
    const dir = end.clone().sub(start);
    const link = cylinder(0.004, 0.004, dir.length(), chainMat, 5);
    link.position.copy(start).lerp(end, 0.5);
    link.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    hang.add(link);
  });

  return hang;
}

function createIdBadge() {
  const badge = new THREE.Group();
  badge.name = 'id-badge';
  const metal = new THREE.MeshStandardMaterial({ color: 0xd7dee6, roughness: 0.28, metalness: 0.72 });
  const petal = popMat(0xf09ab8);
  const gold = popMat(0xe2b340);
  const hot = popMat(0xe23b78);
  const sky = popMat(0x3aa7d6);
  const plastic = new THREE.MeshStandardMaterial({
    color: 0xeee8dc,
    roughness: 0.34,
    metalness: 0.14,
  });

  const CARD_W = 0.7;
  const CARD_H = 0.46;
  const CARD_D = 0.1;
  const faceZ = CARD_D / 2;

  const body = roundedMesh(CARD_W, CARD_H, CARD_D, 0.03, plastic, 2);
  badge.add(body);

  const card = coverMesh(CARD_W - 0.018, CARD_H - 0.018, (ctx, w, h) => {
    ctx.fillStyle = '#f7f3ea';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1c1c1c';
    ctx.textAlign = 'left';
    ctx.font = 'bold 34px Georgia, serif';
    ctx.fillText('Studio Card', 28, 78);
    ctx.font = '16px sans-serif';
    ctx.fillText('THE HOLDER OF THIS CARD', 28, 108);
    ctx.font = '18px sans-serif';
    ['NAME:  WANG WENJI', 'BASED IN:  Campus', 'SPECIALTY:  Design'].forEach((line, i) => {
      ctx.fillText(line, 28, 168 + i * 36);
      ctx.beginPath();
      ctx.moveTo(120, 174 + i * 36);
      ctx.lineTo(250, 174 + i * 36);
      ctx.stroke();
    });
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('MOTTO:  MAKE THINGS', 28, h - 28);
    ctx.font = '14px sans-serif';
    ctx.fillText('ID NO. 004', 28, 48);
  });
  card.position.z = faceZ + 0.006;
  badge.add(card);

  const portrait = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.5),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      alphaTest: 0.12,
      roughness: 0.55,
      metalness: 0,
    }),
  );
  portrait.position.set(0.16, 0.01, faceZ + 0.014);
  badge.add(portrait);
  new THREE.TextureLoader().load('/assets/studio-portrait.png', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    portrait.material.map = tex;
    portrait.material.needsUpdate = true;
  });

  const ticket = coverMesh(0.42, 0.2, (ctx, w, h) => {
    ctx.fillStyle = '#f6d5e4';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1c1c1c';
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('(STUDIO, EST 2026)', w / 2, h * 0.42);
    ctx.font = '14px sans-serif';
    ctx.fillText('FORM, COLOR, MAKE', w / 2, h * 0.68);
  });
  ticket.position.set(-0.12, 0.3, faceZ + 0.01);
  ticket.rotation.z = 0.12;
  badge.add(ticket);

  const clip = boxMesh(0.09, 0.18, 0.03, metal);
  clip.position.set(0.04, 0.34, faceZ + 0.02);
  badge.add(clip);
  const jaw = boxMesh(0.1, 0.04, 0.04, metal);
  jaw.position.set(0.04, 0.42, faceZ + 0.02);
  badge.add(jaw);

  const bead = (letter, x, y) => {
    const disc = coverMesh(0.055, 0.055, (ctx, w, h) => {
      ctx.fillStyle = '#f4f1ea';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w * 0.46, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c1c1c';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(letter, w / 2, h / 2);
    });
    disc.position.set(x, y, faceZ + 0.016);
    badge.add(disc);
  };
  'FIVE'.split('').forEach((ch, i) => bead(ch, -0.28 + i * 0.09, 0.2));
  'YEARS'.split('').forEach((ch, i) => bead(ch, -0.08 + i * 0.09, -0.3));

  const bloom = new THREE.Group();
  for (let i = 0; i < 5; i += 1) {
    const part = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), petal);
    part.scale.set(1.3, 0.7, 0.35);
    const a = (i / 5) * Math.PI * 2;
    part.position.set(Math.cos(a) * 0.05, Math.sin(a) * 0.04, 0);
    bloom.add(part);
  }
  bloom.position.set(0.38, 0.24, faceZ + 0.02);
  badge.add(bloom);

  const star = (x, y) => {
    const mesh = boxMesh(0.045, 0.045, 0.01, gold);
    mesh.rotation.z = Math.PI / 4;
    mesh.position.set(x, y, faceZ + 0.02);
    badge.add(mesh);
  };
  star(0.34, 0.16);
  star(-0.22, -0.32);

  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), hot);
  heart.position.set(-0.4, 0.02, faceZ + 0.02);
  badge.add(heart);
  const wing = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 5), sky);
  wing.position.set(0.4, -0.16, faceZ + 0.02);
  badge.add(wing);
  return badge;
}

function dressDoor(door, index) {
  const badge = varsityBadge(index + 1);
  badge.position.set(DOOR_WIDTH / 2 - 0.24, DOOR_HEIGHT / 2 - 0.3, DOOR_THICK / 2 + 0.02);
  door.add(badge);

  if (index === 0) {
    const board = createMoodBoard();
    board.scale.setScalar(1.15);
    board.position.set(-0.02, -0.06, DOOR_THICK / 2 + 0.04);
    door.add(board);

    const hp = createHeadphones();
    // Inner face of door 1 — hidden until the door swings open.
    hp.position.set(0.04, -DOOR_HEIGHT * 0.06, -DOOR_THICK / 2 - 0.04);
    hp.rotation.set(0.04, Math.PI, 0.05);
    door.add(hp);
  }

  if (index === LOCKER_COUNT - 1) {
    const guitar = createWarlockGuitar();
    guitar.scale.setScalar(1.05);
    guitar.position.set(DOOR_WIDTH * 0.04, -DOOR_HEIGHT * 0.28, DOOR_THICK / 2 + 0.07);
    guitar.rotation.set(0, 0, 0);
    door.add(guitar);
  }

  if (index === 2) {
    const pack = createBackpack();
    pack.scale.setScalar(1.35);
    pack.position.set(0, -DOOR_HEIGHT * 0.28, DOOR_THICK / 2 + 0.12);
    door.add(pack);
  }

  if (index === 3) {
    const badge = createIdBadge();
    badge.userData.restScale = 1.2;
    badge.userData.closedScale = 0.58;
    badge.scale.setScalar(badge.userData.closedScale);
    badge.position.set(0, 0.35, -DOOR_THICK / 2 - 0.07);
    badge.rotation.y = Math.PI;
    door.add(badge);
    idBadge = badge;
  }

  if (index === 1) {
    const cup = createPenCup();
    cup.scale.setScalar(1.75);
    cup.position.set(0.04, DOOR_HEIGHT * 0.16, DOOR_THICK / 2 + 0.06);
    door.add(cup);

    const notes = createSketchNotebook();
    notes.position.set(0.12, -0.22, DOOR_THICK / 2 + 0.05);
    door.add(notes);
  }

  if (index === 4) {
    const posters = createPosterCluster();
    posters.scale.setScalar(1.85);
    posters.position.set(0.02, DOOR_HEIGHT * 0.2, DOOR_THICK / 2 + 0.04);
    door.add(posters);
  }

  if (index === 5) {
    const calendar = createHangingCalendar();
    calendar.scale.setScalar(1.6);
    calendar.position.set(0.08, 0.78, DOOR_THICK / 2 + 0.05);
    door.add(calendar);
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

const LOCKER_TINTS = [
  0xf0c85a,
  0xf7c6d6,
  0x8a6fe8,
  0x7ed6f8,
  0xb8f5c8,
  0x3ad64a,
  0xf27070,
  0xf6e85c
];

function createBinderStack() {
  const stack = new THREE.Group();
  stack.name = 'binder-stack';
  const blue = popMat(0x6a9fd4);
  const labelMat = popMat(0xe7eef6);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0xc5ced8, roughness: 0.35, metalness: 0.6 });
  [0, 0.09, 0.18].forEach((y, i) => {
    const binder = roundedMesh(0.46, 0.08, 0.3, 0.02, blue, 1);
    binder.position.set((i - 1) * 0.05, y, 0);
    binder.rotation.y = (i - 1) * 0.06;
    stack.add(binder);
    const label = boxMesh(0.14, 0.04, 0.008, labelMat);
    label.position.set(binder.position.x, y, 0.155);
    stack.add(label);
    [-0.07, 0.07].forEach((x) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.004, 6, 8), ringMat);
      ring.position.set(binder.position.x + x, y, 0.16);
      stack.add(ring);
    });
  });
  return stack;
}

function createOfficePile() {
  const pile = new THREE.Group();
  pile.name = 'office-pile';
  const black = popMat(0x1c1e22);
  const paper = popMat(0xe7e2d6);
  const mugMat = popMat(0xf4f1ea);
  const orange = popMat(0xe07a32);

  const caseBox = roundedMesh(0.44, 0.1, 0.3, 0.02, black, 2);
  caseBox.position.y = -0.12;
  pile.add(caseBox);
  const grip = boxMesh(0.12, 0.02, 0.02, popMat(0x9aa3ac));
  grip.position.set(0, -0.15, 0.16);
  pile.add(grip);

  for (let i = 0; i < 6; i += 1) {
    const sheet = boxMesh(0.4, 0.012, 0.28, i % 2 ? paper : popMat(0xf6f1e6));
    sheet.position.set((i - 2) * 0.012, 0.12 + i * 0.016, 0);
    sheet.rotation.z = (i - 3) * 0.025;
    pile.add(sheet);
  }

  const printer = createPrinter();
  printer.position.y = 0.2;
  pile.add(printer);

  const mug = cylinder(0.032, 0.03, 0.05, mugMat, 10);
  mug.position.set(-0.16, 0.36, 0.02);
  pile.add(mug);
  const mugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.004, 6, 8), mugMat);
  mugHandle.rotation.y = Math.PI / 2;
  mugHandle.position.set(-0.192, 0.36, 0.02);
  pile.add(mugHandle);

  const glasses = new THREE.Group();
  [-1, 1].forEach((side) => {
    const lens = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.003, 6, 8), orange);
    lens.position.x = side * 0.022;
    glasses.add(lens);
  });
  glasses.position.set(0.14, 0.38, 0.02);
  glasses.rotation.set(-0.7, 0.2, 0.4);
  pile.add(glasses);
  return pile;
}

function createPrinter() {
  const printer = new THREE.Group();
  printer.name = 'printer';
  const cream = new THREE.MeshStandardMaterial({ color: 0xe6d9c4, roughness: 0.52, metalness: 0.05 });
  const creamDark = new THREE.MeshStandardMaterial({ color: 0xd2c4ae, roughness: 0.58, metalness: 0.04 });
  const cavity = new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: 0.88, metalness: 0 });
  const lcd = new THREE.MeshStandardMaterial({
    color: 0x314034,
    roughness: 0.32,
    metalness: 0.08,
    emissive: new THREE.Color(0x1c2a18),
    emissiveIntensity: 0.25
  });

  const body = roundedMesh(0.42, 0.15, 0.28, 0.018, cream, 2);
  body.position.y = 0.09;
  printer.add(body);

  const lid = roundedMesh(0.4, 0.055, 0.26, 0.016, cream, 2);
  lid.position.y = 0.188;
  printer.add(lid);

  const inlet = boxMesh(0.22, 0.008, 0.12, creamDark);
  inlet.position.set(0, 0.214, -0.01);
  printer.add(inlet);

  const slot = boxMesh(0.22, 0.042, 0.05, cavity);
  slot.position.set(0, 0.1, 0.125);
  printer.add(slot);

  const outTray = roundedMesh(0.24, 0.012, 0.14, 0.008, creamDark, 1);
  outTray.position.set(0, 0.062, 0.2);
  printer.add(outTray);

  const drawer = roundedMesh(0.38, 0.042, 0.26, 0.012, cream, 1);
  drawer.position.set(0, 0.02, 0.008);
  printer.add(drawer);

  [-1, 1].forEach((side) => {
    for (let i = 0; i < 6; i += 1) {
      const vent = boxMesh(0.008, 0.016, 0.036, creamDark);
      vent.position.set(side * 0.208, 0.1, -0.04 + i * 0.02);
      printer.add(vent);
    }
  });

  const screen = boxMesh(0.07, 0.012, 0.004, lcd);
  screen.position.set(-0.05, 0.175, 0.13);
  printer.add(screen);
  for (let i = 0; i < 3; i += 1) {
    const btn = cylinder(0.006, 0.006, 0.006, creamDark, 8);
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0.03 + i * 0.018, 0.175, 0.132);
    printer.add(btn);
  }
  const knob = cylinder(0.01, 0.01, 0.008, creamDark, 10);
  knob.rotation.x = Math.PI / 2;
  knob.position.set(0.1, 0.175, 0.132);
  printer.add(knob);

  const page = coverMesh(0.16, 0.28, (ctx, w, h) => {
    ctx.fillStyle = '#f7f4ee';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2f4a32';
    ctx.textAlign = 'center';
    ctx.font = '300 48px "PingFang SC", sans-serif';
    ctx.fillText('校园', w / 2, h * 0.38);
    ctx.fillText('笔记', w / 2, h * 0.52);
  });
  page.rotation.x = -Math.PI / 2;
  page.position.set(0, 0.078, 0.26);
  printer.add(page);
  return printer;
}

function createRedFolder() {
  const folder = new THREE.Group();
  folder.name = 'red-folder';
  const red = new THREE.MeshPhysicalMaterial({
    color: 0x143a86,
    roughness: 0.12,
    metalness: 0.04,
    transmission: 0.55,
    thickness: 0.12,
    transparent: true,
    opacity: 0.78,
    side: THREE.DoubleSide
  });
  const metal = new THREE.MeshStandardMaterial({ color: 0xd7dee6, roughness: 0.22, metalness: 0.82 });

  const back = roundedMesh(0.5, 0.32, 0.012, 0.03, red, 1);
  back.rotation.x = -0.38;
  back.position.set(0, 0.1, -0.08);
  folder.add(back);
  const front = roundedMesh(0.5, 0.3, 0.012, 0.03, red, 1);
  front.rotation.x = 0.32;
  front.position.set(0, 0.08, 0.08);
  folder.add(front);
  const lip = boxMesh(0.52, 0.014, 0.014, metal);
  lip.position.set(0, 0.18, 0.18);
  lip.rotation.x = 0.32;
  folder.add(lip);

  const sheet = (w, h) => coverMesh(w, h, (ctx, cw, ch) => {
    ctx.fillStyle = '#f7f5f1';
    ctx.fillRect(0, 0, cw, ch);
    ctx.fillStyle = '#c8c4bc';
    for (let y = 28; y < ch - 16; y += 18) ctx.fillRect(24, y, cw - 48, 6);
  });

  [
    [0.22, 0.18, 0.34, 0.02, -0.35, 0.15, 0.2],
    [0.2, 0.16, 0.48, -0.04, 0.4, -0.2, -0.15],
    [0.24, 0.2, 0.62, 0.05, -0.15, 0.35, 0.4],
    [0.18, 0.14, 0.28, 0.06, 0.2, 0.1, -0.5]
  ].forEach(([w, h, y, x, rx, ry, rz]) => {
    const page = sheet(w, h);
    page.position.set(x, y, 0.02);
    page.rotation.set(rx, ry, rz);
    folder.add(page);
  });
  return folder;
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

  const cavityColor = new THREE.Color(LOCKER_TINTS[index]).multiplyScalar(0.55);
  const cavityMat = new THREE.MeshStandardMaterial({
    color: cavityColor,
    roughness: 0.86,
    metalness: 0.04
  });

  const back = boxMesh(LOCKER_WIDTH, bodyH, WALL, cavityMat);
  back.position.set(0, bodyY, -LOCKER_DEPTH / 2 + WALL / 2);
  locker.add(back);

  const cavityH = bodyH - WALL * 2;
  const cavityY = bodyY;
  [-1, 1].forEach((side) => {
    const wall = boxMesh(0.012, cavityH, innerD * 0.9, cavityMat);
    wall.position.set(side * (innerW / 2 - 0.008), cavityY, -0.02);
    locker.add(wall);
  });
  const floor = boxMesh(innerW * 0.96, 0.012, innerD * 0.9, cavityMat);
  floor.position.set(0, FOOT_H + WALL + 0.008, -0.02);
  locker.add(floor);
  const ceiling = boxMesh(innerW * 0.96, 0.012, innerD * 0.9, cavityMat);
  ceiling.position.set(0, FOOT_H + bodyH - WALL - 0.008, -0.02);
  locker.add(ceiling);

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

  addInteriorStructure(locker, bodyH, innerW, innerD, cavityMat);

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

  const doorBack = boxMesh(DOOR_WIDTH * 0.94, DOOR_HEIGHT * 0.94, 0.01, cavityMat);
  doorBack.position.z = -DOOR_THICK / 2 - 0.006;
  door.add(doorBack);

  addVents(door, DOOR_HEIGHT * 0.3);
  addVents(door, -DOOR_HEIGHT * 0.32);
  addHandle(door);
  addStickyNote(door, index);
  dressDoor(door, index);

  if (index === 3) {
    const pile = createOfficePile();
    pile.scale.setScalar(2.05);
    pile.position.set(0, 1.95, -0.1);
    locker.add(pile);

    const binders = createBinderStack();
    binders.scale.setScalar(1.9);
    binders.position.set(-0.02, 0.28, -0.14);
    locker.add(binders);

    const folder = createRedFolder();
    folder.scale.setScalar(1.45);
    folder.position.set(0.02, 0.88, -0.08);
    folder.rotation.set(0.1, -0.15, -0.08);
    locker.add(folder);
  }

  setShadows(locker);
  return { locker, doorPivot, door };
}

for (let index = 0; index < LOCKER_COUNT; index += 1) {
  const { locker, doorPivot, door } = createLocker(index);
  locker.position.x = lockerWorldX(index);
  lockerBank.add(locker);
  locker.userData.lockerIndex = index;
  doorPivots.push(doorPivot);
  doorAnims.push({ open: false, progress: 0 });
}

const shellMats = new Set([
  materials.body,
  materials.door,
  materials.frame,
  materials.recess,
  materials.handle
]);
const hoverColors = LOCKER_TINTS.map((hex) => new THREE.Color(hex));
lockerBank.children.forEach((locker) => {
  locker.traverse((node) => {
    if (!node.isMesh || !shellMats.has(node.material)) return;
    const mat = node.material.clone();
    node.material = mat;
    node.userData.baseColor = mat.color.clone();
  });
});

console.assert(
  doorPivots.length === LOCKER_COUNT && doorPivots.every((pivot) => pivot.rotation.y === 0),
  'Eight locker doors must exist and start closed.'
);

setShadows(lockerBank);

function addLockerFill(index, color, intensity, y, xOffset = 0) {
  const light = new THREE.PointLight(color, intensity, 3.4, 2);
  light.position.set(lockerWorldX(index) + xOffset, y, LOCKER_DEPTH / 2 + 1.0);
  scene.add(light);
}

addLockerFill(LOCKER_COUNT - 1, 0xb6ff6a, 5.5, 1.15, 0.2);
addLockerFill(2, 0x5ec4f2, 4.2, 0.95);
addLockerFill(0, 0xffe07a, 4.2, 1.15);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 16),
  new THREE.ShadowMaterial({ color: 0x3e4650, opacity: 0.42 })
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

function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

function setPointerFromEvent(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function doorIndexFromObject(object) {
  let node = object;
  while (node) {
    if (Number.isInteger(node.userData?.lockerIndex)) return node.userData.lockerIndex;
    node = node.parent;
  }
  return -1;
}

function toggleDoor(index) {
  const anim = doorAnims[index];
  if (!anim) return;
  anim.open = !anim.open;
}

const FAR_TARGET = new THREE.Vector3(0, LOCKER_CENTER_Y * 0.98, 0);
const NEAR_ZOOM = 2.15;
let focusedLocker = -1;
let zoomAnim = null;

function lockerWorldX(index) {
  return -TOTAL_WIDTH / 2 + LOCKER_WIDTH / 2 + index * (LOCKER_WIDTH + GAP);
}

function setFocusArrows() {
  const prev = document.getElementById('cam-prev');
  const next = document.getElementById('cam-next');
  const near = focusedLocker >= 0;
  prev.hidden = !near || focusedLocker === 0;
  next.hidden = !near || focusedLocker === LOCKER_COUNT - 1;
}

function moveFocus(index) {
  zoomAnim = {
    fromZoom: camera.zoom,
    toZoom: index < 0 ? 1 : NEAR_ZOOM,
    from: controls.target.clone(),
    to: index < 0 ? FAR_TARGET.clone() : new THREE.Vector3(lockerWorldX(index), FAR_TARGET.y, 0),
    t: 0
  };
  focusedLocker = index;
  setFocusArrows();
}

let hoveredLocker = -1;

function paintLocker(index, hover) {
  const locker = lockerBank.children[index];
  if (!locker) return;
  locker.traverse((node) => {
    if (!node.isMesh || !node.userData.baseColor) return;
    node.material.color.copy(hover ? hoverColors[index] : node.userData.baseColor);
  });
}

function hoverLockerAt(event) {
  setPointerFromEvent(event);
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(lockerBank.children, true);
  const index = hits.length > 0 ? doorIndexFromObject(hits[0].object) : -1;
  if (index === hoveredLocker) return;
  if (hoveredLocker >= 0) paintLocker(hoveredLocker, false);
  hoveredLocker = index;
  if (hoveredLocker >= 0) paintLocker(hoveredLocker, true);
  renderer.domElement.style.cursor = hoveredLocker >= 0 ? 'pointer' : '';
}

renderer.domElement.addEventListener('pointermove', hoverLockerAt);
renderer.domElement.addEventListener('pointerleave', () => {
  if (hoveredLocker >= 0) paintLocker(hoveredLocker, false);
  hoveredLocker = -1;
  renderer.domElement.style.cursor = '';
});

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
  const hits = raycaster.intersectObjects(lockerBank.children, true);
  if (hits.length === 0) {
    if (focusedLocker < 0) return;
    doorAnims[focusedLocker].open = false;
    moveFocus(-1);
    return;
  }
  const index = doorIndexFromObject(hits[0].object);
  if (index < 0) return;
  if (focusedLocker !== index) {
    if (focusedLocker >= 0) doorAnims[focusedLocker].open = false;
    moveFocus(index);
    doorAnims[index].open = true;
    return;
  }
  toggleDoor(index);
});

let worksProgress = 0;
let worksTarget = 0;
let switchingWorks = false;
const transitionAnchor = new THREE.Vector2();
const lockerRestPosition = lockerBank.position.clone();
const lockerRestScale = lockerBank.scale.clone();
let transitionDoorStart = 0;
let transitionControlEnabled = true;
const reducedTransitionMotion = matchMedia('(prefers-reduced-motion: reduce)');
const transitionGlow = new THREE.PointLight(0xffefd8, 0, 2.8, 2);
transitionGlow.position.set(lockerWorldX(3), 1.9, 0.35);
lockerBank.add(transitionGlow);

function switchWorks(target) {
  if (worksTarget === target && (switchingWorks || worksProgress === target)) return;
  if (!switchingWorks) {
    if (worksProgress === 0) {
      const point = lockerBank.localToWorld(new THREE.Vector3(lockerWorldX(3), 1.9, 0.4));
      point.project(camera);
      transitionAnchor.set(point.x, point.y);
      transitionDoorStart = doorAnims[3].progress;
    }
    transitionControlEnabled = controls.enabled;
    zoomAnim = null;
  }
  worksTarget = target;
  switchingWorks = true;
  controls.enabled = false;
  document.body.classList.add('is-lockers', 'is-switching');
  showWorks(scene.background);
  setWorksTransition(worksProgress, transitionAnchor);
  window.scrollTo(0, 0);
}

document.getElementById('nav-home').addEventListener('click', () => {
  worksTarget = worksProgress = 0;
  switchingWorks = false;
  document.body.classList.remove('is-switching');
  app.style.opacity = '';
  lockerBank.position.copy(lockerRestPosition);
  lockerBank.scale.copy(lockerRestScale);
  controls.enabled = transitionControlEnabled;
  doorAnims[3].open = false;
  transitionGlow.intensity = 0;
  hideWorks();
  if (focusedLocker >= 0) doorAnims[focusedLocker].open = false;
  moveFocus(-1);
  returnToIntro();
});

document.getElementById('nav-works').addEventListener('click', () => {
  switchWorks(1);
});

document.getElementById('nav-lockers').addEventListener('click', () => {
  if (worksProgress > 0 || switchingWorks) switchWorks(0);
  document.body.classList.add('is-lockers');
  window.scrollTo(0, 0);
});

document.getElementById('cam-prev').addEventListener('click', () => {
  if (focusedLocker > 0) moveFocus(focusedLocker - 1);
});
document.getElementById('cam-next').addEventListener('click', () => {
  if (focusedLocker < LOCKER_COUNT - 1) moveFocus(focusedLocker + 1);
});

function nearestLocker(x) {
  let best = 0;
  let bestDist = Infinity;
  for (let index = 0; index < LOCKER_COUNT; index += 1) {
    const dist = Math.abs(lockerWorldX(index) - x);
    if (dist < bestDist) {
      best = index;
      bestDist = dist;
    }
  }
  return best;
}

renderer.domElement.addEventListener('wheel', (event) => {
  if (focusedLocker < 0) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  zoomAnim = null;
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  const minX = lockerWorldX(0);
  const maxX = lockerWorldX(LOCKER_COUNT - 1);
  controls.target.x = THREE.MathUtils.clamp(controls.target.x + delta * 0.004, minX, maxX);
  focusedLocker = nearestLocker(controls.target.x);
  setFocusArrows();
}, { capture: true, passive: false });

function resizeScene() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
}

function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (switchingWorks) {
    worksProgress = reducedTransitionMotion.matches ? worksTarget : THREE.MathUtils.clamp(
      worksProgress + Math.sign(worksTarget - worksProgress) * dt / 1.2, 0, 1);
    const retreat = THREE.MathUtils.smoothstep(worksProgress, 0.25, 0.85);
    transitionGlow.intensity = 1.4 * THREE.MathUtils.smoothstep(worksProgress, 0, 0.2) * (1 - retreat);
    app.style.opacity = String(1 - retreat);
    lockerBank.position.copy(lockerRestPosition);
    lockerBank.position.z -= retreat * 1.4;
    lockerBank.scale.copy(lockerRestScale).multiplyScalar(1 - retreat * 0.08);
    setWorksTransition(worksProgress, transitionAnchor);
    doorAnims[3].progress = THREE.MathUtils.lerp(
      transitionDoorStart, 1,
      THREE.MathUtils.smoothstep(worksProgress, 0, 0.28));
    doorAnims[3].open = worksProgress > 0;
    if (worksProgress === worksTarget) {
      switchingWorks = false;
      document.body.classList.remove('is-switching');
      controls.enabled = transitionControlEnabled;
      if (worksTarget === 0) {
        hideWorks();
        app.style.opacity = '';
        doorAnims[3].open = false;
      }
    }
  }
  doorAnims.forEach((anim, index) => {
    const dir = anim.open ? 1 : -1;
    if (!(switchingWorks && index === 3)) anim.progress = THREE.MathUtils.clamp(
      anim.progress + (dir * dt) / DOOR_ANIM_DURATION,
      0,
      1
    );
    doorPivots[index].rotation.y = DOOR_OPEN_ANGLE * easeInOutCubic(anim.progress);
  });

  if (idBadge) {
    const door = doorAnims[3];
    const t = easeInOutCubic(door.progress);
    const from = idBadge.userData.closedScale;
    const to = idBadge.userData.restScale;
    idBadge.scale.setScalar(THREE.MathUtils.lerp(from, to, t));
  }

  if (zoomAnim) {
    zoomAnim.t = Math.min(1, zoomAnim.t + dt / 0.6);
    const eased = easeInOutCubic(zoomAnim.t);
    camera.zoom = THREE.MathUtils.lerp(zoomAnim.fromZoom, zoomAnim.toZoom, eased);
    controls.target.lerpVectors(zoomAnim.from, zoomAnim.to, eased);
    camera.updateProjectionMatrix();
    if (zoomAnim.t === 1) zoomAnim = null;
  }

  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', resizeScene);
resizeScene();
renderer.setAnimationLoop(animate);
startIntro();
