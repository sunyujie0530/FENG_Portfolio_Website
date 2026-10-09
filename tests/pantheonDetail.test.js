import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { createPantheonDetail } from '../src/pantheonDetail.js';

const panel = { setAttribute() {}, querySelector() { return { addEventListener() {} }; } };
globalThis.document = { createElement: () => panel, querySelector: () => ({ append() {} }) };
createPantheonDetail(() => {});
assert.equal((panel.innerHTML.match(/SUN YUJIE/g) || []).length, 1);
assert.ok(panel.innerHTML.includes('孙玉洁《万神殿》'));
assert.ok(panel.innerHTML.includes('选择以“重建”为叙事起点'));
assert.equal((panel.innerHTML.match(/<img /g) || []).length, 3);
assert.ok(!panel.innerHTML.includes('<video'));
for (const file of ['back.jpg', 'scene-1.jpg', 'scene-2.jpg', 'scene-3.jpg']) {
  assert.ok(statSync(new URL(`../public/assets/works/pantheon/${file}`, import.meta.url)).size > 1000);
}
const discs = readFileSync(new URL('../src/worksDiscs.js', import.meta.url), 'utf8');
assert.ok(discs.includes('createPantheonDetail'));
assert.ok(discs.includes('4: PANTHEON_BACK'));
console.log('Pantheon: author/copy, back art, gallery and disc wiring passed.');
