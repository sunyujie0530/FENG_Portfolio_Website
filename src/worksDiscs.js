import * as THREE from 'three';
import './worksDiscs.css';
import { createDiscGeometry } from './discGeometry.js';
import gsap from 'gsap';
import { CLAY_BACK, createWorkDetail } from './workDetail.js';
import { BCW_BACK, createBcwDetail } from './bcwDetail.js';
import { STRIDE_BACK, STRIDE_FRONT, createStrideDetail } from './strideDetail.js';
import { SLIME_BACK, createSlimeDetail } from './slimeDetail.js';
import { VELVET_BACK, createVelvetDetail } from './velvetDetail.js';
import { BARBARIAN_BACK, createBarbarianDetail } from './barbarianDetail.js';
import { createWrongPlaneDetail } from './wrongPlaneDetail.js';
import { BEAKER_FRONT, createBeakerDetail } from './beakerDetail.js';
import { PANTHEON_BACK, createPantheonDetail } from './pantheonDetail.js';
import { SHI_BACK, SHI_FRONT, createShiDaoDetail } from './shiDaoDetail.js';
import { detailPhases, pageProgress } from './workDetailMotion.js';

let renderer;
let camera;
let scene;
let discs = [];
let started = false;
let reveal = 1;
let detail = null;
let detailPanel;
let detailTween;
let restoreDetailFocus = () => {};

function resetDetail() {
  detailTween?.kill();
  detail = null;
  document.body.classList.remove('is-work-detail');
  if (detailPanel) {
    detailPanel.querySelector('video')?.pause();
    detailPanel.hidden = true;
    detailPanel.style.opacity = '0';
    detailPanel.style.pointerEvents = 'none';
    detailPanel.scrollTop = 0;
  }
}

function closeDetail() {
  if (!detail) return;
  detailPanel.style.pointerEvents = 'none';
  detailPanel.scrollTop = 0;
  detailPanel.querySelector('video')?.pause();
  detailTween?.kill();
  detailTween = gsap.to(detail, {
    progress: 0, duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1,
    ease: 'none', onComplete() { resetDetail(); restoreDetailFocus(); }
  });
}
const DIRECT_DETAIL = new Set([2, 7]);

function bindPageSnap(panel, index) {
  if (!DIRECT_DETAIL.has(index) || panel.dataset.pageSnap) return;
  panel.dataset.pageSnap = '1';
  let snapping = false;
  panel.addEventListener('wheel', (event) => {
    if (snapping) {
      event.preventDefault();
      return;
    }
    const height = panel.clientHeight;
    if (event.deltaY > 0 && panel.scrollTop < height * 0.12) {
      event.preventDefault();
      snapping = true;
      gsap.to(panel, {
        scrollTop: height,
        duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.16,
        ease: 'none',
        overwrite: true,
        onComplete() { snapping = false; },
      });
    }
  }, { passive: false });
}

const source = new THREE.Vector2(0, 0);
const smooth = (a, b, value) => THREE.MathUtils.smoothstep(value, a, b);
const textureLoader = new THREE.TextureLoader();

export function setWorksTransition(progress, anchor) {
  if (progress < 1 && detail) resetDetail();
  reveal = progress;
  if (anchor) source.copy(anchor);
}

const COUNT = 20;
const DISC_KIND = {
  0: 'game',
  1: 'game',
  2: 'model',
  3: 'game',
  4: 'scene',
  5: 'scene',
  6: 'video',
  7: 'game',
  8: 'game',
  18: 'scene',
  19: 'game',
};
const workKinds = new Set();
// Fixed reference framing; input moves the works, never the camera.
const CAMERA_POS = new THREE.Vector3(0, 0, 20);
const CAMERA_LOOK = new THREE.Vector3(0, 0, 0);

