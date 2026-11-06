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

export function detailDiscScreenPose(width, height, scroll = 0) {
  const mobileRadius=Math.min(height*.17,width*.35);
  const start = width < 700
    ? { x:width / 2, y:170+mobileRadius, radius:mobileRadius }
    : { x:width * .88, y:height / 2, radius:Math.min(height*.48,width*.32) };
  const progress=Math.max(0,Math.min(1,scroll));
  const radius=Math.min(width*.05,height*.075);
  const endY=(width<700?170:102)+radius;
  return {x:start.x+(width*.905-start.x)*progress,y:start.y+(endY-start.y)*progress,radius:start.radius+(radius-start.radius)*progress};
}
