import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { landingFrame } from '../src/studentLanding.js';
const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const css = read('src/typography.css');
assert.ok(css.includes('--ui-font:"Montserrat","PingFang SC"'));
assert.ok(css.includes('font-weight:100 900'));
for (const weight of [300, 400, 600]) assert.ok(css.includes(`:${weight};`));
assert.ok(!/(?:background|border|box-shadow|color|transition)\s*:/.test(css), 'Typography must not change interaction styling.');
assert.ok(read('src/main.js').indexOf("import './typography.css'") > read('src/main.js').indexOf("import './studentLanding.css'"));
for (const subset of ['Latin', 'LatinExt']) {
  const font = readFileSync(new URL(`../public/fonts/Montserrat-${subset}.woff2`, import.meta.url));
  assert.equal(font.subarray(0, 4).toString(), 'wOF2');
}
assert.ok(read('public/fonts/Montserrat-OFL.txt').includes('SIL OPEN FONT LICENSE'));
assert.equal(landingFrame(1280, 720, 0).fontSize, 64);
assert.equal(landingFrame(1920, 1080, 0).fontSize, 80);
assert.equal(landingFrame(390, 844, 0).subtitleSize, 16);
assert.equal(landingFrame(1280, 720, 720).fontSize, 48);
