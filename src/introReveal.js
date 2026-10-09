const clamp = (value) => Math.max(0, Math.min(1, value));

export function introCameraDistance(progress) {
  const t = clamp(progress);
  const eased = t * t * (3 - 2 * t);
  return 1 + 0.65 * (1 - eased);
}

export function revealProgress(textLeft, textWidth, viewportWidth) {
  // Reference: the text starts near 24% of the viewport when the reveal begins.
  return clamp((viewportWidth * 0.24 - textLeft) / (viewportWidth * 0.24 + textWidth));
}

export function stripScale(progress, row) {
  // Keep a one-third-screen stepped band, clipped smoothly at either edge.
  const bandWidth = 1 / 3;
  const offset = ((row * 7) % 11) / 10 * bandWidth;
  return clamp((1 - progress) * (1 + bandWidth) - bandWidth + offset);
}
