import './browse.css';
import { createWorkDetail } from './workDetail.js';
import { createWrongPlaneDetail } from './wrongPlaneDetail.js';
import { createBcwDetail } from './bcwDetail.js';
import { createBarbarianDetail } from './barbarianDetail.js';
import { createPantheonDetail } from './pantheonDetail.js';
import { createVelvetDetail } from './velvetDetail.js';
import { createStrideDetail } from './strideDetail.js';
import { createBeakerDetail } from './beakerDetail.js';
import { createShiDaoDetail } from './shiDaoDetail.js';
import { createSlimeDetail } from './slimeDetail.js';
import { mountDiscRoom } from './discRoom.js';

export const STUDENTS = [
  { name: '王文睿', en: 'WANG WENRUI', color: '#6d76ac', grade: '2024级', bio: '以空间转换与双人协作为切入点，探索游戏机制和玩家之间的关系。', tags: '游戏设计 / 交互体验' },
  { name: '陈嘉伟', en: 'CHEN JIAWEI', color: '#ab7049', grade: '2024级', bio: '通过功能游戏与合作体验，探索传统文化和互动叙事的表达。', tags: '功能游戏 / 游戏策划' },
  { name: '李若晗', en: 'LI RUOHAN', color: '#47767d', grade: '2024级', bio: '以 AI 影像和像素艺术，讲述关于选择与成长的故事。', tags: 'AIGC / 动画影像' },
  { name: '王文骥', en: 'WANG WENJI', color: '#8b61a3', grade: '2025级', bio: '从奇幻角色雕刻到魔法饮品店，探索角色、造型与游戏世界。', tags: '角色建模 / 游戏设计' },
  { name: '孙玉洁', en: 'SUN YUJIE', color: '#638251', grade: '2025级', bio: '借助数字场景与游戏机制，探索传统文化、公共空间与互动体验。', tags: '数字场景 / 文化叙事' },
  { name: '杨沂锟', en: 'YANG YIKUN', color: '#547ca1', grade: '2025级', bio: '将音乐变成关卡的时间标尺，探索节奏、空间与动作的联动。', tags: '游戏设计 / 节奏交互' },
  { name: '07号学生', en: 'STUDENT 07', color: '#9c7e55', grade: '2024级', bio: '学生资料与作品关联待补充。', tags: '资料待补充' },
  { name: '08号学生', en: 'STUDENT 08', color: '#857d97', grade: '2024级', bio: '学生资料与作品关联待补充。', tags: '资料待补充' },
];

export const WORKS = [
  { id: 'wrong-plane', title: 'Wrong Plane', kind: 'game', authors: [0], cover: '/assets/works/wrong-plane.png', summary: '在 2D 与 3D 之间转换视角，寻找通往下一关的路径。', factory: createWrongPlaneDetail },
  { id: 'clay-doll', title: '泥人张 · 指尖塑梦', kind: 'game', authors: [1], cover: '/assets/works/clay-doll.jpg', summary: '通过沉浸式互动，体验泥人张的制作与民间艺术文化。', factory: createWorkDetail },
  { id: 'barbarian', title: '野蛮人战士', kind: 'model', authors: [3], cover: '/assets/works/barbarian.jpg', summary: '以夸张比例与鲜明轮廓，塑造欧美卡通风格的奇幻战士。', factory: createBarbarianDetail },
  { id: 'blind-can-walk', title: 'Blind Can Walk', kind: 'game', authors: [0, 1], cover: '/assets/works/bcw3.jpg', summary: 'PC 与 VR 玩家互补能力，在双人合作中共同越过障碍。', factory: createBcwDetail },
  { id: 'pantheon', title: '万神殿', kind: 'game', authors: [4], cover: '/assets/works/pantheon.jpg', summary: '在重建与取舍中，体验公共空间、权力与个体之间的关系。', factory: createPantheonDetail },
  { id: 'velvet-garden', title: '绒花数字花园', kind: 'scene', authors: [4], cover: '/assets/works/fluff-flowers.jpg', summary: '以数字造景转译绒花技艺与传统纹样，让非遗融入虚拟花园。', factory: createVelvetDetail },
  { id: 'stride', title: '迈步', kind: 'video', authors: [2], cover: '/assets/works/stride/front.jpg', summary: '写实影像与像素世界交错，用 AIGC 动画讲述人生选择。', factory: createStrideDetail },
  { id: 'beaker-crow', title: '烧杯与鸦榨', kind: 'game', authors: [3], cover: '/assets/works/beaker-crow/front.png', summary: '与魔女和乌鸦一起，经营一家限时接单的魔法饮品店。', factory: createBeakerDetail },
  { id: 'shi-dao', title: '屎到临头', kind: 'game', authors: [], cover: '/assets/works/shi-dao/front.jpg', summary: '以 3D 黏土风格呈现人类与狗狗的非对称欢乐对抗。', factory: createShiDaoDetail },
  { id: 'slime-runner', title: 'SLIME RUNNER', kind: 'game', authors: [5], cover: '/assets/works/slime-runner/scene-1.png', summary: '跟随音乐节拍，用短跳、长跳与滑翔穿越横版平台关卡。', factory: createSlimeDetail },
];

