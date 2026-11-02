import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { homeAboutMarkup } from '../src/studentLanding.js';

const markup = homeAboutMarkup([
  { name: '甲', grade: '2025级', tags: '游戏设计' },
  { name: '乙', grade: '2024级', tags: '三维' },
  { name: '03号学生', grade: '2024级', tags: '资料待补充' },
]);
assert.ok(markup.includes('2位学生'));
assert.ok(markup.includes('2024–2025'));
assert.ok(markup.includes('id="home-back-top"'));
assert.ok(markup.includes('<p class="home-about-guide">网站介绍</p>'));
assert.ok(markup.includes('每一扇柜门背后，是一位创作者'));
assert.ok(!markup.includes('邮箱12345678'));
const browse = readFileSync(new URL('../src/browse.js', import.meta.url), 'utf8');
assert.ok(browse.includes("nav.querySelector('#nav-about').hidden = true"));
assert.ok(browse.includes("if (path === '/about') path = '/#about'"));
assert.ok(browse.includes("if (path === '/' && location.hash === '#about')"));
const css = readFileSync(new URL('../src/studentLanding.css', import.meta.url), 'utf8');
assert.ok(css.includes('clip-path:inset(var(--home-about-clip,100%) 0 0 0)'));
assert.ok(markup.includes('<div class="home-about-name"><p class="home-about-guide">网站介绍</p><p>About</p>'));
assert.ok(css.includes('.home-about-mentor { grid-column:2; grid-row:1; }'));
assert.ok(css.includes('.home-about-mentor h3,.home-about-cohort h3 { margin-top:0; }'));
assert.ok(!css.includes('min-height:calc(100dvh - 78px)'));
