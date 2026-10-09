import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { createShiDaoDetail } from '../src/shiDaoDetail.js';

const panel = { setAttribute() {}, querySelector() { return { addEventListener() {} }; } };
globalThis.document = { createElement: () => panel, querySelector: () => ({ append() {} }) };
createShiDaoDetail(() => {});
assert.ok(panel.innerHTML.includes('SHI DAO LIN TOU'));
assert.ok(panel.innerHTML.includes('《屎到临头》'));
assert.ok(panel.innerHTML.includes('2V3非对称欢乐对抗游戏'));
assert.equal((panel.innerHTML.match(/<img /g) || []).length, 3);
assert.ok(panel.innerHTML.includes('<video controls'));
for (const file of ['front.jpg', 'back.jpg', 'scene-2.jpg', 'scene-3.jpg', 'demo.mp4']) {
  assert.ok(statSync(new URL(`../public/assets/works/shi-dao/${file}`, import.meta.url)).size > 1000);
}
const discs = readFileSync(new URL('../src/worksDiscs.js', import.meta.url), 'utf8');
assert.ok(discs.includes('createShiDaoDetail'));
assert.ok(discs.includes('8: SHI_BACK') || discs.includes('8: SHI_FRONT'));
console.log('ShiDao: title/copy, back art, gallery and disc wiring passed.');
