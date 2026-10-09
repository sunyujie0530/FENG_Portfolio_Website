import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { createStrideDetail } from '../src/strideDetail.js';

const panel = { setAttribute() {}, querySelector() { return { addEventListener() {} }; } };
globalThis.document = { createElement: () => panel, querySelector: () => ({ append() {} }) };
createStrideDetail(() => {});
assert.equal((panel.innerHTML.match(/LI RUOHAN/g) || []).length, 1);
assert.equal((panel.innerHTML.match(/李若晗 2025级硕士/g) || []).length, 1);
assert.ok(panel.innerHTML.includes('AIGC 动画短片'));
assert.ok(panel.innerHTML.includes('<video controls'));
assert.equal((panel.innerHTML.match(/<img /g) || []).length, 2);
for (const file of ['front.jpg', 'back.jpg']) {
  assert.ok(statSync(new URL(`../public/assets/works/stride/${file}`, import.meta.url)).size > 1000);
}
const discs = readFileSync(new URL('../src/worksDiscs.js', import.meta.url), 'utf8');
assert.ok(discs.includes('createStrideDetail'));
assert.ok(discs.includes('STRIDE_BACK'));
console.log('Stride: author/copy, stills, video and disc wiring passed.');
