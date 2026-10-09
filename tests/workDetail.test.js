import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { detailPhases, pageProgress } from '../src/workDetailMotion.js';

assert.equal(pageProgress(0, 1000), 0);
assert.equal(pageProgress(180, 1000), 1);
assert.deepEqual(detailPhases(0), { gather: 0, flip: 0, move: 0, text: 0 });
assert.deepEqual(detailPhases(1), { gather: 1, flip: 1, move: 1, text: 1 });
assert.equal(detailPhases(0.42).gather, 1);
assert.equal(detailPhases(0.42).move, 0);
assert.equal(detailPhases(0.65).flip, 1);
assert.equal(detailPhases(0.65).text, 0);
let previous = detailPhases(0);
for (let i = 1; i <= 100; i++) {
  const next = detailPhases(i / 100);
  for (const key of Object.keys(next)) assert.ok(next[key] >= previous[key] && next[key] <= 1);
  previous = next;
}
for (const file of ['back', 'visual-2', 'visual-3', 'key-visual']) {
  const data = readFileSync(new URL(`../public/assets/works/clay-doll/${file}.png`, import.meta.url));
  assert.equal(data.subarray(1, 4).toString(), 'PNG');
}
console.log('Work detail: staged/reversible motion and all four PNG assets passed.');
