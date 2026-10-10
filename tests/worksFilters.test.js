import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const discs = readFileSync(new URL('../src/worksDiscs.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/worksDiscs.css', import.meta.url), 'utf8');

assert.ok(html.includes('class="works-hero"'));
assert.ok(html.includes('All works'));
assert.ok(html.includes('name="workKind"'));
assert.ok(html.includes('模型制作'));
assert.ok(html.includes('游戏设计'));
assert.ok(html.includes('视频生成'));
assert.ok(html.includes('场景设计'));
assert.ok(!html.includes('FILTER · TYPE'));
assert.ok(discs.includes('DISC_KIND'));
assert.ok(discs.includes('matchingDiscs'));
assert.ok(css.includes('border-radius: 999px'));

console.log('Works page: All Works hero and type filters passed.');
