import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g,'\n');

assert.ok(main.includes("badge.name = 'expanded-id-badge'"));
assert.ok(main.includes("style: 'studio-card-blue-pink'"));
assert.ok(main.includes("clickableParts: ['holder', 'clip', 'ticket', 'petals', 'charms', 'letter-beads']"));
assert.ok(main.includes('function openBadgeDetail()'));
assert.ok(main.includes('function closeBadgeDetail()'));
assert.ok(main.includes('const BADGE_DETAIL_ZOOM = 1.34'));
const cardEntry = main.slice(main.indexOf('if (focusedLocker === 3 && doorAnims[3].progress > 0.6 && hits.some'), main.indexOf('const index = doorIndexFromObject(hits[0].object);', main.indexOf('if (focusedLocker === 3 && doorAnims[3].progress > 0.6 && hits.some')));
assert.ok(cardEntry.includes('focusBadge();\n    openBadgeDetail();'));
assert.ok(!cardEntry.includes('browse-student'));
assert.ok(main.includes('closeBadgeDetail();'));
assert.ok(main.includes('expandedBadge.visible = true;'));
assert.ok(main.includes('expandedBadge.visible = false;'));
assert.ok(!main.includes('badgeDetailAnim'));
assert.ok(main.includes('hits.some((hit) => isIdBadge(hit.object))'));
assert.ok(main.includes('if (badgeDetailOpen) closeBadgeDetail();'));
const close = main.slice(main.indexOf('function closeBadgeDetail()'), main.indexOf('function setIntroCamera'));
assert.ok(close.includes('openLocker(3);'));

console.log('Expanded badge: model hierarchy, click entry and return state passed.');
