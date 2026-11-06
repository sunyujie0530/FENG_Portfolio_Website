import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8').replace(/\r\n/g,'\n');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g,'\n');

assert.ok(html.includes('id="locker-hover-card"'));
assert.ok(main.includes('STUDENTS[index].name'));
assert.ok(main.includes("'点击打开柜门 →'"));
assert.ok(main.includes('doorAnims[hoveredLocker]?.open ? -1 : hoveredLocker, event, profileHover, discHover'));
assert.ok(main.includes('if (hits.length > 0) setLockerHoverCard(-1)'));
assert.ok(main.includes('if (!lockersInteractive()) {\n    setLockerHoverCard(-1);'));
assert.ok(main.includes('setLockerHoverCard(-1)'));

console.log('Locker hover card: owner label and pointer lifecycle passed.');