const COVER_ART = {
  0: '/assets/works/wrong-plane.png',
  1: '/assets/works/clay-doll.jpg',
  2: '/assets/works/barbarian.jpg',
  3: '/assets/works/bcw3.jpg',
  4: '/assets/works/pantheon.jpg',
  5: '/assets/works/fluff-flowers.jpg',
  6: STRIDE_FRONT,
  7: BEAKER_FRONT,
  8: SHI_FRONT,
  18: '/assets/works/coffee-desk.jpg',
  19: '/assets/works/time64.png',
};
const BACK_ART = { 1: CLAY_BACK, 2: BARBARIAN_BACK, 3: BCW_BACK, 4: PANTHEON_BACK, 5: VELVET_BACK, 6: STRIDE_BACK, 8: SHI_BACK, 19: SLIME_BACK };

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
  const discParts = {
    outerHub: hubGeometry(0.14, 0.245, 0.018),
    innerHub: hubGeometry(0.14, 0.213, 0.012),
    rim: new THREE.TorusGeometry(0.998, 0.006, 8, 128),
    glow: new THREE.TorusGeometry(1.012, 0.018, 10, 96),
    halo: new THREE.TorusGeometry(1.04, 0.04, 10, 96),
  };

  for (let i = 0; i < COUNT; i += 1) {
    const disc = createDisc(i, geometry, palettes[i % palettes.length], hubMaterial, darkHub, rimMaterial, discParts);
    scene.add(disc);
    discs.push(disc);
  }
  document.querySelector('.works-filters')?.addEventListener('change', (event) => {
    if (event.target.name !== 'workKind') return;
    workKinds.clear();
    document.querySelectorAll('.works-filters input:checked').forEach((input) => {
      workKinds.add(input.value);
    });
  });

  let angle = 0;
  let targetAngle = 0;
  let velocity = 0;
  let dragging = false;
  let lastX = 0;
  let downPoint = null;
  let moved = false;
  const pointer = new THREE.Vector2(4, 4);
  const raycaster = new THREE.Raycaster();
  const visibleDiscs = [];
  const collectVisibleDiscs = () => {
    visibleDiscs.length = 0;
    for (const disc of discs) if (disc.visible) visibleDiscs.push(disc);
    return visibleDiscs;
  };
  const detailFactories = {
    0: createWrongPlaneDetail,
    1: createWorkDetail,
    2: createBarbarianDetail,
    3: createBcwDetail,
    4: createPantheonDetail,
    5: createVelvetDetail,
    6: createStrideDetail,
    7: createBeakerDetail,
    8: createShiDaoDetail,
    19: createSlimeDetail,
  };
  const detailPanels = new Map();
  const getDetailPanel = (index) => {
    const factory = detailFactories[index];
    if (!factory) return null;
    if (!detailPanels.has(index)) {
      const panel = factory(closeDetail);
      panel.addEventListener('scroll', () => panel.updateLayout?.(), { passive: true });
      detailPanels.set(index, panel);
    }
    return detailPanels.get(index);
  };
  const openDetail = (disc) => {
    if (detail || reveal < 1) return;
    detailPanel = getDetailPanel(disc.userData.index);
    if (!detailPanel) return;
    dragging = false;
    velocity = 0;
    targetAngle = angle;
    detail = {
      disc, progress: 0,
      poses: discs.map((item) => ({ position: item.position.clone(), rotation: item.rotation.clone(), scale: item.scale.x, visible: item.visible }))
    };
    detailPanel.hidden = false;
    detailPanel.scrollTop = 0;
    bindPageSnap(detailPanel, disc.userData.index);
    document.body.classList.add('is-work-detail');
    detailPanel.updateLayout?.();
    detailTween = gsap.to(detail, {
      progress: 1, duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1.7,
      ease: 'none', onComplete() {
        detailPanel.style.pointerEvents = 'auto';
        detailPanel.querySelector('h1').focus({ preventScroll: true });
      }
    });
  };
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', '光盘作品：左右键选择，回车打开作品详情');
  restoreDetailFocus = () => canvas.focus({ preventScroll: true });
  canvas.addEventListener('keydown', (event) => {
    if (detail || reveal < 1) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      targetAngle += event.key === 'ArrowLeft' ? 1 / 3 : -1 / 3;
    }
    if (event.key === 'Enter') {
      const center = collectVisibleDiscs().reduce((best, disc) =>
        !best || Math.abs(disc.position.x) < Math.abs(best.position.x) ? disc : best, null);
      if (center) openDetail(center);
    }
  });
  addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && detail) closeDetail();
  });

  const onDown = (e) => {
    if (reveal < 1 || detail || (e.button !== undefined && e.button !== 0)) return;
    downPoint = { x: e.clientX, y: e.clientY };
    moved = false;
    dragging = true;
    velocity = 0;
    lastX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    hoverDirty = true;
    if (!dragging) return;
    if (Math.hypot(e.clientX - downPoint.x, e.clientY - downPoint.y) > 6) moved = true;
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    const step = dx * 0.0042;
    targetAngle += step;
    velocity = step;
  };
  const onUp = (e) => {
    const clicked = dragging && !moved && e.type !== 'pointercancel';
    dragging = false;
    if (!clicked || detail) return;
    const rect = canvas.getBoundingClientRect();
    pointer.set((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(collectVisibleDiscs(), true)[0];
    if (hit) openDetail(hit.object.parent);
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', () => {
    pointer.set(4, 4);
    hoverDirty = true;
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (reveal < 1 || detail) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    targetAngle += delta * 0.0016;
    velocity = 0;
  }, { passive: false });

  let hovered = null;
  let hoverDirty = true;
  const loop = () => {
    requestAnimationFrame(loop);
    if (!document.body.classList.contains('is-works')) return;
    if (!dragging && !detail) {
      targetAngle += velocity;
      velocity *= 0.94;
      if (Math.abs(velocity) < 0.00005) velocity = 0;
    }
    const moving = dragging || velocity !== 0 || Math.abs(targetAngle - angle) > 0.00005 || reveal < 1;
    angle += (targetAngle - angle) * 0.16;

    placeDiscs(angle, camera);
    const visible = collectVisibleDiscs();
    if (detail) {
      hovered = null;
      hoverDirty = true;
    } else if (hoverDirty || moving) {
      raycaster.setFromCamera(pointer, camera);
      hovered = raycaster.intersectObjects(visible, true)[0]?.object?.parent ?? null;
      hoverDirty = false;
    }
    const cursor = hovered ? 'pointer' : '';
    if (canvas.style.cursor !== cursor) canvas.style.cursor = cursor;
    discs.forEach((disc) => {
      const active = hovered === disc;
      disc.userData.hover += ((active ? 1 : 0) - disc.userData.hover) * 0.14;
      disc.position.z += disc.userData.hover * 0.04;
      const glow = disc.userData.glow;
      if (glow) glow.material.opacity = disc.userData.hover * 0.92;
      const halo = disc.userData.halo;
      if (halo) halo.material.opacity = disc.userData.hover * 0.38;
    });
    // Project the open locker into this fixed camera's coordinate system.
    const originX = source.x * camera.right;
    const originY = source.y * camera.top;
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
    if (detail) {
      const p = detail.progress;
      const { gather, flip, move, text } = detailPhases(p);
      const direct = DIRECT_DETAIL.has(detail.disc.userData.index);
      const scroll = direct
        ? pageProgress(detailPanel.scrollTop, innerHeight)
        : smooth(0, innerHeight, detailPanel.scrollTop);
      const mobile = innerWidth < 700;
      const heroRadius = mobile ? camera.top * 0.34 : camera.top * 0.96;
      const smallRadius = Math.min(camera.right * 0.1, camera.top * 0.15);
      discs.forEach((disc, index) => {
        const pose = detail.poses[index];
        if (disc !== detail.disc) {
          disc.visible = pose.visible && gather < 0.99;
          disc.position.set(
            THREE.MathUtils.lerp(pose.position.x, 0, gather),
            THREE.MathUtils.lerp(pose.position.y, 0, gather),
            THREE.MathUtils.lerp(pose.position.z, -0.3 - index * 0.02, gather),
          );
          disc.scale.setScalar(THREE.MathUtils.lerp(pose.scale, 1.3, gather));
          return;
        }
        disc.visible = true;
        const x = THREE.MathUtils.lerp(mobile ? 0 : camera.right * 0.76, camera.right * 0.81, scroll);
        const y = THREE.MathUtils.lerp(mobile ? camera.top * 0.45 : 0, camera.top - smallRadius * 1.5, scroll);
        if (direct) {
          disc.position.set(
            THREE.MathUtils.lerp(pose.position.x, x, move),
            THREE.MathUtils.lerp(pose.position.y, y, move),
            THREE.MathUtils.lerp(pose.position.z, 1, move),
          );
          disc.rotation.set(0, THREE.MathUtils.lerp(pose.rotation.y, Math.PI, flip), THREE.MathUtils.lerp(pose.rotation.z, 0, flip), 'ZYX');
          disc.scale.setScalar(THREE.MathUtils.lerp(pose.scale, THREE.MathUtils.lerp(heroRadius, smallRadius, scroll), move));
          return;
        }
        disc.position.set(
          THREE.MathUtils.lerp(pose.position.x, 0, gather),
          THREE.MathUtils.lerp(pose.position.y, 0, gather),
          THREE.MathUtils.lerp(pose.position.z, 1, gather),
        );
        disc.position.x = THREE.MathUtils.lerp(disc.position.x, x, move);
        disc.position.y = THREE.MathUtils.lerp(disc.position.y, y, move);
        disc.rotation.set(0, THREE.MathUtils.lerp(pose.rotation.y, Math.PI, flip), THREE.MathUtils.lerp(pose.rotation.z, 0, flip), 'ZYX');
        const centeredSize = THREE.MathUtils.lerp(pose.scale, Math.min(camera.top * 0.75, 2), gather);
        disc.scale.setScalar(THREE.MathUtils.lerp(centeredSize, THREE.MathUtils.lerp(heroRadius, smallRadius, scroll), move));
      });
      detailPanel.style.opacity = String(text);
    }
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
    placeDiscs(angle, camera);
    detailPanel?.updateLayout?.();
  };
  addEventListener('resize', resize);
  resize();
}

