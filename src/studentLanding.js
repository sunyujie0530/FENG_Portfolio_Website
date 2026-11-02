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

export const CD_ORBIT_DIAMETER = .19844;
export const CD_ORBIT_PERSPECTIVE = 1.2;
export const CD_ORBIT_ELEVATION = 50;
export const CD_ORBIT_VERTICAL_SCALE = .86;

export function cdOrbitPosition(index, count, phase = 0) {
  // Half-step phase puts a pair of discs at the front and another pair at the back.
  const angle = -Math.PI / 2 - Math.PI / Math.max(1, count) + index * Math.PI * 2 / Math.max(1, count) + phase;
  const yaw = -90 - angle * 180 / Math.PI;
  const x = .47 * Math.cos(angle);
  const z = .47 * Math.sin(angle);
  // Continuous radial lean avoids a plane/texture flip at either side of the ring.
  return { x, z, yaw, lean:10 * Math.cos(yaw * Math.PI / 180) };
}

export function cdIntroMarkup(works) {
  return `<section class="home-cd-intro" aria-labelledby="home-cd-title" inert>
    <div class="cd-orbit-stage" style="--orbit-disc-size:${CD_ORBIT_DIAMETER * 100}%;--orbit-elevation:${-CD_ORBIT_ELEVATION}deg;--orbit-perspective:${CD_ORBIT_PERSPECTIVE};--orbit-vertical-scale:${CD_ORBIT_VERTICAL_SCALE}"><div class="cd-orbit-lens"><nav class="cd-orbit" aria-label="学生作品光盘">${works.map((work, index) => {
      const p = cdOrbitPosition(index, works.length);
      return `<a class="cd-orbit-link" href="/works/${work.id}" aria-label="查看作品：${work.title}" style="--orbit-x:${p.x};--orbit-z:${p.z};--orbit-yaw:${p.yaw}deg;--orbit-lean:${p.lean}deg">
        <span class="cd-orbit-face"><img src="${work.cover}" alt="${work.title}" decoding="async"><i></i></span></a>`;
    }).join('')}</nav></div>
    <div class="cd-orbit-copy"><h2 id="home-cd-title">一张 CD，一个作品</h2><p>每张光盘，收录一件学生作品。<br>从游戏、影像到三维与视觉设计，<br>在这里发现创作者的灵感与表达。</p><a class="cd-intro-cta" href="/works">从全部作品开始</a></div></div>
  </section>`;
}

export function homeAboutMarkup(students) {
  const published = students.filter(student => student.tags !== '资料待补充');
  const grades = [...new Set(published.map(student => student.grade.replace('级', '')))].sort();
  return `<section class="home-about" id="home-about" aria-labelledby="home-about-title" inert>
    <div class="home-about-grid">
      <div class="home-about-name"><p class="home-about-guide">网站介绍</p><p>About</p><h2 id="home-about-title">枫门</h2></div>
      <div class="home-about-mentor"><h3>朱小枫老师</h3><p>北京师范大学 艺术与传媒学院</p></div>
      <div class="home-about-cohort"><h3>${published.length}位学生</h3><p>${grades.join('–')}<span>级</span></p></div>
      <div class="home-about-copy"><h3>每一扇柜门背后，是一位创作者；每一张光盘里，是一件作品。</h3><p>你可以从学生出发，了解他们的创作与个性，也可以直接浏览全部作品，发现不同方向的探索与表达。</p></div>
    </div>
    <footer class="home-footer"><a class="home-footer-brand" href="/" aria-label="FENG 首页">FENG<span>学生作品集</span></a><p>持续收录，让创作被看见。</p><div><span>© 2026 FENG</span><button id="home-back-top" type="button">返回顶部 ↑</button></div></footer>
  </section>`;
}

