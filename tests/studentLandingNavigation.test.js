import assert from 'node:assert/strict';
import { initStudentLanding } from '../src/studentLanding.js';

const listeners = new Map();
const frames = new Map();
let frameId = 0;
const element = () => ({
  dataset: {}, style: { setProperty(name, value) { this[name] = value; } }, offsetWidth: 100, offsetHeight: 560,
  addEventListener(type, fn) { this[type] = fn; },
  focus() { this.focused = true; }, matches() { return false; },
});
const start = element(), picker = element(), selected = element();
picker.querySelector = () => selected;
const nodes = new Map(['.landing-heading', '.landing-works-link', '.home-cd-intro', '.locker-access', '.home-about', '#home-back-top'].map(key => [key, element()]));
nodes.set('#student-start', start);
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
const bodyClasses = new Set();
globalThis.document = { hidden: false, body: { classList: { contains: name => bodyClasses.has(name), toggle(name, on) { if (on) bodyClasses.add(name); else bodyClasses.delete(name); }, remove(name) { bodyClasses.delete(name); } }, style: { setProperty() {} } }, addEventListener() {} };
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
  assert.equal(bodyClasses.has('is-student-directory'), false);
  assert.equal(nodes.get('.home-cd-intro').hidden, false);
};
active(true);
expectHome();
window.dispatchEvent(new Event('browse-about')); flush();
assert.equal(window.scrollY, innerHeight * 2);
assert.equal(nodes.get('.home-about').hidden, false);
assert.equal(nodes.get('.home-about').inert, false);
assert.equal(landing.style['--home-cd-y'], '-720px');
assert.equal(landing.style['--home-about-y'], '0px');
assert.equal(landing.style['--home-about-clip'], '0px');
nodes.get('#home-back-top').click(); flush();
expectHome();
start.click(); flush();
assert.equal(entries.length, 2);
assert.equal(location.pathname, '/students');
assert.equal(landing.dataset.directory, 'true');
assert.equal(bodyClasses.has('is-student-directory'), true);
assert.equal(start.hidden, true);
assert.equal(nodes.get('.home-about').hidden, true);
for (const scroll of [0, 360, 1440]) {
  window.scrollY = scroll; window.dispatchEvent(new Event('scroll')); flush();
  assert.equal(landing.style['--landing-progress'], 1);
  assert.equal(landing.dataset.directory, 'true');
  assert.equal(start.hidden, true);
}
index--; location.pathname = entries[index].path; active(true); flush(); // Browser Back.
expectHome();
index++; location.pathname = entries[index].path; active(true); flush(); // Browser Forward.
assert.equal(landing.dataset.directory, 'true');
window.dispatchEvent(new Event('browse-home')); flush();
expectHome();
start.click(); flush();
window.dispatchEvent(new Event('browse-home')); flush(); // FENG / Home navigation.
expectHome();
start.click(); flush();
active(false); // Work detail and then browser Back to the directory entry.
active(true); flush();
assert.equal(landing.dataset.directory, 'true');
assert.equal(window.scrollY, 0);
location.pathname = '/'; active(true); flush(); // Home tab from another route.
expectHome();
location.pathname = '/students'; active(true); flush(); // Direct Student URL / Student tab.
assert.equal(landing.dataset.directory, 'true');
assert.equal(window.scrollY, 0);
console.log('Preview navigation: Back, Forward, home exits, repeated entry and route return passed.');
