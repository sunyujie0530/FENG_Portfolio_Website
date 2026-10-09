import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { createBcwDetail } from '../src/bcwDetail.js';

const panel = { setAttribute() {}, querySelector() { return { addEventListener() {} }; } };
globalThis.document = { createElement: () => panel, querySelector: () => ({ append() {} }) };
createBcwDetail(() => {});
assert.ok(panel.innerHTML.includes('WANG WENRUI  CHEN JIAWEI'));
assert.ok(panel.innerHTML.includes('王文睿 陈嘉伟 2025级硕士'));
assert.ok(panel.innerHTML.includes('王文睿：策划、关卡、程序'));
assert.ok(panel.innerHTML.includes('策划：陈嘉伟'));
assert.equal((panel.innerHTML.match(/这是一款本地双人合作闯关游戏/g) || []).length, 1);
assert.equal((panel.innerHTML.match(/<img /g) || []).length, 3);
assert.ok(panel.innerHTML.includes('<video controls'));
for (const file of ['scene-1.png', 'back.png', 'scene-3.png', 'demo.mp4']) {
  assert.ok(statSync(new URL(`../public/assets/works/blind-can-walk/${file}`, import.meta.url)).size > 1000);
}
const discs = readFileSync(new URL('../src/worksDiscs.js', import.meta.url), 'utf8');
assert.ok(!discs.includes('查看《泥人张》作品'));
console.log('BCW: single author/copy, three images, video and removed shortcut passed.');
