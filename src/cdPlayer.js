import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// Reference-inspired proportions in pile-local units; +Z is the front.
export const CD_PLAYER = Object.freeze({ width: 0.44, height: 0.55, depth: 0.12, ejectY: 0.075, ejectZ: 0.045 });

export function canvasMap(paint, color = true) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  paint(canvas.getContext('2d'), 1024);
  const map = new THREE.CanvasTexture(canvas);
  if (color) map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

let finishes;
function materials() {
  if (finishes) return finishes;
  const grain = canvasMap((ctx, s) => {
    ctx.fillStyle = '#995923'; ctx.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += 3) {
      ctx.strokeStyle = `rgba(${x % 2 ? '240,176,93' : '65,29,13'},${0.08 + (Math.sin(x * 2.3) + 1) * 0.05})`;
      ctx.beginPath(); ctx.moveTo(x, 0);
      for (let y = 0; y <= s; y += 16) ctx.lineTo(x + 3 * Math.sin(y * 0.007 + x * 0.02), y);
      ctx.stroke();
    }
  });
  const brushed = canvasMap((ctx, s) => {
    ctx.fillStyle = '#999999'; ctx.fillRect(0, 0, s, s);
    for (let y = 0; y < s; y += 2) {
      const gray = 110 + Math.round(22 * Math.sin(y * 14.13));
      ctx.fillStyle = `rgb(${gray},${gray},${gray})`; ctx.fillRect(0, y, s, 1);
    }
  }, false);
  finishes = {
    silver: new THREE.MeshStandardMaterial({ color: 0xc5c3c3, metalness: 0.78, roughness: 0.29, bumpMap: brushed, bumpScale: 0.00018 }),
    wood: new THREE.MeshPhysicalMaterial({ map: grain, roughness: 0.43, clearcoat: 0.25, clearcoatRoughness: 0.35 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x29282c, metalness: 0.2, roughness: 0.48 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x183a9c, metalness: 0.55, roughness: 0.25 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xefedf1, transparent: true, opacity: 0.09, roughness: 0.11, metalness: 0.03, depthWrite: false, side: THREE.DoubleSide }),
    led: new THREE.MeshStandardMaterial({ color: 0xe5b777, emissive: 0xc78d39, emissiveIntensity: 0.3, roughness: 0.35 }),
  };
  return finishes;
}

