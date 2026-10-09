import assert from 'node:assert/strict';
import { revealProgress, stripScale, introCameraDistance } from '../src/introReveal.js';

assert.equal(introCameraDistance(0), 1.65);
assert.equal(introCameraDistance(1), 1);
let previousDistance = 1.65;
for (let step = 0; step <= 100; step++) {
  const distance = introCameraDistance(step / 100);
  assert.ok(distance >= 1 && distance <= previousDistance);
  previousDistance = distance;
}

for (const width of [390, 1440, 2048]) {
  assert.equal(revealProgress(width, 400, width), 0);
  assert.equal(revealProgress(width * 0.24, 400, width), 0);
  assert.equal(revealProgress(-400, 400, width), 1);
}
for (let row = 0; row < 28; row++) {
  assert.equal(stripScale(0, row), 1);
  assert.equal(stripScale(1, row), 0);
  let previous = 1;
  for (let step = 0; step <= 100; step++) {
    const scale = stripScale(step / 100, row);
    assert.ok(scale >= 0 && scale <= previous);
    previous = scale;
  }
}
for (const progress of [0.25, 0.5, 0.75]) {
  const scales = Array.from({ length: 28 }, (_, row) => stripScale(progress, row));
  assert.ok(Math.abs(Math.max(...scales) - Math.min(...scales) - 1 / 3) < 1e-12);
}
console.log('Intro reveal: trigger, endpoints, monotonic strips and one-third band passed.');
