import assert from 'node:assert/strict';
import { lstatSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const ignored = readFileSync(new URL('.gitignore', root), 'utf8');
for (const [video, page] of [
  ['beaker-crow/demo.mov', 'beakerDetail.js'],
  ['shi-dao/demo.mp4', 'shiDaoDetail.js'],
  ['slime-runner/demo.mp4', 'slimeDetail.js'],
  ['stride/demo.mp4', 'strideDetail.js'],
]) {
  const path = `public/assets/works/${video}`;
  assert.equal(lstatSync(new URL(path, root), { throwIfNoEntry: false }), undefined, `${path} must not enter the public build`);
  assert.ok(ignored.includes(`/${path}`));
  assert.ok(!readFileSync(new URL(`src/${page}`, root), 'utf8').includes(`<source src="/assets/works/${video}"`));
}
