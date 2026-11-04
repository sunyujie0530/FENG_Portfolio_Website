import './discRoom.css';
import { escapeHtml } from './submissionData.js';
import { discInsideTray, clampDisc } from './discDrop.js';

export function mountDiscRoom({ host, student, studentIndex, students, works, state, onOpen, onBack }) {
  let pool = [];
  let active = null;
  let loading = false;
  let disposed = false;
  let frame = 0;
  const timers = [];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const room = document.createElement('section');
  room.className = 'cd-room';
  room.setAttribute('aria-label', `${student.name}的作品光盘库`);
  room.innerHTML = `
    <header class="cd-room-header">
      <button type="button" class="cd-room-back">← 返回打开的柜子</button>
      <p class="eyebrow page-guide">学生 / ${escapeHtml(student.name)}的作品光盘库</p>
      <h1 tabindex="-1">${escapeHtml(student.name)}的<br>作品光盘库<span>。</span></h1>
    </header>
    <div class="cd-library"><label for="cd-library-select">切换光盘库</label><select id="cd-library-select"><option value="student">${escapeHtml(student.name)}的作品</option><option value="all">全部作品</option></select><span id="cd-library-count"></span></div>
    <div class="cd-board" aria-label="拖动光盘到上方CD盒">
      <div class="cd-drive" aria-label="CD盒">
        <div class="cd-tray-shell"><div class="cd-tray">
          <div class="cd-tray-rail cd-tray-rail--left"></div><div class="cd-tray-rail cd-tray-rail--right"></div>
          <div class="cd-tray-ring"></div><div class="cd-tray-notch"></div>
          <span class="cd-tray-pad cd-tray-pad--left"></span><span class="cd-tray-pad cd-tray-pad--right"></span>
          <div class="cd-drop-zone" aria-label="把光盘拖到这里放入CD盒"></div>
          <div class="cd-tray-lip"><span>FENG / OPTICAL ARCHIVE</span></div>
        </div></div>
        <div class="cd-drive-face"><i class="cd-screw"></i><i class="cd-screw"></i><i class="cd-screw"></i><i class="cd-screw"></i><span>FENG</span><small>COMPACT DISC · CD-R / RW</small><b class="cd-drive-led"></b><div class="cd-drive-slot"></div><span class="cd-drive-eject" aria-hidden="true">⏏</span></div>
      </div>
      <p class="cd-drop-hint">将光盘放在托盘上 <span>↖</span></p>
      <div class="cd-discs"></div>
      <div class="cd-loading" hidden><span class="cd-loading-disc"></span><p>正在打开作品…</p><div></div></div>
    </div>
    <footer class="cd-room-footer">
      <div class="cd-footer-actions"><button type="button" class="cd-insert">放入所选光盘 ↗</button><p id="cd-status" role="status" aria-live="polite">拖动光盘到上方托盘，或点击按钮放入。</p></div></footer>`;
  host.append(room);
  document.body.classList.add('is-disc-room');
  const board = room.querySelector('.cd-board');
  const discs = room.querySelector('.cd-discs');
  const drive = room.querySelector('.cd-drive');
  const zone = room.querySelector('.cd-drop-zone');
  const status = room.querySelector('#cd-status');
  const library = room.querySelector('#cd-library-select');
  const insert = room.querySelector('.cd-insert');
  state.positions ||= {};
  state.library ||= 'student';

  const selectedWork = () => pool.find((work) => work.id === state.selectedId) || pool[0];
  const select = (work) => {
    state.selectedId = work.id;
    discs.querySelectorAll('button').forEach((disc) => disc.setAttribute('aria-pressed', String(disc.dataset.workId === work.id)));
  };
  const setPosition = (element, x, y) => { element.style.left = `${x}%`; element.style.top = `${y}%`; };
  const renderDiscs = () => {
    pool = state.library === 'all' ? works : works.filter((work) => work.authors.includes(studentIndex));
    library.value = state.library;
    room.querySelector('#cd-library-count').textContent = `${pool.length} 张作品光盘`;
    insert.disabled = !pool.length;
    discs.innerHTML = pool.map((work, index) => {
      const position = state.positions[work.id] || {
        x: pool.length <= 3 ? 50 + (index - (pool.length - 1) / 2) * 16 : 50 + Math.cos(index * 2.4) * (12 + index * 1.25),
        y: pool.length <= 3 ? 67 + index * 3 : 65 + Math.sin(index * 2.4) * 9,
      };
      return `<button type="button" class="archive-disc" data-work-id="${escapeHtml(work.id)}" aria-label="选择光盘：${escapeHtml(work.title)}" aria-pressed="false" style="left:${position.x}%;top:${position.y}%;--tilt:${(index % 2 ? 1 : -1) * (8 + index * 3)}deg;z-index:${index + 10}">
        <span class="cd-art" style="background-image:url('${escapeHtml(work.cover)}')"></span><span class="cd-hub"></span>
      </button>`;
    }).join('');
    if (pool.length) select(selectedWork());
    else {
      status.textContent = '可切换到全部作品光盘库继续浏览。';
    }
  };
  const schedule = (action, delay) => timers.push(setTimeout(() => { if (!disposed) action(); }, delay));
  const putDisc = (element, work) => {
    if (loading || !work) return;
    loading = true;
    select(work);
    insert.disabled = true;
    library.disabled = true;
    room.classList.add('is-inserting');
    drive.classList.remove('is-drop-ready');
    element.classList.remove('is-dragging');
    element.classList.add('is-loading-disc');
    element.style.zIndex = '100';
    const rect = board.getBoundingClientRect();
    const tray = zone.getBoundingClientRect();
    setPosition(element, ((tray.left + tray.right) / 2 - rect.left) / rect.width * 100, ((tray.top + tray.bottom) / 2 - rect.top) / rect.height * 100);
    status.textContent = `已放入《${work.title}》，正在读取…`;
    room.querySelector('.cd-drop-hint').textContent = '光盘已就位，正在读取';
    schedule(() => room.classList.add('is-tray-closing'), reducedMotion ? 20 : 450);
    schedule(() => {
      room.classList.add('is-opening-work');
      room.querySelector('.cd-loading').hidden = false;
    }, reducedMotion ? 30 : 900);
    schedule(() => onOpen(work), reducedMotion ? 80 : 1450);
  };
  const centerFor = (event) => ({ x: event.clientX - active.offsetX, y: event.clientY - active.offsetY });
  const positionDrag = (event) => {
    if (!active) return;
    const center = centerFor(event);
    const rect = board.getBoundingClientRect();
    const diameter = active.element.offsetWidth;
    const x = clampDisc(center.x - rect.left, rect.width, diameter);
    const y = clampDisc(center.y - rect.top, rect.height, diameter);
    setPosition(active.element, x / rect.width * 100, y / rect.height * 100);
    active.center = { x: rect.left + x, y: rect.top + y };
    drive.classList.toggle('is-drop-ready', discInsideTray(active.center, zone.getBoundingClientRect()));
  };
  const endDrag = (event, cancelled = false) => {
    if (!active || event.pointerId !== active.pointerId) return;
    if (frame) cancelAnimationFrame(frame);
    if (!cancelled && active.moved) positionDrag(event);
    const drag = active;
    active = null;
    drag.element.classList.remove('is-dragging');
    drive.classList.remove('is-drop-ready');
    if (drag.element.hasPointerCapture(event.pointerId)) drag.element.releasePointerCapture(event.pointerId);
    if (!cancelled && drag.moved && discInsideTray(drag.center, zone.getBoundingClientRect())) {
      putDisc(drag.element, pool.find((work) => work.id === drag.element.dataset.workId));
    } else if (drag.moved) {
      state.positions[drag.element.dataset.workId] = { x: parseFloat(drag.element.style.left), y: parseFloat(drag.element.style.top) };
      status.textContent = cancelled ? '拖动已取消，可重新选择光盘。' : '可以继续拖到上方 CD 托盘，或点击“放入所选光盘”。';
    }
  };
  discs.addEventListener('pointerdown', (event) => {
    const element = event.target.closest('.archive-disc');
    if (!element || loading || active || event.button !== 0) return;
    const work = pool.find((item) => item.id === element.dataset.workId);
    select(work);
    element.focus({ preventScroll: true });
    const rect = element.getBoundingClientRect();
    active = { element, pointerId: event.pointerId, offsetX: event.clientX - (rect.left + rect.width / 2), offsetY: event.clientY - (rect.top + rect.height / 2), startX: event.clientX, startY: event.clientY, moved: false, center: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } };
    element.setPointerCapture(event.pointerId);
    element.classList.add('is-dragging');
    element.style.zIndex = '90';
  });
  discs.addEventListener('pointermove', (event) => {
    if (!active || event.pointerId !== active.pointerId) return;
    if (Math.hypot(event.clientX - active.startX, event.clientY - active.startY) > 5) active.moved = true;
    if (!active.moved) return;
    event.preventDefault();
    if (frame) cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => { frame = 0; positionDrag(event); });
  });
  discs.addEventListener('pointerup', (event) => endDrag(event));
  discs.addEventListener('pointercancel', (event) => endDrag(event, true));
  discs.addEventListener('lostpointercapture', (event) => { if (active) endDrag(event, true); });
  discs.addEventListener('click', (event) => {
    const element = event.target.closest('.archive-disc');
    if (element && !loading) select(pool.find((work) => work.id === element.dataset.workId));
  });
  insert.addEventListener('click', () => {
    const work = selectedWork();
    if (work) putDisc([...discs.children].find((element) => element.dataset.workId === work.id), work);
  });
  library.addEventListener('change', () => {
    if (loading) return;
    if (active) endDrag({ pointerId: active.pointerId }, true);
    state.library = library.value;
    status.textContent = '光盘库已切换。选择作品，再拖入上方 CD 托盘。';
    renderDiscs();
  });
  room.querySelector('.cd-room-back').addEventListener('click', onBack);
  const onKey = (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    if (active) endDrag({ pointerId: active.pointerId }, true);
    else onBack();
  };
  const onResize = () => { if (active) endDrag({ pointerId: active.pointerId }, true); };
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', onResize);
  renderDiscs();
  return () => {
    disposed = true;
    active = null;
    timers.forEach(clearTimeout);
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    document.body.classList.remove('is-disc-room');
    room.remove();
  };
}
