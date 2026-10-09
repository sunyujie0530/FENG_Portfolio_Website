import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { createSlimeDetail } from '../src/slimeDetail.js';

const panel = { setAttribute() {}, querySelector() { return { addEventListener() {} }; } };
globalThis.document = { createElement: () => panel, querySelector: () => ({ append() {} }) };
createSlimeDetail(() => {});
assert.equal((panel.innerHTML.match(/YANG YIKUN/g) || []).length, 1);
assert.equal((panel.innerHTML.match(/杨沂锟 2026级硕士/g) || []).length, 1);
assert.ok(panel.innerHTML.includes('SLIME RUNNER'));
assert.ok(panel.innerHTML.includes('<video controls'));
assert.ok(statSync(new URL('../public/assets/works/slime-runner/back.png', import.meta.url)).size > 1000);
const discs = readFileSync(new URL('../src/worksDiscs.js', import.meta.url), 'utf8');
assert.ok(discs.includes('createSlimeDetail'));
assert.ok(discs.includes('19: SLIME_BACK'));
console.log('Slime: author/copy, back art, video and disc wiring passed.');
