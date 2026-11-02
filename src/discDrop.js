export function discInsideTray(center, tray) {
  return center.x >= tray.left && center.x <= tray.right
    && center.y >= tray.top && center.y <= tray.bottom;
}

export function clampDisc(value, size, diameter) {
  const edge = Math.min(diameter / 2 + 8, size / 2);
  return Math.max(edge, Math.min(size - edge, value));
}