export function createCdPlayer({ number = '01', accent = '#754158', title = 'FENG ARCHIVE' } = {}) {
  const root = new THREE.Group();
  root.name = `cd-player-${number}`;
  root.userData.isCdPlayer = true;
  const mat = materials();
  const nodes = {};
  const add = (parent, name, geometry, material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name; mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh); nodes[name] = mesh;
    return mesh;
  };
  const box = (parent, name, w, h, d, material, x, y, z, radius = 0.003) =>
    add(parent, name, new RoundedBoxGeometry(w, h, d, 2, Math.min(radius, w / 2, h / 2, d / 2)), material, x, y, z);
  const circle = (parent, name, r, depth, material, x, y, z) => {
    const mesh = add(parent, name, new THREE.CylinderGeometry(r, r, depth, 48), material, x, y, z);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  };
  box(root, 'chassis', 0.41, 0.55, 0.105, mat.silver, 0, 0, 0, 0.009);
  [-1, 1].forEach(side => {
    box(root, `wood-side-${side}`, 0.025, 0.55, 0.12, mat.wood, side * 0.207, 0, 0, 0.006);
    box(root, `side-trim-${side}`, 0.006, 0.548, 0.012, mat.silver, side * 0.191, 0, 0.064);
  });
  box(root, 'chamber-back', 0.374, 0.398, 0.008, mat.dark, 0, 0.063, 0.055);
  const carrier = new THREE.Group();
  carrier.name = 'disc-carrier'; carrier.position.set(0, 0.063, 0.062); root.add(carrier);
  box(carrier, 'carrier-edge-top', 0.367, 0.008, 0.01, mat.silver, 0, 0.188, 0.001);
  [-1, 1].forEach(side => box(carrier, `carrier-guide-${side}`, 0.008, 0.38, 0.014, mat.silver, side * 0.179, 0, 0));
  const label = canvasMap((ctx, s) => {
    const gradient = ctx.createLinearGradient(0, 0, s, s);
    gradient.addColorStop(0, '#efede9'); gradient.addColorStop(0.35, '#b6b4bc');
    gradient.addColorStop(0.6, '#eeece9'); gradient.addColorStop(1, '#a09ca6');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = accent; ctx.fillRect(0, s * 0.19, s, s * 0.23);
    ctx.fillStyle = '#f8f5e9'; ctx.font = '600 72px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('FENG / RECORDS', s / 2, s * 0.32);
    ctx.fillStyle = '#39363b'; ctx.font = '500 38px sans-serif';
    ctx.fillText(title, s / 2, s * 0.76); ctx.fillText(`VOL. ${number}  ·  CD-R / 700 MB`, s / 2, s * 0.82);
  });
  const discMat = new THREE.MeshStandardMaterial({ map: label, metalness: 0.52, roughness: 0.24, side: THREE.DoubleSide });
  add(carrier, 'disc', new THREE.RingGeometry(0.02, 0.174, 80), discMat, 0, 0, 0.008);
  for (let i = 0; i < 6; i++) {
    const rimMat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(i / 6, 0.25, 0.68), metalness: 0.8, roughness: 0.15, side: THREE.DoubleSide });
    add(carrier, `disc-rainbow-${i}`, new THREE.RingGeometry(0.171, 0.1745, 16, 1, i * Math.PI / 3, Math.PI / 3), rimMat, 0, 0, 0.009);
  }
  circle(carrier, 'hub', 0.046, 0.012, mat.silver, 0, 0, 0.015);
  circle(carrier, 'hub-center', 0.014, 0.014, mat.dark, 0, 0, 0.022);
  circle(carrier, 'hub-cap', 0.0105, 0.015, mat.silver, 0, 0, 0.026);
  box(carrier, 'lower-disc-support', 0.1, 0.013, 0.019, mat.silver, 0, -0.176, 0.012);
  const lid = new THREE.Group(); lid.name = 'glass-cover'; lid.position.set(0, -0.136, 0.09); root.add(lid);
  const pane = box(lid, 'clear-pane', 0.378, 0.40, 0.005, mat.glass, 0, 0.20, 0);
  pane.castShadow = false;
  pane.userData.noShadow = true;
  [-1, 1].forEach(side => box(lid, `cover-rim-${side}`, 0.004, 0.401, 0.007, mat.silver, side * 0.189, 0.20, 0));
  [0, 0.40].forEach((y, i) => box(lid, `cover-horizontal-${i}`, 0.382, 0.004, 0.008, mat.silver, 0, y, 0));
  box(root, 'control-panel', 0.383, 0.128, 0.018, mat.silver, 0, -0.207, 0.057);
  box(root, 'display', 0.326, 0.031, 0.008, mat.dark, 0, -0.15, 0.068);
  const textMap = canvasMap((ctx, s) => {
    ctx.fillStyle = '#29252b'; ctx.fillRect(0, 0, s, s);
    ctx.fillStyle = '#e7d1a8'; ctx.font = '120px monospace'; ctx.textAlign = 'center';
    ctx.fillText(`${number}    02:23`, s / 2, s / 2 + 40);
  });
  const readout = new THREE.MeshBasicMaterial({ map: textMap });
  add(root, 'display-digits', new THREE.PlaneGeometry(0.286, 0.025), readout, 0, -0.15, 0.0725);
  const buttonGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.009, 20);
  const buttons = new THREE.InstancedMesh(buttonGeo, mat.silver, 6);
  buttons.name = 'button-row';
  const rings = new THREE.InstancedMesh(new THREE.TorusGeometry(0.014, 0.0021, 6, 24), mat.blue, 6);
  rings.name = 'blue-rings';
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 6; i++) {
    dummy.position.set(-0.145 + i * 0.058, -0.235, 0.071);
    dummy.rotation.set(Math.PI / 2, 0, 0); dummy.updateMatrix(); buttons.setMatrixAt(i, dummy.matrix);
    dummy.position.z = 0.077; dummy.rotation.set(0, 0, 0); dummy.updateMatrix(); rings.setMatrixAt(i, dummy.matrix);
  }
  root.add(buttons, rings); nodes['button-row'] = buttons; nodes['blue-rings'] = rings;
  circle(root, 'power-ring', 0.018, 0.005, mat.blue, -0.15, -0.191, 0.071);
  circle(root, 'power-button', 0.013, 0.01, mat.silver, -0.15, -0.191, 0.077);
  circle(root, 'status-led', 0.003, 0.005, mat.led, 0.15, -0.19, 0.072);
  const branding = canvasMap((ctx, s) => {
    ctx.fillStyle = '#303936'; ctx.textAlign = 'center'; ctx.font = '600 130px serif';
    ctx.fillText('FENG', s / 2, s / 2); ctx.font = '44px sans-serif'; ctx.fillText('VERTICAL DISC ARCHIVE', s / 2, s * 0.7);
  });
  const brand = add(root, 'branding', new THREE.PlaneGeometry(0.12, 0.038), new THREE.MeshStandardMaterial({ map: branding, transparent: true, roughness: 0.5 }), 0, -0.192, 0.068);
  brand.castShadow = false;
  brand.userData.noShadow = true;
  const socket = new THREE.Object3D(); socket.name = 'disc-load-socket'; socket.position.copy(carrier.position); root.add(socket);
  root.userData.sculptRuntime = { nodes, destructionGroups: ['chassis','disc-carrier','glass-cover'], collider: { type:'box', size:[0.44,0.55,0.12] } };
  root.userData.carrier = carrier; root.userData.lid = lid; root.userData.hover = 0;
  return root;
}

export function updateCdPlayer(root, hovered, dt, reducedMotion = false) {
  const previous = root.userData.hover;
  const target = hovered ? 1 : 0;
  let next = reducedMotion ? target : previous + (target - previous) * (1 - Math.exp(-10 * dt));
  if (Math.abs(target - next) < 0.001) next = target;
  root.userData.hover = next;
  root.userData.carrier.position.y = 0.063 + CD_PLAYER.ejectY * next;
  root.userData.carrier.position.z = 0.062 + CD_PLAYER.ejectZ * next;
  root.userData.lid.rotation.x = -0.22 * next;
  return next !== previous;
}
