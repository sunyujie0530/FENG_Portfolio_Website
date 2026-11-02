import assert from 'node:assert/strict';
import { landingFrame, showWorksEntry, cdOrbitPosition, cdIntroMarkup, CD_ORBIT_DIAMETER, CD_ORBIT_PERSPECTIVE, CD_ORBIT_ELEVATION, CD_ORBIT_VERTICAL_SCALE } from '../src/studentLanding.js';

const start = landingFrame(1280, 720, 0);
const halfway = landingFrame(1280, 720, 360);
const end = landingFrame(1280, 720, 720);
assert.equal(start.progress, 0);
assert.equal(end.progress, 1);
assert.ok(start.fontSize > halfway.fontSize && halfway.fontSize > end.fontSize);
assert.ok(start.cabinetY > halfway.cabinetY && halfway.cabinetY > end.cabinetY);
assert.equal(landingFrame(1280, 720, -100).progress, 0);
assert.equal(landingFrame(1280, 720, 2000).progress, 1);
assert.ok(landingFrame(390, 844, 0).compact);
assert.ok(Number.isFinite(landingFrame(390, 0, 0).fontSize));
assert.equal(showWorksEntry(false, 1), false);
assert.equal(showWorksEntry(true, 0), false);
assert.equal(showWorksEntry(true, .5), false);
assert.equal(showWorksEntry(true, 1), true);
const top = cdOrbitPosition(0, 10);
assert.ok(top.x < 0 && top.z < 0);
const positions = Array.from({ length:10 }, (_, i) => cdOrbitPosition(i, 10));
assert.equal(new Set(positions.map(p => `${p.x},${p.z}`)).size, 10);
assert.ok(positions.every(p => Math.abs(Math.hypot(p.x, p.z) - .47) < 1e-12));
const markup = cdIntroMarkup([{id:'clay-doll', title:'泥人张', cover:'/assets/works/clay-doll.jpg'}]);
assert.ok(markup.includes('src="/assets/works/clay-doll.jpg"'));
assert.ok(markup.includes('href="/works/clay-doll"'));
assert.ok(markup.includes('一张 CD，一个作品'));
// Check the projected circular outlines, not just the 3D centre distances.
const radians = degrees => degrees * Math.PI / 180;
function outline(p) {
  const yaw = radians(p.yaw), lean = radians(p.lean), elevation = radians(CD_ORBIT_ELEVATION);
  return Array.from({ length:24 }, (_, index) => {
    const a = index * Math.PI / 12;
    const x = Math.cos(a) * CD_ORBIT_DIAMETER / 2;
    const y = Math.sin(a) * CD_ORBIT_DIAMETER / 2;
    const leanedY = y * Math.cos(lean), leanedZ = y * Math.sin(lean);
    const worldX = p.x + x * Math.cos(yaw) + leanedZ * Math.sin(yaw);
    const worldZ = p.z - x * Math.sin(yaw) + leanedZ * Math.cos(yaw);
    const viewY = leanedY * Math.cos(elevation) + worldZ * Math.sin(elevation);
    const viewZ = -leanedY * Math.sin(elevation) + worldZ * Math.cos(elevation);
    const perspective = CD_ORBIT_PERSPECTIVE / (CD_ORBIT_PERSPECTIVE - viewZ);
    return [worldX * perspective, viewY * perspective * CD_ORBIT_VERTICAL_SCALE];
  });
}
function gap(a, b) {
  let largestGap = -Infinity;
  for (const polygon of [a, b]) {
    polygon.forEach((point, index) => {
      const next = polygon[(index + 1) % polygon.length];
      const length = Math.hypot(next[0] - point[0], next[1] - point[1]);
      const nx = -(next[1] - point[1]) / length, ny = (next[0] - point[0]) / length;
      const pa = a.map(p => p[0] * nx + p[1] * ny), pb = b.map(p => p[0] * nx + p[1] * ny);
      largestGap = Math.max(largestGap, Math.min(...pb) - Math.max(...pa), Math.min(...pa) - Math.max(...pb));
    });
  }
  return largestGap;
}
let minimumGap = Infinity;
for (let step = 0; step < 120; step++) {
  const outlines = Array.from({ length:12 }, (_, index) => outline(cdOrbitPosition(index, 12, step * Math.PI / 60)));
  outlines.forEach((a, index) => outlines.slice(index + 1).forEach(b => { minimumGap = Math.min(minimumGap, gap(a, b)); }));
}
// Keep a narrow positive gap for the denser layout throughout the full rotation.
assert.ok(minimumGap >= .002, `CD overlap or insufficient gap during rotation: ${minimumGap}`);
console.log(`CD ring: 120 rotation frames / all disc pairs checked; minimum projected gap ${minimumGap.toFixed(4)}.`);
console.log('Student landing: scroll endpoints, continuous scale, cabinet motion and mobile layout passed.');
