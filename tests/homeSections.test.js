import assert from 'node:assert/strict';
import { homeSections } from '../src/studentLanding.js';

for (const height of [720, 844]) {
  for (const aboutHeight of [300, 900]) {
    assert.equal(homeSections(height, 0, aboutHeight).cdY - height, 150);
    for (const scroll of [0, height + 150, height + 300, height * 2 + 300]) {
      const frame = homeSections(height, scroll, aboutHeight);
      assert.equal(frame.aboutY - (frame.cdY + height), 150);
      if (scroll <= height + 300) assert.equal(frame.uploadY, 0);
      else assert.equal(height - 16 + frame.uploadY, frame.aboutY - 16);
    }
  }
}
console.log('Homepage spacing and upload boundary passed.');
