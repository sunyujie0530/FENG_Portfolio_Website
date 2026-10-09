const smooth = (start, end, value) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};

export function detailPhases(progress) {
  return {
    gather: smooth(0, 0.42, progress),
    flip: smooth(0.1, 0.65, progress),
    move: smooth(0.52, 1, progress),
    text: smooth(0.72, 1, progress),
  };
}

export function pageProgress(scrollTop, height) {
  return Math.min(1, scrollTop / Math.max(1, height * 0.18));
}
