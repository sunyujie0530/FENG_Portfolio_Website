import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/worksDiscs.js', import.meta.url), 'utf8');
const browse = readFileSync(new URL('../src/browse.js', import.meta.url), 'utf8');
assert.ok(browse.includes("showWorkDisc(work.id === 'slime-runner' ? 19 : WORKS.indexOf(work), () => move(back), backLabel, work.authors.map(index => STUDENTS[index]))"));
assert.ok(browse.includes("root.hidden = mode !== 'content' || Boolean(work)"));
const button = { textContent: '' };
const authorHeading = { textContent: '陈嘉伟 2025级硕士' };
let opened, returned = 0, reset = 0;
const context = vm.createContext({
  discs: [0, 1, 2, 19].map(index => ({ userData: { index } })),
  resetDetail() { reset++; }, workKinds: new Set(['video']),
  angle: 0, targetAngle: 0, camera: {}, placeDiscs() {},
  openDetail(disc) { opened = disc.userData.index; },
  detailPanel: { querySelector: () => button, querySelectorAll: () => [authorHeading] }, detailRouteBack: null,
});
vm.runInContext(source.match(/  openRoutedDetail = \(index, onBack, backLabel, authors = \[\]\) => \{[\s\S]*?\n  \};/)[0], context);
for (const index of [0, 1, 2, 19]) {
  context.openRoutedDetail(index, () => returned++, '全部作品', [{ name: '陈嘉伟', grade: '2024级' }]);
  assert.equal(opened, index);
  assert.equal(context.workKinds.size, 0);
  assert.equal(button.textContent, '← 返回全部作品');
  assert.equal(authorHeading.textContent, '陈嘉伟 2024级硕士');
}
context.detailRouteBack();
assert.equal(returned, 1);
assert.equal(reset, 4);

// Routed close must navigate once; ordinary legacy close must still restore focus.
let focus = 0;
const closeContext = vm.createContext({
  detail: {}, detailPanel: { style: {}, scrollTop: 720, querySelector: () => null },
  detailTween: null, detailRouteBack: () => returned++,
  matchMedia: () => ({ matches: true }),
  gsap: { to(_, options) { options.onComplete(); } },
  resetDetail() { closeContext.detailRouteBack = null; },
  restoreDetailFocus() { focus++; },
});
vm.runInContext(source.slice(source.indexOf('function closeDetail()'), source.indexOf('const DIRECT_DETAIL')), closeContext);
closeContext.closeDetail();
assert.equal(returned, 2);
assert.equal(focus, 0);
closeContext.closeDetail();
assert.equal(focus, 1);
console.log('Routed work discs: cover indices, filter isolation and return callbacks passed.');
