import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8').replace(/\r\n/g,'\n');
const portal = readFileSync(new URL('../src/portal.js', import.meta.url), 'utf8').replace(/\r\n/g,'\n');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g,'\n');

assert.ok(!html.includes('name="studentId"'));
assert.ok(!html.includes('id="confirm-locker"'));
assert.ok(!html.includes('data-work-field disabled'));
for (const name of ['avatar','cover','gallery','roles','summary']) {
  assert.match(html,new RegExp(`name="${name}"[^>]*required`));
}
assert.ok(!html.includes('class="submit-hero"'));
assert.ok(!html.includes('class="submit-cursor"'));
assert.ok(html.includes('id="close-submit"'));
assert.ok(html.includes('id="deco-picker"'));
assert.ok(html.includes('class="deco-drum"'));
assert.ok(html.includes('data-deco="7"'));
assert.ok(main.includes('function addDoorExterior'));
assert.ok(main.includes('function setSubmissionDecor'));
assert.ok(main.includes("if ('deco' in detail)"));
assert.ok(portal.includes('function initDecoPicker'));
assert.ok(!portal.includes('lockerConfirmed'));
assert.ok(!portal.includes('setWorkLocked'));
assert.ok(portal.includes("new CustomEvent('submission-locker-change'"));
assert.ok(main.includes('if (detail.accent)'));
assert.ok(main.includes("createLocker(0, { empty: true })"));
assert.ok(main.includes('submissionDoorAnim.open'));
assert.ok(main.includes('submissionBackdrop.visible = active'));
assert.ok(main.includes('setSubmissionCamera'));
assert.ok(main.includes('OrthographicCamera'));
assert.ok(main.includes('empty && !personalInterior\n    ? materials.body'));
assert.ok(main.includes('intersectObject(submissionLocker, true)'));
assert.ok(main.includes('submissionDragRotation'));
assert.ok(main.includes('addInteriorStructure(locker, bodyH, innerW, innerD, cavityMat, !empty || personalInterior)'));

console.log('Submission: direct form, required materials and decoration preview passed.');
