import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/browse.js', import.meta.url), 'utf8');
const entries = [{ path: '/students', state: { lockerIndex: 3 } }];
let index = 0, pendingBack = false;
const location = { pathname: '/students', hash: '', href: 'http://localhost/students' };
const setLocation = path => {
  const url = new URL(path, 'http://localhost');
  Object.assign(location, { pathname: url.pathname, hash: url.hash, href: url.href });
};
const history = {
  get state() { return entries[index].state; },
  pushState(state, _, path) { entries.splice(++index); entries.push({ state, path }); setLocation(path); },
  replaceState(state, _, path) { entries[index] = { state, path }; setLocation(path); },
  back() { pendingBack = true; },
};
const context = vm.createContext({
  history, location, returning: false, listScroll: 0, submitOrigin: '/', detailOrigin: '/works',
  restoreFocus: '', lockerContext: { studentIndex: 3 }, root: { scrollTop: 200 },
  window: { dispatchEvent() {} }, Event,
  render() { context.returning = false; },
});
vm.runInContext(source.slice(source.indexOf('  const move ='), source.indexOf('  const crumbs =')) + '\nthis.move = move; this.goBack = goBack;', context);
const pop = () => {
  assert.ok(pendingBack);
  pendingBack = false;
  index--;
  setLocation(entries[index].path);
  context.returning = false;
};
context.move('/students/4/discs');
context.move('/works/barbarian');
assert.equal(history.state.detailOrigin, '/students/4/discs');
context.goBack('/students/4/discs');
context.goBack('/students/4/discs'); // Rapid double click must not skip another entry.
assert.equal(entries.length, 3);
pop();
assert.equal(location.pathname, '/students/4/discs');
history.back(); pop(); // Browser Back continues to the directory, not the work just exited.
assert.equal(location.pathname, '/students');
assert.equal(history.state.lockerIndex, 3);
context.move('/works');
context.move('/submit');
assert.equal(history.state.submitOrigin, '/works');
assert.ok(source.includes("if (['/submit','/my-works','/review'].includes(path)) submitOrigin = history.state?.submitOrigin || '/'"));
context.goBack(history.state.submitOrigin); pop();
assert.equal(location.pathname, '/works');
assert.equal(context.listScroll, 200);
// Viewing My Works must not replace the original upload entry page.
context.move('/submit');
context.move('/my-works');
assert.equal(history.state.submitOrigin,'/works');
context.submitOrigin='/'; // Simulate restoring the page after a reload.
context.submitOrigin=history.state.submitOrigin;
context.move('/submit');
assert.equal(history.state.submitOrigin,'/works');
context.goBack(history.state.submitOrigin);
assert.equal(location.pathname,'/works');
// Starting a new upload flow from elsewhere uses the new entry page.
context.move('/students/4/discs');
context.move('/submit');
assert.equal(history.state.submitOrigin,'/students/4/discs');
context.move('/my-works');
context.move('/submit');
assert.equal(history.state.submitOrigin,'/students/4/discs');
context.goBack(history.state.submitOrigin);
assert.equal(location.pathname,'/students/4/discs');

context.move('/students/4/discs');
context.move('/');
assert.equal(history.state.lockerIndex, undefined, 'Home must not inherit a cabinet to restore');
assert.ok(source.includes("const returnLocker = path === '/students' ? history.state?.lockerIndex : null"));

// Direct/shared detail links have no in-app parent entry. Replace with a safe fallback.
history.replaceState({}, '', '/works/barbarian');
const length = entries.length;
context.goBack('/works');
assert.equal(location.pathname, '/works');
assert.equal(entries.length, length);
context.goBack('/students', { lockerIndex: 3 });
assert.equal(history.state.lockerIndex, 3);

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
for (const prefix of ['students', 'works']) {
  assert.ok(config.rewrites.some(rule => rule.source === `/${prefix}/:path*` && rule.destination === '/index.html'));
}
console.log('Route history: one-level returns, double clicks, direct links, persistent upload origin and home isolation passed.');

assert.ok(config.rewrites.some(rule => rule.source === '/my-works' && rule.destination === '/index.html'));
