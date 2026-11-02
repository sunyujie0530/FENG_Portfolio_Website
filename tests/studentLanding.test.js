import assert from 'node:assert/strict';
import { landingFrame, showWorksEntry } from '../src/studentLanding.js';

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
console.log('Student landing: scroll endpoints, continuous scale, cabinet motion and mobile layout passed.');
