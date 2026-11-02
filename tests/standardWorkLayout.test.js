import assert from 'node:assert/strict';
import { standardWorkLayout } from '../src/standardWorkLayout.js';

const node = (tag, text = '') => ({
  tag, textContent: text, className: '', childNodes: [], events: {},
  append(...children) { this.childNodes.push(...children); },
  replaceChildren(...children) { this.childNodes = children; },
  cloneNode() { return { ...node(this.tag, this.textContent), className: this.className, childNodes: this.childNodes.map(child => child.cloneNode()) }; },
  addEventListener(type, handler) { this.events[type] = handler; },
  get classList() { return { remove: name => { this.className = this.className.split(' ').filter(value => value !== name).join(' '); } }; },
});
globalThis.document = { createElement: node };
globalThis.matchMedia = () => ({ matches: true });
const title = node('h1', 'WANG WENRUI CHEN JIAWEI');
const subtitle = node('h2', '王文睿 陈嘉伟 2024级硕士');
const roles = node('p', '王文睿：策划、关卡、程序　策划：陈嘉伟');
const author = node('header');
author.append(title, subtitle, roles);
author.querySelector = selector => selector === 'h1' ? title : subtitle;
const copy = node('div'); copy.className = 'work-detail__copy bcw-copy';
copy.append(node('p', '原作品介绍'));
const heading = node('h3', '01 作品简介'); heading.className = 'bcw-section';
const gallery = node('div'), video = node('video'), media = node('div'), back = node('button');
media.append(gallery, video);
const nodes = { '.bcw-author': author, '.bcw-copy': copy, '.bcw-media': media, '.bcw-section': heading, '.work-detail__back': back };
const panel = node('article');
panel.className = 'work-detail bcw-detail';
panel.querySelector = selector => nodes[selector];
panel.updateLayout = () => {};
panel.clientHeight = 720;
panel.scrollTo = options => { panel.lastScroll = options; };
standardWorkLayout(panel, 3);
const [keptBack, hero, content] = panel.childNodes;
assert.equal(keptBack, back);
assert.equal(hero.className, 'work-detail__hero');
assert.equal(content.className, 'work-detail__content');
const intro = hero.childNodes[0], body = content.childNodes[1];
assert.deepEqual(intro.childNodes.slice(0, 3), [title, subtitle, roles]);
assert.equal(intro.childNodes[3].childNodes[0].textContent, '原作品介绍');
assert.deepEqual(body.childNodes, [heading, copy, gallery, video]);
assert.equal(panel.updateLayout, undefined);
assert.equal(panel.className, 'work-detail');
assert.equal(heading.className, '');
const down = intro.childNodes.at(-1);
assert.equal(down.href, '#work-content-3');
down.events.click({ preventDefault() {} });
assert.deepEqual(panel.lastScroll, { top: 720, behavior: 'instant' });
const reference = { querySelector: () => null };
assert.equal(standardWorkLayout(reference, 1), reference);
console.log('Standard work layout: reference unchanged; author, roles, copy, original media nodes and scroll link preserved.');
