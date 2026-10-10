import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/introMarquee.js', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '').replace(/export function /g, 'function ');

const listeners = new Map();
const classes = new Set();
let reveals = 0;
const enter = {
  addEventListener(type, fn) { listeners.set(`enter:${type}`, fn); },
  removeEventListener() {},
};
const wrapper = {};
const context = vm.createContext({
  document: {
    querySelector(selector) { return selector === '#intro' ? wrapper : enter; },
    body: { classList: { add: (...names) => names.forEach((name) => classes.add(name)), remove: (...names) => names.forEach((name) => classes.delete(name)) } },
  },
});

vm.runInContext(source, context);
context.startIntro({ onReveal: () => reveals++ });
listeners.get('enter:click')();
listeners.get('enter:click')();
assert.equal(reveals, 1, 'Entering the gallery stays idempotent');
assert.ok(classes.has('is-lockers'));
assert.equal(typeof context.returnToIntro, 'undefined', 'Intro cannot be replayed within the site');
console.log('Intro lifecycle: single-screen one-way entry passed.');
