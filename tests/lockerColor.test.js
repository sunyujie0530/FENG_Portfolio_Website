import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g,'\n');
const css = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8').replace(/\r\n/g,'\n');

assert.ok(main.includes('scene.background = new THREE.Color(0xffffff)'));
assert.ok(main.includes('hsl.s * 1.18 + 0.035'));
assert.ok(main.includes('[lockerBank, expandedBadge].forEach'));
assert.ok(main.includes('new THREE.PointLight(0xffc7ad, 2.15'));
assert.ok(main.includes('renderer.toneMappingExposure = 1.1'));
assert.ok(css.includes('body.is-lockers {\n  background: #fff;'));

console.log('Locker page: white background and selective color boost passed.');
