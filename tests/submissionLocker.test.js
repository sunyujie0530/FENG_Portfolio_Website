import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const portal = readFileSync(new URL('../src/portal.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

assert.equal((html.match(/name="lockerNumber"/g) || []).length, 8);
assert.equal((html.match(/data-work-field disabled/g) || []).length, 3);
assert.ok(html.includes('name="lockerColor"'));
assert.ok(html.includes('name="lockerAccent"'));
assert.ok(html.includes('name="avatar"'));
assert.ok(html.includes('class="locker-choice-number"'));
assert.ok(html.includes('class="submit-hero"'));
assert.ok(html.includes('class="submit-cursor"'));
assert.ok(html.includes('id="close-submit"'));
assert.ok(html.includes('id="deco-picker"'));
assert.ok(html.includes('class="deco-drum"'));
assert.ok(html.includes('data-deco="7"'));
assert.ok(main.includes('function addDoorExterior'));
assert.ok(main.includes('function setSubmissionDecor'));
assert.ok(main.includes("if ('deco' in detail)"));
assert.ok(portal.includes('function initDecoPicker'));
assert.ok(portal.includes("if (form.dataset.lockerConfirmed !== 'true')"));
assert.ok(portal.includes('setWorkLocked(false)'));
assert.ok(portal.includes("new CustomEvent('submission-locker-change'"));
assert.ok(portal.includes('syncLockerScene({ accent: event.target.value })'));
assert.ok(main.includes('if (detail.accent)'));
assert.ok(main.includes("createLocker(0, { empty: true })"));
assert.ok(main.includes('submissionDoorAnim.open'));
assert.ok(main.includes('submissionBackdrop.visible = active'));
assert.ok(main.includes('setSubmissionCamera'));
assert.ok(main.includes('OrthographicCamera'));
assert.ok(main.includes('empty\n    ? materials.body'));
assert.ok(main.includes('intersectObject(submissionLocker, true)'));
assert.ok(main.includes('submissionDragRotation'));
assert.ok(main.includes('addInteriorStructure(locker, bodyH, innerW, innerD, cavityMat, !empty)'));

console.log('Submission: locker choice, customization and locked-first workflow passed.');
