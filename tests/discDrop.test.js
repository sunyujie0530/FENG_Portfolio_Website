import assert from 'node:assert/strict';
import { discInsideTray, clampDisc } from '../src/discDrop.js';

const tray = { left: 100, right: 300, top: 50, bottom: 250 };
assert.equal(discInsideTray({ x: 200, y: 150 }, tray), true);
assert.equal(discInsideTray({ x: 100, y: 250 }, tray), true);
assert.equal(discInsideTray({ x: 99, y: 150 }, tray), false);
assert.equal(discInsideTray({ x: 200, y: 251 }, tray), false);
assert.equal(clampDisc(-50, 400, 140), 78);
assert.equal(clampDisc(999, 400, 140), 322);
assert.equal(clampDisc(200, 400, 140), 200);
assert.equal(clampDisc(0, 100, 140), 50);
console.log('Disc drop bounds and off-screen prevention passed.');