export function showWorks(background) {
  initWorks(background);
  const layer = document.querySelector('#works');
  if (layer) {
    layer.hidden = false;
    layer.setAttribute('aria-hidden', 'false');
  }
  document.body.classList.add('is-lockers', 'is-works');
  window.scrollTo(0, 0);
}

export function hideWorks() {
  resetDetail();
  const layer = document.querySelector('#works');
  if (layer) {
    layer.hidden = true;
    layer.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('is-works');
  reveal = 1;
}

const TRACK_STOPS = [
  [-5.40, -1.10, 1.18], [-2.95, -0.83, 1.48],
  [0.20, -0.05, 1.96], [4.30, 1.80, 2.40],
];

function matchingDiscs() {
  if (workKinds.size === 0) return discs;
  return discs.filter((disc) => workKinds.has(disc.userData.kind));
}

function placeDiscs(offset, view) {
  // Monotonic track avoids sin(a) == sin(PI-a), which stacked pairs of discs.
  // Reference centers (1100 × 600): (10,410), (255,383), (570,305), (980,120).
  const list = matchingDiscs();
  const span = Math.max(list.length, 1);
  const first = span > 6 ? -2 : Math.max(0, 2 - (span - 1) / 2);
  discs.forEach((disc) => { disc.visible = false; });
  list.forEach((disc, i) => {
    const slot = THREE.MathUtils.euclideanModulo(i + offset * 3 - first, span) + first;
    if (slot <= -2 || slot >= 6) return;
    const segment = Math.max(0, Math.min(2, Math.floor(slot)));
    const t = slot - segment;
    const current = TRACK_STOPS[segment];
    const next = TRACK_STOPS[segment + 1];
    const x = THREE.MathUtils.lerp(current[0], next[0], t);
    const y = THREE.MathUtils.lerp(current[1], next[1], t);
    const radius = THREE.MathUtils.lerp(current[2], next[2], t);
    const size = Math.max(0.6, radius);
    disc.position.set(x, y, slot * 0.06);
    disc.scale.setScalar(size);
    // Tilt around the disc's local vertical axis, then roll the ellipse in screen space.
    disc.rotation.set(0, 0.52, -0.42, 'ZYX');
    const pad = size * 1.15;
    disc.visible = !view || (x + pad > view.left && x - pad < view.right);
  });
}

function createDisc(index, geometry, palette, hubMaterial, darkHub, rimMaterial, discParts) {
  const group = new THREE.Group();
  const face = new THREE.MeshPhysicalMaterial({
    map: COVER_ART[index] ? coverTexture(COVER_ART[index]) : faceTexture(palette, 0.17 + index * 0.11),
    roughness: COVER_ART[index] ? 0.42 : 0.27,
    metalness: 0.03,
    clearcoat: 0.58,
    clearcoatRoughness: 0.2,
  });
  let discGeometry = geometry;
  const materials = [face, rimMaterial];
  if (BACK_ART[index]) {
    discGeometry = geometry.clone();
    const backGroup = discGeometry.groups[1];
    backGroup.materialIndex = 2;
    const uv = discGeometry.attributes.uv;
    const vertices = new Set(Array.from(discGeometry.index.array.slice(backGroup.start, backGroup.start + backGroup.count)));
    vertices.forEach((vertex) => uv.setX(vertex, 1 - uv.getX(vertex)));
    const back = face.clone();
    back.map = coverTexture(BACK_ART[index]);
    materials.push(back);
  }
  const body = new THREE.Mesh(discGeometry, materials);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);
  const outerHub = new THREE.Mesh(discParts.outerHub, darkHub);
  outerHub.position.z = 0.014;
  outerHub.castShadow = true;
  group.add(outerHub);
  const innerHub = new THREE.Mesh(discParts.innerHub, hubMaterial);
  innerHub.position.z = 0.031;
  innerHub.castShadow = true;
  group.add(innerHub);
  const rim = new THREE.Mesh(discParts.rim, hubMaterial);
  rim.position.z = 0.01;
  group.add(rim);
  for (const front of [outerHub, innerHub, rim]) {
    const back = front.clone();
    back.rotation.y = Math.PI;
    back.position.z = -front.position.z;
    group.add(back);
  }
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x3dff6a,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Mesh(discParts.glow, glowMat);
  glow.position.z = 0.014;
  glow.renderOrder = 2;
  group.add(glow);
  const halo = new THREE.Mesh(discParts.halo, glowMat.clone());
  halo.position.z = 0.01;
  halo.renderOrder = 1;
  group.add(halo);
  group.userData.index = index;
  group.userData.kind = DISC_KIND[index];
  group.userData.hover = 0;
  group.userData.glow = glow;
  group.userData.halo = halo;
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
  textureLoader.load(url, (source) => {
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
