export function landingFrame(width, height, scroll) {
  const progress = Math.min(1, Math.max(0, scroll / Math.max(1, height)));
  const compact = width < 700;
  const mix = (a, b) => a + (b - a) * progress;
  return {
    progress,
    fontSize: mix(compact ? 32 : Math.min(84, width * .041), compact ? 26 : Math.min(58, width * .029)),
    titleY: mix(compact ? height * .22 : height * .23, compact ? 102 : height * .14),
    subtitleY: mix(compact ? height * .36 : height * .345, compact ? 190 : height * .30),
    subtitleSize: mix(compact ? 13 : Math.min(28, width * .016), compact ? 12 : Math.min(18, width * .01)),
    cabinetY: mix(height * (compact ? .08 : .17), height * .01),
    compact,
  };
}

export const showWorksEntry = (started, progress) => started && progress >= .9;

export function initStudentLanding(landing) {
  const title = [...landing.querySelectorAll('h1 span')];
  const subtitle = [...landing.querySelectorAll('.landing-summary span')];
  const start = landing.querySelector('#student-start');
  const worksLink = landing.querySelector('.landing-works-link');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false;
  let savedScroll = 0;
  let frame = 0;
  let focusPreview = false;
  let previewStarted = false;
  const paint = () => {
    frame = 0;
    if (!active || document.body.classList.contains('is-locker-focused')) return;
    savedScroll = window.scrollY;
    const f = landingFrame(innerWidth, innerHeight, savedScroll);
    landing.style.setProperty('--landing-progress', f.progress);
    document.body.style.setProperty('--landing-cabinet-y', `${f.cabinetY}px`);
    title.forEach((part) => { part.style.fontSize = `${f.fontSize}px`; });
    subtitle.forEach((part) => { part.style.fontSize = `${f.subtitleSize}px`; });
    const positionLines = (parts, y, lineHeight, split) => {
      const total = parts.reduce((sum, part) => sum + part.offsetWidth, 0);
      let offset = 0;
      parts.forEach((part, index) => {
        const startX = split ? (innerWidth - part.offsetWidth) / 2 : (innerWidth - total) / 2 + offset;
        const endX = innerWidth * .04;
        part.style.left = `${startX + (endX - startX) * f.progress}px`;
        const startY = split ? index * lineHeight : 0;
        part.style.top = `${y + startY + (index * lineHeight - startY) * f.progress}px`;
        offset += part.offsetWidth;
      });
    };
    positionLines(title, f.titleY, f.fontSize * 1.35, f.compact);
    positionLines(subtitle, f.subtitleY, f.subtitleSize * 1.7, f.compact);
    worksLink.style.top = `${f.subtitleY + f.subtitleSize * 3.4 + 14}px`;
    worksLink.hidden = !showWorksEntry(previewStarted, f.progress);
    worksLink.inert = f.progress < .9;
    const picker = landing.querySelector('.grade-picker');
    picker.inert = f.progress < .9;
    start.hidden = f.progress > .98;
    start.tabIndex = f.progress > .35 ? -1 : 0;
    start.style.pointerEvents = f.progress > .35 ? 'none' : 'auto';
    if (focusPreview && start.hidden) {
      picker.querySelector('[aria-pressed="true"]').focus({ preventScroll: true });
      focusPreview = false;
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  start.addEventListener('click', () => {
    previewStarted = true;
    start.dataset.started = 'true';
    focusPreview = true;
    window.scrollTo({ top: innerHeight, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });
  return (enabled) => {
    active = enabled;
    if (!enabled) focusPreview = false;
    document.body.classList.toggle('is-student-home', enabled);
    window.scrollTo({ top: enabled ? savedScroll : 0, behavior: 'instant' });
    if (enabled) paint();
  };
}
