import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const browse = read('src/browse.js'), html = read('index.html'), theme = read('src/uiTheme.css');
assert.ok(browse.includes("landing.querySelector('.landing-page-guide').hidden = home"));
assert.ok(!browse.includes('首页 / 创作导览'));
assert.ok(!browse.includes('首页 / 作品光盘导览'));
assert.ok(browse.includes('学生 / 柜子展厅'));
assert.ok(browse.includes('全部作品 / 分类浏览与检索'));
assert.ok(read('src/worksDiscs.js').includes('作品详情 /'));
assert.ok(read('src/discRoom.js').includes('的作品光盘库</p>'));
assert.ok(html.includes('关于 / 认识这个作品集'));
assert.ok(html.includes('作品投稿 / 定制展示柜与上传作品'));
assert.ok(html.includes('id="submit-back"'));
assert.ok(browse.includes("if (path === '/submit') submitOrigin = location.pathname"));
assert.ok(browse.includes("document.querySelector('#submit-back').addEventListener('click', leaveSubmit, true)"));
assert.ok(browse.includes('move(submitOrigin)'));
assert.ok(theme.includes('body.browse-preview.is-submit #top-nav'));
assert.ok(browse.includes("pageGuide.id = 'page-location'"));
assert.ok(browse.includes("pageGuide.textContent = path === '/' ? '' : source?.textContent || ''"));
assert.ok(theme.includes('.page-guide:not(#page-location) { display:none !important; }'));
assert.ok(theme.includes('font:400 11px/1.5 var(--ui-font)'));
const pageGuide = {}, location = { pathname: '/' };
const context = vm.createContext({
  pageGuide, location,
  landing: { querySelector: () => ({ textContent: '学生 / 柜子展厅' }) },
  root: { querySelector: () => ({ textContent: '全部作品 / 分类浏览与检索' }) },
  document: { querySelector: selector => ({ textContent: selector.includes('submit') ? '作品投稿' : selector.includes('about') ? '关于' : '作品详情' }) },
});
vm.runInContext(browse.match(/  const syncPageGuide = \(\) => \{[\s\S]*?\n  \};/)[0] + '\nthis.sync = syncPageGuide;', context);
for (const [path, expected] of [['/students', '学生 / 柜子展厅'], ['/works', '全部作品 / 分类浏览与检索'], ['/submit', '作品投稿'], ['/about', '关于'], ['/works/wrong-plane', '作品详情'], ['/', '']]) {
  location.pathname = path;
  context.sync();
  assert.equal(pageGuide.textContent, expected);
  assert.equal(pageGuide.hidden, !expected);
}
console.log('Chinese page guides: home excluded; other routes labelled; submission return and shared navigation wired.');
