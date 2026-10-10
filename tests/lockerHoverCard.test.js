import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

assert.ok(html.includes('id="locker-hover-card"'));
assert.ok(main.includes("'王文骥'"));
assert.ok(main.includes("'孙玉洁'"));
assert.ok(main.includes("index === 4 ? '千万别点开' : '点击打开看看'"));
assert.ok(main.includes('setLockerHoverCard(doorAnims[hoveredLocker]?.open ? -1 : hoveredLocker, event)'));
assert.ok(main.includes('if (hits.length > 0) setLockerHoverCard(-1)'));
assert.ok(main.includes('if (!lockersInteractive()) {\n    setLockerHoverCard(-1);'));
assert.ok(main.includes('setLockerHoverCard(-1)'));

console.log('Locker hover card: owner label and pointer lifecycle passed.');
