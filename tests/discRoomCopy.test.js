import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/discRoom.js', import.meta.url), 'utf8');
for (const removed of ['cd-room-lead', 'cd-archive-stamp', 'cd-current-number', 'cd-current-title', 'cd-current-meta', 'cd-current-summary']) {
  assert.ok(!source.includes(removed), `${removed} should be removed`);
}
assert.ok(source.includes('放入所选光盘 ↗'));
assert.ok(source.includes('role="status" aria-live="polite"'));
assert.ok(source.includes("insert.addEventListener('click'"));
assert.ok(source.includes("background-image:url('${escapeHtml(work.cover)}')"));
assert.ok(!source.includes('cd-label-band'));
const css = readFileSync(new URL('../src/discRoom.css', import.meta.url), 'utf8');
const art = css.match(/\.cd-art \{([^}]+)\}/)[1];
assert.ok(!/opacity|grayscale|mix-blend-mode/.test(art));
const footer = css.match(/\.cd-room-footer \{([^}]+)\}/)[1];
assert.ok(!footer.includes('border-top'));
assert.ok(!source.includes('<i></i> 将光盘'));
assert.ok(css.includes('width:88px; height:88px'));
assert.ok(css.includes('font:400 18px/1.5 var(--ui-font)'));
const detailCss = readFileSync(new URL('../src/workDetail.css', import.meta.url), 'utf8');
assert.ok(detailCss.includes('.work-detail h1:focus { outline:none; }'));