export function initStudentLanding(landing) {
  const title = [...landing.querySelectorAll('h1 span')];
  const subtitle = [...landing.querySelectorAll('.landing-summary span')];
  const start = landing.querySelector('#student-start');
  const heading = landing.querySelector('.landing-heading');
  const worksLink = landing.querySelector('.landing-works-link');
  const cdIntro = landing.querySelector('.home-cd-intro');
  const about = landing.querySelector('.home-about');
  const orbitLinks = [...cdIntro.querySelectorAll('.cd-orbit-link')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false;
  let savedScroll = 0;
  let frame = 0;
  let focusPreview = false;
  let previewStarted = false;
  let orbitFrame = 0;
  let orbitTime = 0;
  let orbitPhase = 0;
  const stopOrbit = () => {
    cancelAnimationFrame(orbitFrame);
    orbitFrame = 0;
    orbitTime = 0;
  };
  const animateOrbit = (time) => {
    if (!active || previewStarted || document.hidden || reducedMotion.matches || cdIntro.inert) {
      stopOrbit();
      return;
    }
    const elapsed = orbitTime ? Math.min(time - orbitTime, 50) : 0;
    orbitTime = time;
    if (!cdIntro.matches(':focus-within') && !orbitLinks.some(link => link.matches(':hover'))) {
      orbitPhase = (orbitPhase + elapsed * Math.PI * 2 / 60000) % (Math.PI * 2);
      orbitLinks.forEach((link, index) => {
        const p = cdOrbitPosition(index, orbitLinks.length, orbitPhase);
        link.style.setProperty('--orbit-x', p.x);
        link.style.setProperty('--orbit-z', p.z);
        link.style.setProperty('--orbit-yaw', `${p.yaw}deg`);
        link.style.setProperty('--orbit-lean', `${p.lean}deg`);
      });
    }
    orbitFrame = requestAnimationFrame(animateOrbit);
  };
  const syncOrbit = () => {
    if (active && !previewStarted && !cdIntro.inert && !document.hidden && !reducedMotion.matches) {
      if (!orbitFrame) orbitFrame = requestAnimationFrame(animateOrbit);
    } else stopOrbit();
  };
  const paint = () => {
    frame = 0;
    if (!active || document.body.classList.contains('is-locker-focused')) return;
    document.body.classList.toggle('is-student-directory', previewStarted);
    savedScroll = previewStarted ? 0 : window.scrollY;
    const scrollProgress = landingFrame(innerWidth, innerHeight, savedScroll).progress;
    // Scrolling explores the CD introduction; only the button enters the directory.
    const f = landingFrame(innerWidth, innerHeight, previewStarted ? innerHeight : 0);
    landing.dataset.directory = String(previewStarted);
    landing.style.setProperty('--home-hero-y', `${previewStarted ? 0 : -savedScroll}px`);
    landing.style.setProperty('--home-cd-y', `${innerHeight - savedScroll}px`);
    about.hidden = previewStarted;
    about.inert = previewStarted || savedScroll < innerHeight;
    landing.style.setProperty('--home-about-y', `${innerHeight * 2 - savedScroll}px`);
    landing.style.setProperty('--home-about-clip', `${Math.max(0, innerHeight + about.offsetHeight - savedScroll)}px`);
    document.body.style.setProperty('--home-about-height', `${about.offsetHeight}px`);
    cdIntro.hidden = previewStarted;
    cdIntro.inert = previewStarted || scrollProgress < .8 || savedScroll >= innerHeight * 2 - (innerWidth < 600 ? 64 : 78);
    heading.inert = !previewStarted && scrollProgress > .2;
    syncOrbit();
    landing.querySelector('.locker-access').inert = !previewStarted && scrollProgress > .1;
    document.body.classList.toggle('is-home-cd', !previewStarted && scrollProgress > .98);
    landing.style.setProperty('--landing-progress', f.progress);
    document.body.style.setProperty('--landing-cabinet-y', `${f.cabinetY - (previewStarted ? 0 : savedScroll)}px`);
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
  document.addEventListener('visibilitychange', syncOrbit);
  reducedMotion.addEventListener('change', syncOrbit);
  start.addEventListener('click', () => {
    if (!previewStarted) history.pushState({ ...history.state, fengDirectory: true }, '', '/students');
    previewStarted = true;
    start.dataset.started = 'true';
    focusPreview = true;
    paint();
    window.dispatchEvent(new Event('browse-landing-change'));
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  const returnHome = () => {
    if (!active) return;
    if (previewStarted) history.pushState({ ...history.state, fengDirectory: false }, '', '/');
    previewStarted = false;
    focusPreview = false;
    start.dataset.started = 'false';
    savedScroll = 0;
    window.dispatchEvent(new Event('browse-overview'));
    window.scrollTo({ top: 0, behavior: 'instant' });
    paint();
    window.dispatchEvent(new Event('browse-landing-change'));
    start.focus({ preventScroll: true });
  };
  window.addEventListener('browse-home', returnHome);
  window.addEventListener('browse-about', () => {
    if (!active || previewStarted) return;
    window.scrollTo({ top: innerHeight * 2, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });
  landing.querySelector('#home-back-top').addEventListener('click', () => {
    if (location.hash === '#about') history.replaceState({ ...history.state }, '', '/');
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    start.focus({ preventScroll: true });
  });
  return (enabled) => {
    active = enabled;
    if (enabled) {
      const directory = location.pathname === '/students';
      if (directory !== previewStarted) savedScroll = 0;
      previewStarted = directory;
      start.dataset.started = String(directory);
      if (!directory) window.dispatchEvent(new Event('browse-overview'));
    }
    if (!enabled) focusPreview = false;
    if (!enabled) stopOrbit();
    document.body.classList.toggle('is-student-home', enabled);
    document.body.classList.toggle('is-student-directory', enabled && previewStarted);
    if (!enabled) document.body.classList.remove('is-home-cd');
    window.scrollTo({ top: enabled && !previewStarted ? savedScroll : 0, behavior: 'instant' });
    if (enabled) paint();
  };
}
