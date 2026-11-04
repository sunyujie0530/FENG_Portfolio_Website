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
import { initStudentLanding, cdIntroMarkup, homeAboutMarkup } from './studentLanding.js';
import { showWorkDisc, showPublishedWorkDisc } from './worksDiscs.js';
import { navigationGuide } from './navigationGuide.js';
import { backendConfigured, publishedCatalog } from './submissionBackend.js';
import { publishedWork, escapeHtml, syncPublishedStudents, studentPath } from './submissionData.js';
import { creatorView } from './publishedViews.js';
import { mountMyWorks } from './myWorks.js';
import { mountReview } from './submissionUi.js';

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
const authorText = (work) => work.authorName || work.authors.map((i) => STUDENTS[i].name).join(' / ') || '作者待补充';
const colorOf = (work) => STUDENTS[work.authors[0]]?.color || '#76746d';
const authorLinks = (work) => work.uploaded ? `<a class="author-link" href="/creators/${escapeHtml(work.creatorId)}">${escapeHtml(work.authorName)}</a>` : work.authors.map((i) => `<a class="author-link" style="--author:${STUDENTS[i].color}" href="/students/${i + 1}"><i></i>${STUDENTS[i].name}</a>`).join('') || '<span class="muted">作者待补充</span>';

function card(work) {
  const title = escapeHtml(work.title), cover = escapeHtml(work.cover), id = escapeHtml(work.id);
  return `<article class="project-card" style="--author:${colorOf(work)}">
    <a class="project-cover" href="/works/${id}" aria-label="查看${title}作品详情"><i class="record-disc" aria-hidden="true"></i><img src="${cover}" alt="${title}封面" loading="lazy"></a>
    <div class="project-meta"><span>${kinds[work.kind]}</span></div>
    <h2><a href="/works/${id}">${title}</a></h2><div class="project-authors">${authorLinks(work)}</div>
  </article>`;
}

