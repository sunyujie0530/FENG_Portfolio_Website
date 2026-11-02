import assert from 'node:assert/strict';
import { initStudentLanding } from '../src/studentLanding.js';

const listeners = new Map();
const frames = new Map();
let frameId = 0;
const element = () => ({
  dataset: {}, style: { setProperty() {} }, offsetWidth: 100,
  addEventListener(type, fn) { this[type] = fn; },
  focus() { this.focused = true; }, matches() { return false; },
});
const start = element(), home = element(), picker = element(), selected = element();
picker.querySelector = () => selected;
const nodes = new Map(['.landing-heading', '.landing-works-link', '.home-cd-intro', '.locker-access'].map(key => [key, element()]));
nodes.set('#student-start', start);
nodes.set('#student-home-back', home);
nodes.set('.grade-picker', picker);
nodes.get('.home-cd-intro').querySelectorAll = () => [];
const landing = { ...element(), querySelector: key => nodes.get(key), querySelectorAll: () => [element(), element()] };
globalThis.innerWidth = 1280;
globalThis.innerHeight = 720;
globalThis.location = { href: 'http://localhost/', pathname: '/' };
const entries = [{ state: {}, path: '/' }];
let index = 0;
globalThis.history = {
  get state() { return entries[index].state; },
  pushState(state, _, path) { entries.splice(++index); entries.push({ state, path }); location.pathname = path; },
};
globalThis.document = { hidden: false, body: { classList: { contains: () => false, toggle() {}, remove() {} }, style: { setProperty() {} } }, addEventListener() {} };
globalThis.window = {
  scrollY: 0,
  addEventListener(type, fn) { listeners.set(type, fn); },
  dispatchEvent(event) { listeners.get(event.type)?.(); },
  scrollTo({ top }) { this.scrollY = top; listeners.get('scroll')?.(); },
};
globalThis.matchMedia = () => ({ matches: true, addEventListener() {} });
globalThis.requestAnimationFrame = fn => { frames.set(++frameId, fn); return frameId; };
globalThis.cancelAnimationFrame = id => frames.delete(id);
const flush = () => { for (const [id, fn] of frames) { frames.delete(id); fn(); } };
const active = initStudentLanding(landing);
const expectHome = () => {
  assert.equal(landing.dataset.directory, 'false');
  assert.equal(location.pathname, '/');
  assert.equal(window.scrollY, 0);
  assert.equal(start.dataset.started, 'false');
  assert.equal(home.hidden, true);
  assert.equal(nodes.get('.home-cd-intro').hidden, false);
};
active(true);
expectHome();
start.click(); flush();
assert.equal(entries.length, 2);
assert.equal(location.pathname, '/students');
assert.equal(landing.dataset.directory, 'true');
assert.equal(home.hidden, false);
assert.equal(start.hidden, true);
index--; location.pathname = entries[index].path; active(true); flush(); // Browser Back.
expectHome();
index++; location.pathname = entries[index].path; active(true); flush(); // Browser Forward.
assert.equal(landing.dataset.directory, 'true');
home.click(); flush();
expectHome();
start.click(); flush();
window.dispatchEvent(new Event('browse-home')); flush(); // FENG / Home navigation.
expectHome();
start.click(); flush();
active(false); // Work detail and then browser Back to the directory entry.
active(true); flush();
assert.equal(landing.dataset.directory, 'true');
assert.equal(window.scrollY, 720);
location.pathname = '/'; active(true); flush(); // Home tab from another route.
expectHome();
location.pathname = '/students'; active(true); flush(); // Direct Student URL / Student tab.
assert.equal(landing.dataset.directory, 'true');
assert.equal(window.scrollY, 720);
console.log('Preview navigation: Back, Forward, home exits, repeated entry and route return passed.');
