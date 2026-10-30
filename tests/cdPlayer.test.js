import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createCdPlayer, updateCdPlayer, CD_PLAYER } from '../src/cdPlayer.js';

// Canvas drawing is inspected in-browser; this check covers model assembly and motion.
globalThis.document = { createElement: () => ({ getContext: () => new Proxy({}, {
  get: (_, name) => name === 'createLinearGradient' ? () => ({ addColorStop() {} }) : () => {},
  set: () => true
}) }) };
const player = createCdPlayer();
const bounds = new THREE.Box3().setFromObject(player).getSize(new THREE.Vector3());
assert.ok(bounds.x > 0.43 && bounds.x < 0.46);
assert.ok(bounds.y >= CD_PLAYER.height - 0.001);
assert.ok(player.getObjectByName('disc'));
assert.ok(player.getObjectByName('clear-pane').material.transparent);
assert.ok(player.getObjectByName('button-row').isInstancedMesh);
assert.ok(player.getObjectByName('disc-load-socket'));
player.traverse(node => { if (node.isMesh) assert.ok(node.name); });
for (let i = 0; i < 100; i++) updateCdPlayer(player, true, 1 / 60);
assert.equal(player.userData.hover, 1);
assert.ok(Math.abs(player.userData.carrier.position.y - (0.063 + CD_PLAYER.ejectY)) < 1e-8);
assert.ok(player.userData.lid.rotation.x < 0);
for (let i = 0; i < 100; i++) updateCdPlayer(player, false, 1 / 60);
assert.equal(player.userData.hover, 0);
assert.equal(player.userData.carrier.position.z, 0.062);
assert.equal(updateCdPlayer(player, false, 1 / 60), false);
updateCdPlayer(player, true, 0, true);
assert.equal(player.userData.hover, 1);
console.log('CD player assembly, hover/retract and reduced motion passed.');