const kinds = { all: '全部', game: '游戏设计', model: '角色建模', scene: '数字场景', video: '动画影像' };
const authorText = (work) => work.authors.map((i) => STUDENTS[i].name).join(' / ') || '作者待补充';
const colorOf = (work) => STUDENTS[work.authors[0]]?.color || '#76746d';
const authorLinks = (work) => work.authors.map((i) => `<a class="author-link" style="--author:${STUDENTS[i].color}" href="/students/${i + 1}"><i></i>${STUDENTS[i].name}</a>`).join('') || '<span class="muted">作者待补充</span>';

function card(work) {
  return `<article class="project-card" style="--author:${colorOf(work)}">
    <a class="project-cover" href="/works/${work.id}" aria-label="查看${work.title}作品详情"><img src="${work.cover}" alt="${work.title}封面" loading="lazy"><span>查看作品 ↗</span></a>
    <div class="project-meta"><span>${kinds[work.kind]}</span><span>${String(WORKS.indexOf(work) + 1).padStart(2, '0')}</span></div>
    <h2><a href="/works/${work.id}">${work.title}</a></h2><div class="project-authors">${authorLinks(work)}</div><p>${work.summary}</p>
  </article>`;
}

export function initBrowse(showScene) {
  document.body.classList.add('browse-preview');
  const nav = document.querySelector('#top-nav');
  nav.insertAdjacentHTML('afterbegin', '<a class="brand" href="/students" aria-label="FENG 首页">FENG<span>学生作品集</span></a>');
  document.querySelector('#nav-submit').textContent = '作品投稿 ↗';
  const root = document.createElement('main');
  root.id = 'browse';
  root.setAttribute('aria-label', '作品集浏览');
  document.body.append(root);
  const landing = document.createElement('section');
  landing.className = 'student-landing';
  landing.innerHTML = `<div class="landing-heading"><p class="eyebrow">FENG / STUDENT DIRECTORY</p><h1>八扇柜门，<br>各自成世界<span>。</span></h1><p>从一个人出发，认识一组创作。<br>点击柜子打开柜门，使用左右箭头切换浏览。</p><a class="text-link" href="/works">也可以从全部作品开始 ↗</a></div>
    <div class="grade-picker"><p class="eyebrow">按入学年级浏览</p><div class="kind-tabs" role="group" aria-label="学生年级筛选"><button type="button" data-grade="all" aria-pressed="true">全部</button><button type="button" data-grade="2024级" aria-pressed="false">2024级</button><button type="button" data-grade="2025级" aria-pressed="false">2025级</button></div></div>
    <nav class="locker-access" aria-label="键盘选择学生">${STUDENTS.map((s, i) => `<a href="/students/${i + 1}" data-student="${i}">${String(i + 1).padStart(2, '0')} · ${s.name} · ${s.grade}</a>`).join('')}</nav>`;
  document.body.append(landing);
  let grade = 'all';
  const selectGrade = (value) => {
    grade = value;
    const indices = STUDENTS.flatMap((student, index) => grade === 'all' || student.grade === grade ? [index] : []);
    landing.querySelectorAll('[data-grade]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.grade === grade)));
    landing.querySelectorAll('[data-student]').forEach((link) => { link.hidden = !indices.includes(Number(link.dataset.student)); });
    window.dispatchEvent(new CustomEvent('browse-grade', { detail: indices }));
  };
  landing.addEventListener('click', (event) => {
    const button = event.target.closest('[data-grade]');
    if (button) selectGrade(button.dataset.grade);
  });
  selectGrade(grade);
  let current = '';
  let filter = 'all';
  let search = '';
  let detailOrigin = '/works';
  let listScroll = 0;
  let restoreFocus = '';
  let lockerReturn = null;
  const discStates = new Map();
  let disposeDiscRoom = () => {};
  const move = (path) => {
    if (path === location.pathname) { root.scrollTop = 0; if (path === '/students') window.dispatchEvent(new Event('browse-overview')); return; }
    if (location.pathname === '/works') listScroll = root.scrollTop;
    if (path.startsWith('/works/')) {
      detailOrigin = location.pathname.startsWith('/students/') ? location.pathname : '/works';
      restoreFocus = path;
    }
    history.pushState({}, '', path);
    render();
  };
  const crumbs = (parts) => `<nav class="breadcrumbs" aria-label="当前位置"><a href="/students">首页</a>${parts.map(([label, href]) => `<span>/</span>${href ? `<a href="${href}">${label}</a>` : `<span aria-current="page">${label}</span>`}`).join('')}</nav>`;
  const renderResults = () => {
    const found = WORKS.filter((work) => (filter === 'all' || work.kind === filter) && `${work.title} ${authorText(work)} ${work.summary}`.toLowerCase().includes(search.toLowerCase()));
    root.querySelector('#result-count').textContent = `${found.length} 件作品`;
    root.querySelector('#project-results').innerHTML = found.length ? found.map(card).join('') : '<div class="empty"><h2>还没有匹配的作品</h2><p>试试其他关键词，或清除筛选。</p><button type="button" id="clear-filters">清除筛选</button></div>';
    root.querySelectorAll('[data-kind]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.kind === filter)));
  };
  const render = () => {
    disposeDiscRoom();
    disposeDiscRoom = () => {};
    root.querySelectorAll('video').forEach((video) => video.pause());
    const path = location.pathname;
    const studentMatch = path.match(/^\/students\/(\d+)$/);
    const discMatch = path.match(/^\/students\/([1-8])\/discs$/);
    const discStudentIndex = discMatch ? Number(discMatch[1]) - 1 : -1;
    const work = WORKS.find((w) => path === `/works/${w.id}`);
    const studentIndex = studentMatch ? Number(studentMatch[1]) - 1 : -1;
    const student = STUDENTS[studentIndex];
    const mode = path === '/submit' ? 'submit' : path === '/about' ? 'about' : path === '/students' ? 'students' : 'content';
    showScene(mode);
    document.body.classList.toggle('browse-content', mode === 'content');
    landing.hidden = mode !== 'students';
    root.hidden = mode !== 'content';
    document.querySelector('#stage').setAttribute('aria-hidden', String(mode === 'content'));
    const activeNav = mode === 'submit' ? 'nav-submit' : mode === 'about' ? 'nav-about' : (student || discMatch || mode === 'students') ? 'nav-lockers' : 'nav-works';
    nav.querySelectorAll('button').forEach((button) => {
      if (button.id === activeNav) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    root.style.setProperty('--author', student?.color || (work ? colorOf(work) : '#638251'));
    if (discMatch) {
      root.innerHTML = '';
      lockerReturn = discStudentIndex;
      if (!discStates.has(discStudentIndex)) discStates.set(discStudentIndex, {});
      disposeDiscRoom = mountDiscRoom({ host: root, student: STUDENTS[discStudentIndex], studentIndex: discStudentIndex, students: STUDENTS, works: WORKS, state: discStates.get(discStudentIndex), onOpen: (selected) => move(`/works/${selected.id}`), onBack: () => move('/students') });
    } else if (student) {
      if (grade !== 'all' && grade !== student.grade) selectGrade(student.grade);
      const projects = WORKS.filter((w) => w.authors.includes(studentIndex));
      root.innerHTML = `${crumbs([['学生', '/students'], [student.name]])}<a class="back-link" href="/students">← 返回学生展厅</a>
        <header class="student-profile"><div class="profile-number">${String(studentIndex + 1).padStart(2, '0')}<span>FENG STUDENT</span></div><div><p class="eyebrow">${student.en}</p><h1 tabindex="-1">${student.name}</h1><p class="profile-grade">${student.grade || 'FENG 创作者'}</p><p class="profile-bio">${student.bio}</p><span class="profile-tag">${student.tags}</span></div><div class="profile-stat"><strong>${projects.length.toString().padStart(2, '0')}</strong><span>已收录作品</span></div></header>
        <div class="section-heading"><h2>作品 <small>SELECTED WORKS</small></h2><a href="/works">浏览全部作品 ↗</a></div><div class="project-grid">${projects.length ? projects.map(card).join('') : '<p class="empty">作品正在整理中，可先浏览其他同学的创作。</p>'}</div><p class="editorial-note">创作方向简介根据已收录作品整理。</p>`;
    } else if (work) {
      const back = detailOrigin.startsWith('/students/') ? detailOrigin : '/works';
      const backLabel = back === '/works' ? '全部作品' : `${STUDENTS[Number(back.split('/')[2]) - 1].name}的${back.endsWith('/discs') ? '光盘库' : '主页'}`;
      const source = work.factory(() => {});
      const copy = source.querySelector('.work-detail__copy');
      const media = source.querySelector('.bcw-media') || source.querySelector('.work-detail__body');
      const images = media ? [...media.querySelectorAll('img')].filter((img) => !img.classList.contains('work-detail__poster')) : [];
      const video = media?.querySelector('video');
      const trail = back === '/works' ? [['全部作品', '/works'], [work.title]] : [['学生', '/students'], [STUDENTS[Number(back.split('/')[2]) - 1].name, back], [work.title]];
      root.innerHTML = `${crumbs(trail)}<a class="back-link" href="${back}">← 返回${backLabel}</a>
        <article class="review-detail"><header class="detail-heading"><div><p class="eyebrow">${kinds[work.kind]} / PROJECT ${String(WORKS.indexOf(work) + 1).padStart(2, '0')}</p><h1 tabindex="-1">${work.title}</h1><p class="detail-summary">${work.summary}</p><div class="project-authors">${authorLinks(work)}</div></div><a class="primary-link" href="#work-media">查看图像${video ? '与视频' : ''} ↓</a></header>
        <img class="detail-cover" src="${work.cover}" alt="${work.title}主视觉"><div class="detail-content"><aside><p class="eyebrow">PROJECT INFORMATION</p><dl><dt>作品名称</dt><dd>${work.title}</dd><dt>创作类型</dt><dd>${kinds[work.kind]}</dd><dt>创作者</dt><dd>${authorLinks(work)}</dd></dl></aside><section><h2>作品简介</h2><div class="detail-copy">${copy?.innerHTML || work.summary}</div><h2 id="work-media">图像${video ? '与视频' : ''}</h2><div class="detail-gallery">${images.map((img) => img.outerHTML).join('')}</div>${video ? video.outerHTML : ''}</section></div></article>`;
      source.remove();
    } else if (mode === 'content') {
      root.innerHTML = `${crumbs([['全部作品']])}<header class="collection-heading"><div><p class="eyebrow">FENG / WORK INDEX</p><h1 tabindex="-1">创作，正在发生<span>。</span></h1><p>游戏、角色、场景与影像。找到你感兴趣的作品，直接进入创作现场。</p></div><span class="collection-total">${WORKS.length.toString().padStart(2, '0')}<small>件已收录作品</small></span></header>
        <div class="collection-tools"><div class="kind-tabs" role="group" aria-label="按作品类型筛选">${Object.entries(kinds).map(([key, label]) => `<button type="button" data-kind="${key}" aria-pressed="${key === filter}">${label}</button>`).join('')}</div><label class="search-field"><span>搜索作品或作者</span><input type="search" id="project-search" placeholder="作品名称 / 作者" aria-label="搜索作品或作者"></label></div><p class="result-count" id="result-count" aria-live="polite"></p><div class="project-grid" id="project-results"></div>`;
      root.querySelector('#project-search').value = search;
      renderResults();
    }
    document.title = `${discMatch ? `${STUDENTS[discStudentIndex].name}的作品光盘库` : student?.name || work?.title || (mode === 'students' ? '学生展厅' : mode === 'about' ? '关于' : mode === 'submit' ? '作品投稿' : '全部作品')} · FENG`;
    root.scrollTop = path === '/works' ? listScroll : 0;
    if (current) {
      const focusTarget = path === '/works' && restoreFocus ? root.querySelector(`a[href="${restoreFocus}"]`) : root.querySelector('h1');
      focusTarget?.focus({ preventScroll: true });
      if (path === '/students') landing.querySelector('[data-grade][aria-pressed="true"]')?.focus({ preventScroll: true });
    }
    current = path;
    if (mode === 'students' && lockerReturn !== null) {
      const index = lockerReturn;
      lockerReturn = null;
      window.dispatchEvent(new CustomEvent('browse-open-locker', { detail: index }));
    }
  };
  nav.addEventListener('click', (event) => {
    const paths = { 'nav-lockers': '/students', 'nav-works': '/works', 'nav-submit': '/submit', 'nav-about': '/about' };
    const path = paths[event.target.closest('button')?.id];
    if (!path) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    move(path);
  }, true);
  document.querySelector('#close-submit').addEventListener('click', (event) => { event.stopImmediatePropagation(); move('/students'); }, true);
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin) return;
    if (url.hash) {
      if (url.pathname === location.pathname) { event.preventDefault(); root.querySelector(url.hash)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }
      return;
    }
    if (!/^\/(students|works)(\/|$)/.test(url.pathname)) return;
    event.preventDefault();
    if (link.closest('.locker-access')) {
      window.dispatchEvent(new CustomEvent('browse-open-locker', { detail: Number(link.dataset.student) }));
      return;
    }
    if (link.id === 'locker-student-link') lockerReturn = Number(url.pathname.split('/')[2]) - 1;
    move(url.pathname);
  });
  root.addEventListener('click', (event) => {
    const kind = event.target.closest('[data-kind]');
    if (kind) { filter = kind.dataset.kind; renderResults(); }
    if (event.target.closest('#clear-filters')) { filter = 'all'; search = ''; root.querySelector('#project-search').value = ''; renderResults(); }
  });
  root.addEventListener('input', (event) => { if (event.target.id === 'project-search') { search = event.target.value.trim(); renderResults(); } });
  window.addEventListener('browse-student', ({ detail }) => {
    lockerReturn = detail;
    move(`/students/${detail + 1}`);
  });
  window.addEventListener('browse-discs', ({ detail }) => {
    lockerReturn = detail;
    move(`/students/${detail + 1}/discs`);
  });
  window.addEventListener('popstate', render);
  window.addEventListener('keydown', (event) => {
    if (document.body.classList.contains('is-disc-room')) return;
    if (event.key !== 'Escape' || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (location.pathname.startsWith('/works/')) move(detailOrigin);
    else if (location.pathname.startsWith('/students/')) move('/students');
  });
  if (!/^\/(students(\/[1-8](\/discs)?)?|works(\/[^/]+)?|submit|about)$/.test(location.pathname)) history.replaceState({}, '', '/students');
  render();
}
