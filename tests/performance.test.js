import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const works = readFileSync(new URL('../src/worksDiscs.js', import.meta.url), 'utf8');

assert.ok(main.includes('if (!switchingWorks && worksProgress === 1) return;'));
assert.ok(main.includes('if (sceneDirty || controlsChanged)'));
assert.ok(works.includes('const detailPanels = new Map();'));
assert.ok(works.includes('factory(closeDetail)'));
assert.ok(works.includes('const discParts = {'));

console.log('Performance: hidden renders, eager details and duplicate disc geometry stay removed.');
