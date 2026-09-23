import * as THREE from 'three';

// Closed annular shell: explicit radial quads avoid the long, thin cap
// triangles produced by triangulating a shape with a circular hole.
export function createDiscGeometry() {
  const segments = 192;
  const positions = [], normals = [], uvs = [], indices = [];
  const geometry = new THREE.BufferGeometry();
  const profile = [
    [0.14, -0.004], [0.142, -0.008], [0.998, -0.008],
    [1, -0.004], [1, 0.004], [0.998, 0.008],
    [0.142, 0.008], [0.14, 0.004], [0.14, -0.004],
  ];
  for (let band = 0; band < profile.length - 1; band += 1) {
    const [r0, z0] = profile[band];
    const [r1, z1] = profile[band + 1];
    const length = Math.hypot(r1 - r0, z1 - z0);
    const radialNormal = (z1 - z0) / length;
    const zNormal = -(r1 - r0) / length;
    const rows = band === 1 || band === 5 ? 12 : 1;
    const base = positions.length / 3;
    const start = indices.length;
    for (let row = 0; row <= rows; row += 1) {
      const r = THREE.MathUtils.lerp(r0, r1, row / rows);
      const z = THREE.MathUtils.lerp(z0, z1, row / rows);
      for (let i = 0; i <= segments; i += 1) {
        const a = i / segments * Math.PI * 2;
        const c = Math.cos(a), s = Math.sin(a);
        positions.push(r * c, r * s, z);
        normals.push(radialNormal * c, radialNormal * s, zNormal);
        uvs.push((r * c + 1) / 2, (r * s + 1) / 2);
        if (row < rows && i < segments) {
          const v = base + row * (segments + 1) + i;
          const next = v + segments + 1;
          indices.push(v, v + 1, next, v + 1, next + 1, next);
        }
      }
    }
    geometry.addGroup(start, indices.length - start, band === 1 || band === 5 ? 0 : 1);
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
