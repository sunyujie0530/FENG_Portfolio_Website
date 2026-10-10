import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

assert.ok(main.includes("badge.name = 'expanded-id-badge'"));
assert.ok(main.includes("style: 'studio-card-blue-pink'"));
assert.ok(main.includes("clickableParts: ['holder', 'clip', 'ticket', 'petals', 'charms', 'letter-beads']"));
assert.ok(main.includes('function openBadgeDetail()'));
assert.ok(main.includes('function closeBadgeDetail()'));
assert.ok(main.includes('const BADGE_DETAIL_ZOOM = 1.34'));
assert.ok(main.includes('if (badgeFocus) {\n      openBadgeDetail();'));
assert.ok(main.includes('closeBadgeDetail();'));
assert.ok(main.includes('expandedBadge.visible = true;'));
assert.ok(main.includes('expandedBadge.visible = false;'));
assert.ok(!main.includes('badgeDetailAnim'));
assert.ok(main.includes("const badgeHit = hits.find((hit) => isIdBadge(hit.object))"));
assert.ok(main.includes("const near = focusedLocker >= 0 && !badgeFocus"));

console.log('Expanded badge: model hierarchy, click entry and return state passed.');