export function initBrowse(showScene) {
  document.body.classList.add('browse-preview');
  const nav = document.querySelector('#top-nav');
  nav.querySelector('#nav-about').hidden = true;
  nav.insertAdjacentHTML('afterbegin', '<a class="brand" href="/" aria-label="FENG 首页">FENG<span>学生作品集</span></a><button type="button" id="nav-home">首页</button>');
  const submitButton = document.querySelector('#nav-submit');
  submitButton.innerHTML = '<img src="/assets/upload-folder.png" alt="" width="88" height="88"><span>作品上传</span>';
  submitButton.setAttribute('aria-label', '作品上传');
  submitButton.title = '上传你的作品';
  const root = document.createElement('main');
  root.id = 'browse';
  root.setAttribute('aria-label', '作品集浏览');
  document.body.append(root);
  const pageGuide = document.createElement('p');
  pageGuide.id = 'page-location';
  pageGuide.className = 'page-guide';
  pageGuide.setAttribute('aria-label', '当前页面导览');
  document.body.append(pageGuide);
  const landing = document.createElement('section');
  landing.className = 'student-landing';
  landing.innerHTML = `<div class="landing-heading"><h1><span>每一扇柜门，</span><span>都是一位创作者。</span></h1><p class="landing-summary"><span>从一个人出发，认识一组创作。</span><span>点击柜门，探索他们的作品与创作故事。</span></p><button type="button" id="student-start">开始预览</button><a class="text-link landing-works-link" href="/works" hidden>从全部作品开始 ↗</a></div>
    <div class="grade-picker"><p class="eyebrow">按入学年级浏览</p><div class="kind-tabs" role="group" aria-label="学生年级筛选"><button type="button" data-grade="all" aria-pressed="true">全部</button><button type="button" data-grade="2024级" aria-pressed="false">2024级</button><button type="button" data-grade="2025级" aria-pressed="false">2025级</button></div></div>
    <nav class="locker-access" aria-label="键盘选择学生">${STUDENTS.map((s, i) => `<a href="/students/${i + 1}" data-student="${i}">${String(i + 1).padStart(2, '0')} · ${s.name} · ${s.grade}</a>`).join('')}</nav>${cdIntroMarkup([...WORKS,
      {...WORKS[0], cover:'/assets/works/wrong-plane/scene-1.png'},
      {...WORKS[1], cover:'/assets/works/clay-doll/visual-2.png'},
    ])}${homeAboutMarkup(STUDENTS)}`;
  document.body.append(landing);
  landing.querySelector('.landing-heading').insertAdjacentHTML('afterbegin', '<p class="eyebrow page-guide landing-page-guide" hidden>学生 / 柜子展厅</p>');
  landing.insertAdjacentHTML('beforeend', '<p class="scroll-more home-scroll-more">滑动查看更多</p>');
  const setLandingActive = initStudentLanding(landing);
  let grade = 'all';
  const selectGrade = (value) => {
    grade = value;
    const indices = STUDENTS.flatMap((student, index) => student.active !== false && (grade === 'all' || student.grade === grade) ? [index] : []);
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
  let submitOrigin = '/';
  let listScroll = 0;
  let restoreFocus = '';
  let returning = false;
  let lockerContext = { studentIndex: null, card: false };
  let extractingRecord = false;
  const discStates = new Map();
  let disposeDiscRoom = () => {};
  let disposeReview = () => {};
  let disposeMyWorks = () => {};
  let catalogLoading = backendConfigured;
  let catalogError = '';
  let catalogVersion = 0;
  const move = (path, { replace = false, state = {} } = {}) => {
    if (path === '/about') path = '/#about';
    if (path === location.pathname) { root.scrollTop = 0; if (path === '/') window.dispatchEvent(new Event('browse-home')); else if (path === '/students') window.dispatchEvent(new Event('browse-overview')); return; }
    if (location.pathname === '/works') listScroll = root.scrollTop;
    if (location.pathname === '/students') history.replaceState({ ...history.state, lockerIndex: lockerContext.studentIndex }, '', location.href);
    const uploadFlow = ['/submit','/my-works','/review'];
    if (uploadFlow.includes(path)) {
      submitOrigin = uploadFlow.includes(location.pathname)
        ? history.state?.submitOrigin || submitOrigin || '/'
        : location.pathname + location.hash;
    }
    if (path.startsWith('/works/')) {
      if (location.pathname.startsWith('/students/')) detailOrigin = location.pathname;
      else if (location.pathname.startsWith('/creators/')) detailOrigin = location.pathname;
      else if (location.pathname === '/works' || location.pathname === '/') detailOrigin = '/works';
      restoreFocus = path;
    }
    history[replace ? 'replaceState' : 'pushState']({
      from: replace ? history.state?.from : location.pathname + location.hash,
      ...state,
      ...(path.startsWith('/works/') ? { detailOrigin } : {}),
      ...(uploadFlow.includes(path) ? { submitOrigin } : {}),
    }, '', path);
    render();
  };
  const goBack = (path, state = {}) => {
    if (returning) return;
    if (history.state?.from === path) {
      returning = true;
      history.back();
    } else move(path, { replace: true, state });
  };
  const crumbs = (parts) => `<nav class="breadcrumbs" aria-label="当前位置"><a href="/">首页</a>${parts.map(([label, href]) => `<span>/</span>${href ? `<a href="${href}">${label}</a>` : `<span aria-current="page">${label}</span>`}`).join('')}</nav>`;
  const syncPageGuide = () => {
    const path = location.pathname;
    const source = path === '/students' ? landing.querySelector('.page-guide')
      : path === '/submit' ? document.querySelector('#submit-view .page-guide')
      : path === '/about' ? document.querySelector('#about-view .page-guide')
      : path.startsWith('/works/') ? document.querySelector('.work-detail:not([hidden]) .page-guide')
      : root.querySelector('.page-guide');
    pageGuide.textContent = navigationGuide({ path, origin: detailOrigin, ...lockerContext }, STUDENTS, WORKS) ?? source?.textContent ?? '';
    pageGuide.hidden = !pageGuide.textContent;
  };
  const syncLandingNav = () => {
    const home = location.pathname === '/';
    landing.querySelector('.landing-page-guide').hidden = home;
    nav.querySelectorAll('button').forEach(button => {
      if (button.id === (home ? 'nav-home' : 'nav-lockers')) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    document.title = `${home ? '首页' : '学生展厅'} · FENG`;
    syncPageGuide();
  };
  window.addEventListener('browse-landing-change', syncLandingNav);
  window.addEventListener('browse-locker-context', ({ detail }) => {
    lockerContext = { studentIndex: detail.index, card: detail.card };
    if (location.pathname === '/students') history.replaceState({ ...history.state, lockerIndex: detail.index }, '', location.href);
    syncPageGuide();
  });
  const renderResults = () => {
    const found = WORKS.filter((work) => (filter === 'all' || work.kind === filter) && `${work.title} ${authorText(work)} ${work.summary}`.toLowerCase().includes(search.toLowerCase()));
    root.querySelector('#result-count').textContent = `${found.length} 件作品`;
    root.querySelector('#project-results').innerHTML = found.length ? found.map(card).join('') : '<div class="empty"><h2>还没有匹配的作品</h2><p>试试其他关键词，或清除筛选。</p><button type="button" id="clear-filters">清除筛选</button></div>';
    root.querySelectorAll('[data-kind]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.kind === filter)));
  };
  const render = () => {
    returning = false;
    disposeDiscRoom();
    disposeDiscRoom = () => {};
    disposeMyWorks();
    disposeMyWorks = () => {};
    disposeReview();
    disposeReview = () => {};
    if (location.pathname === '/about') history.replaceState({}, '', '/#about');
    root.querySelectorAll('video').forEach((video) => video.pause());
    const path = location.pathname;
    const mineEntry = path === '/submit';
    submitButton.innerHTML = `<img src="/assets/${mineEntry ? 'my-works-folder' : 'upload-folder'}.png" alt="" width="88" height="88"><span>${mineEntry ? '我的作品' : '作品上传'}</span>`;
    submitButton.setAttribute('aria-label',mineEntry ? '我的作品' : '作品上传');
    submitButton.title = mineEntry ? '查看和编辑我上传的作品' : '上传你的作品';
    const returnLocker = path === '/students' ? history.state?.lockerIndex : null;
    if (['/submit','/my-works','/review'].includes(path)) submitOrigin = history.state?.submitOrigin || '/';
    const studentMatch = path.match(/^\/students\/(\d+)$/);
    const creatorMatch = path.match(/^\/creators\/([0-9a-f-]{36})(\/discs)?$/);
    const creatorIndex = creatorMatch ? STUDENTS.findIndex(student => student.creatorId === creatorMatch[1] && student.active) : -1;
    const discMatch = path.match(/^\/students\/(\d+)\/discs$/) || (creatorMatch?.[2] && creatorIndex >= 0 ? [path,String(creatorIndex + 1)] : null);
    const discStudentIndex = discMatch ? Number(discMatch[1]) - 1 : -1;
    const work = WORKS.find((w) => path === `/works/${w.id}`);
    const studentIndex = studentMatch ? Number(studentMatch[1]) - 1 : creatorIndex;
    const student = STUDENTS[studentIndex]?.active !== false ? STUDENTS[studentIndex] : null;
    const mode = path === '/submit' ? 'submit' : path === '/about' ? 'about' : (path === '/' || path === '/students') ? 'students' : 'content';
    showScene(mode);
    document.body.classList.toggle('browse-content', mode === 'content' && !work);
    landing.hidden = mode !== 'students';
    setLandingActive(mode === 'students');
    root.hidden = mode !== 'content' || Boolean(work);
    document.querySelector('#stage').setAttribute('aria-hidden', String(mode === 'content' && !work));
    const activeNav = path === '/' ? 'nav-home' : mode === 'submit' || path === '/review' || path === '/my-works' ? 'nav-submit' : mode === 'about' ? 'nav-about' : (student || discMatch || mode === 'students') ? 'nav-lockers' : 'nav-works';
    nav.querySelectorAll('button').forEach((button) => {
      if (button.id === activeNav) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    root.style.setProperty('--author', student?.color || (work ? colorOf(work) : '#638251'));
    if (path === '/my-works') {
      disposeMyWorks = mountMyWorks(root);
    } else if (path === '/review') {
      disposeReview = mountReview(root);
    } else if ((creatorMatch && !student) || (!work && path.startsWith('/works/submission-'))) {
      const projects = WORKS.filter(work => work.creatorId === creatorMatch?.[1]);
      root.innerHTML = creatorMatch && projects.length ? creatorView(projects,card) : `<h1 tabindex="-1">${catalogLoading ? '正在读取作品…' : catalogError ? '作品暂时无法读取' : '未找到已发布的作品'}</h1><p>${escapeHtml(catalogError || '未审核通过或已下架的投稿不会公开展示。')}</p><a class="back-link" href="/works">← 返回全部作品</a>${catalogError ? '<button type="button" data-reload-catalog>重新读取</button>' : ''}`;
    } else if (discMatch && STUDENTS[discStudentIndex]?.active !== false && STUDENTS[discStudentIndex]) {
      root.innerHTML = '';
      if (!discStates.has(discStudentIndex)) discStates.set(discStudentIndex, {});
      disposeDiscRoom = mountDiscRoom({ host: root, student: STUDENTS[discStudentIndex], studentIndex: discStudentIndex, students: STUDENTS, works: WORKS, state: discStates.get(discStudentIndex), onOpen: (selected) => move(`/works/${selected.id}`), onBack: () => goBack('/students', { lockerIndex: discStudentIndex }) });
    } else if (student) {
      if (grade !== 'all' && grade !== student.grade) selectGrade(student.grade);
      const projects = WORKS.filter((w) => w.authors.includes(studentIndex));
      root.innerHTML = `${crumbs([['学生', '/students'], [escapeHtml(student.name)]])}<a class="back-link" href="/students">← 返回学生展厅</a>
        <header class="student-profile"><div class="profile-number">${String(studentIndex + 1).padStart(2, '0')}<span>FENG STUDENT</span></div><div><p class="eyebrow page-guide">学生 / ${escapeHtml(student.name)}的个人主页</p><h1 tabindex="-1">${escapeHtml(student.name)}</h1><p class="profile-grade">${escapeHtml(student.grade || 'FENG 创作者')}</p><p class="profile-bio">${escapeHtml(student.bio)}</p><span class="profile-tag">${escapeHtml(student.tags)}</span></div><div class="profile-stat"><strong>${projects.length.toString().padStart(2, '0')}</strong><span>已收录作品</span></div></header>
        <div class="section-heading"><h2>作品 <small>SELECTED WORKS</small></h2><a href="${studentPath(student,studentIndex)}/discs">进入作品光盘库 ↗</a></div><div class="project-grid">${projects.length ? projects.map(card).join('') : '<p class="empty">作品正在整理中，可先浏览其他同学的创作。</p>'}</div><p class="editorial-note">创作方向简介根据已收录作品整理。</p>`;
    } else if (work) {
      detailOrigin = history.state?.detailOrigin || '/works';
      const back = /^\/(students\/\d+(\/discs)?|creators\/[0-9a-f-]{36}(\/discs)?)$/.test(detailOrigin) ? detailOrigin : '/works';
      const backLabel = back === '/works' ? '全部作品' : back.startsWith('/creators/') ? `${STUDENTS.find(s => back.includes(s.creatorId))?.name || '作者'}的${back.endsWith('/discs') ? '光盘库' : '主页'}` : `${STUDENTS[Number(back.split('/')[2]) - 1].name}的${back.endsWith('/discs') ? '光盘库' : '主页'}`;
      root.innerHTML = '';
      if (work.uploaded) {
        showPublishedWorkDisc(work, () => goBack(back), backLabel);
      } else {
        showWorkDisc(work.id === 'slime-runner' ? 19 : WORKS.indexOf(work), () => goBack(back), backLabel, work.authors.map(index => STUDENTS[index]));
      }
    } else if (mode === 'content') {
      root.innerHTML = `<header class="collection-heading"><div><p class="eyebrow page-guide">全部作品 / 分类浏览与检索</p><h1 tabindex="-1">创作，正在发生<span>。</span></h1><p>游戏、角色、场景与影像。找到你感兴趣的作品，直接进入创作现场。</p></div><span class="collection-total">${WORKS.length.toString().padStart(2, '0')}<small>件已收录作品</small></span></header>
        <div class="collection-tools"><div class="kind-tabs" role="group" aria-label="按作品类型筛选">${Object.entries(kinds).map(([key, label]) => `<button type="button" data-kind="${key}" aria-pressed="${key === filter}">${label}</button>`).join('')}</div><label class="search-field"><span>搜索作品或作者</span><input type="search" id="project-search" placeholder="作品名称 / 作者" aria-label="搜索作品或作者"></label></div><p class="result-count" id="result-count" aria-live="polite"></p><div class="project-grid" id="project-results"></div>`;
      root.querySelector('#project-search').value = search;
      renderResults();
      if (backendConfigured && (catalogLoading || catalogError)) root.insertAdjacentHTML('afterbegin', `<p class="backend-load-status" role="status">${catalogLoading ? '正在读取新投稿…' : `新投稿读取失败：${escapeHtml(catalogError)} <button type="button" data-reload-catalog>重试</button>`}</p>`);
    }
    document.title = `${path === '/my-works' ? '我的作品' : path === '/review' ? '投稿审核' : creatorMatch && !student ? '创作者作品' : discMatch && STUDENTS[discStudentIndex] ? `${STUDENTS[discStudentIndex].name}的作品光盘库` : student?.name || work?.title || (mode === 'students' ? '学生展厅' : mode === 'about' ? '关于' : mode === 'submit' ? '作品投稿' : '全部作品')} · FENG`;
    if (mode === 'students') syncLandingNav();
    else syncPageGuide();
    root.scrollTop = path === '/works' ? listScroll : 0;
    if (current && !work) {
      const focusTarget = path === '/works' && restoreFocus ? root.querySelector(`a[href="${restoreFocus}"]`) : root.querySelector('h1');
      focusTarget?.focus({ preventScroll: true });
      if (mode === 'students') landing.querySelector(landing.dataset.directory === 'true' ? '[data-grade][aria-pressed="true"]' : '#student-start')?.focus({ preventScroll: true });
    }
    current = path;
    if (path === '/' && location.hash === '#about') window.dispatchEvent(new Event('browse-about'));
    if (Number.isInteger(returnLocker) && STUDENTS[returnLocker]) {
      if (grade !== 'all' && grade !== STUDENTS[returnLocker].grade) selectGrade(STUDENTS[returnLocker].grade);
      window.dispatchEvent(new CustomEvent('browse-open-locker', { detail: returnLocker }));
    }
  };
  nav.addEventListener('click', (event) => {
    const paths = { 'nav-home': '/', 'nav-lockers': '/students', 'nav-works': '/works', 'nav-submit': location.pathname === '/submit' ? '/my-works' : '/submit', 'nav-about': '/about' };
    const path = paths[event.target.closest('button')?.id];
    if (!path) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    move(path);
  }, true);
  const leaveSubmit = event => { event.stopImmediatePropagation(); goBack(submitOrigin); };
  document.querySelector('#close-submit').addEventListener('click', leaveSubmit, true);
  document.querySelector('#submit-back').addEventListener('click', leaveSubmit, true);
  document.addEventListener('click', async (event) => {
    const link = event.target.closest('a');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin) return;
    if (url.hash) {
      if (url.pathname === location.pathname) { event.preventDefault(); root.querySelector(url.hash)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }
      return;
    }
    if (url.pathname !== '/' && !/^\/(students|works|creators)(\/|$)/.test(url.pathname) && !['/submit','/review','/my-works'].includes(url.pathname)) return;
    event.preventDefault();
    const record = link.closest('#project-results .project-card')?.querySelector('.record-disc');
    if (record && url.pathname.startsWith('/works/')) {
      if (extractingRecord) return;
      extractingRecord = true;
      const article = record.closest('.project-card');
      article.classList.add('is-extracting');
      const origin = location.pathname;
      try {
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
          await record.animate([
            { transform: 'translateX(0) rotate(0)' },
            { transform: 'translateX(62%) rotate(12deg)' },
          ], { duration: 580, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' }).finished;
        }
        if (location.pathname === origin && link.isConnected) move(url.pathname);
      } finally {
        article.classList.remove('is-extracting');
        extractingRecord = false;
      }
      return;
    }
    if (link.closest('.locker-access')) {
      window.dispatchEvent(new CustomEvent('browse-open-locker', { detail: Number(link.dataset.student) }));
      return;
    }
    if (link.matches('.back-link') && url.pathname === '/students') {
      goBack('/students', { lockerIndex: STUDENTS.findIndex((s,i) => studentPath(s,i) === location.pathname.replace(/\/discs$/, '')) });
      return;
    }
    move(url.pathname);
  });
  root.addEventListener('click', (event) => {
    if (event.target.closest('[data-reload-catalog]')) refreshCatalog();
    const kind = event.target.closest('[data-kind]');
    if (kind) { filter = kind.dataset.kind; renderResults(); }
    if (event.target.closest('#clear-filters')) { filter = 'all'; search = ''; root.querySelector('#project-search').value = ''; renderResults(); }
  });
  root.addEventListener('input', (event) => { if (event.target.id === 'project-search') { search = event.target.value.trim(); renderResults(); } });
  window.addEventListener('browse-student', ({ detail }) => {
    if (STUDENTS[detail]) move(studentPath(STUDENTS[detail],detail));
  });
  window.addEventListener('browse-discs', ({ detail }) => {
    if (STUDENTS[detail]) move(`${studentPath(STUDENTS[detail],detail)}/discs`);
  });
  window.addEventListener('popstate', render);
  window.addEventListener('keydown', (event) => {
    if (document.body.classList.contains('is-disc-room')) return;
    if (event.key !== 'Escape' || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (location.pathname.startsWith('/works/')) goBack(detailOrigin);
    else if (/^\/(students|creators)\//.test(location.pathname)) goBack('/students', { lockerIndex: STUDENTS.findIndex((s,i) => studentPath(s,i) === location.pathname.replace(/\/discs$/, '')) });
  });
  const refreshCatalog = async () => {
    if (!backendConfigured) return;
    const version = ++catalogVersion;
    catalogLoading = true;
    try {
      const rows = await publishedCatalog();
      if (version !== catalogVersion) return;
      syncPublishedStudents(rows,STUDENTS);
      window.dispatchEvent(new Event('browse-students-change'));
      const active = STUDENTS.filter(student => student.active !== false);
      const grades = [...new Set(active.map(student => student.grade))].sort();
      landing.querySelector('.grade-picker .kind-tabs').innerHTML = ['all',...grades].map(value => `<button type="button" data-grade="${escapeHtml(value)}" aria-pressed="${value === grade}">${value === 'all' ? '全部' : escapeHtml(value)}</button>`).join('');
      landing.querySelector('.locker-access').innerHTML = STUDENTS.map((student,index) => student.active === false ? '' : `<a href="${studentPath(student,index)}" data-student="${index}">${String(index + 1).padStart(2,'0')} · ${escapeHtml(student.name)} · ${escapeHtml(student.grade)}</a>`).join('');
      const cohort = landing.querySelector('.home-about-cohort');
      cohort.querySelector('h3').textContent = `${active.filter(student => student.tags !== '资料待补充').length}位学生`;
      cohort.querySelector('p').textContent = `${grades.map(value => value.replace('级','')).join('–')}级`;
      selectGrade(grades.includes(grade) ? grade : 'all');
      const uploaded = rows.map(row => publishedWork(row,STUDENTS));
      WORKS.splice(0,WORKS.length,...WORKS.filter(work => !work.uploaded),...uploaded);
      catalogError = '';
    } catch (error) { if (version === catalogVersion) catalogError = error.message || '请检查网络后重试'; }
    finally {
      if (version === catalogVersion) {
        catalogLoading = false;
        if (/^\/(works|creators|students)(\/|$)/.test(location.pathname)) render();
      }
    }
  };
  window.addEventListener('published-catalog-change',refreshCatalog);
  if (!/^\/(students(\/\d+(\/discs)?)?|works(\/[^/]+)?|creators\/[0-9a-f-]{36}(\/discs)?|submit|review|my-works|about)?$/.test(location.pathname)) history.replaceState({}, '', '/');
  render();
  refreshCatalog();
}
