import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { revealProgress, stripScale } from '../src/introReveal.js';

const source = readFileSync(new URL('../src/introMarquee.js', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '').replace(/export function /g, 'function ');
async function fixture() {
  let ready, contexts = 0, completed = 0, update;
  const node = () => ({ style: { transform: '' }, append() {}, prepend() {}, remove() {}, setAttribute() {}, getBoundingClientRect: () => ({ left: -400, width: 400 }) });
  const context = vm.createContext({
    revealProgress, stripScale, queueMicrotask, setTimeout() {},
    window: { innerWidth: 1280, matchMedia: () => ({ matches: false }), scrollTo() {}, addEventListener() {}, removeEventListener() {} },
    document: { querySelector: node, querySelectorAll: () => [], createElement: node,
      body: { classList: { add() {}, remove() {} } }, fonts: { ready: new Promise(resolve => { ready = resolve; }) } },
    gsap: { registerPlugin() {}, set() {}, context(fn) { contexts++; fn(); return { revert() {} }; }, to(_, config) { update = config.onUpdate; return {}; }, from() {} },
    ScrollTrigger: { refresh() {} }, SplitText: { create: () => ({ chars: [], revert() {} }) },
  });
  vm.runInContext(source, context);
  context.startIntro({ onReveal: () => completed++ });
  return { context, ready, contexts: () => contexts, completed: () => completed, update: () => update() };
}
const early = await fixture();
early.context.finishIntro();
early.ready();
await new Promise(resolve => setImmediate(resolve));
assert.equal(early.contexts(), 0, 'Finishing during font loading must not resurrect intro');
assert.equal(early.completed(), 1);
early.context.finishIntro();
assert.equal(early.completed(), 1, 'Finish must be idempotent');

const normal = await fixture();
normal.ready();
await new Promise(resolve => setImmediate(resolve));
assert.equal(normal.contexts(), 1);
normal.update();
await new Promise(resolve => setImmediate(resolve));
assert.equal(normal.completed(), 1, 'Fully revealed screen must unlock without an extra scroll');
normal.context.returnToIntro();
await new Promise(resolve => setImmediate(resolve));
assert.equal(normal.contexts(), 2, 'Replay must start a fresh intro');
console.log('Intro lifecycle: early navigation, stale fonts, completion and replay passed.');
