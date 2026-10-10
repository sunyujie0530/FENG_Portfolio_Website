import './portal.css';

const MB = 1024 * 1024;
const fileRules = {
  avatar: { count: 1, each: 5 * MB, total: 5 * MB, types: ['image/jpeg', 'image/png', 'image/webp'] },
  cover: { count: 1, each: 5 * MB, total: 5 * MB, types: ['image/jpeg', 'image/png', 'image/webp'] },
  gallery: { count: 12, each: 8 * MB, total: 60 * MB, types: ['image/jpeg', 'image/png', 'image/webp'] },
  video: { count: 1, each: 200 * MB, total: 200 * MB, types: ['video/mp4', 'video/webm'] },
  document: { count: 1, each: 20 * MB, total: 20 * MB, types: ['application/pdf'] },
};

const views = ['submit', 'about'];

export function hidePortals() {
  for (const name of views) {
    const view = document.querySelector(`#${name}-view`);
    if (!view) continue;
    view.hidden = true;
    view.setAttribute('aria-hidden', 'true');
    document.body.classList.remove(`is-${name}`);
  }
}

export function showPortal(name) {
  hidePortals();
  const view = document.querySelector(`#${name}-view`);
  if (!view) return;
  view.hidden = false;
  view.setAttribute('aria-hidden', 'false');
  document.body.classList.add(`is-${name}`);
  view.scrollTop = 0;
  view.querySelector('h1')?.focus({ preventScroll: true });
}

function formatBytes(bytes) {
  if (!bytes) return '0MB';
  return `${(bytes / MB).toFixed(bytes < 10 * MB ? 1 : 0)}MB`;
}

function validateFiles(form) {
  const errors = [];
  let grandTotal = 0;
  for (const [name, rule] of Object.entries(fileRules)) {
    const files = [...form.elements[name].files];
    const total = files.reduce((sum, file) => sum + file.size, 0);
    grandTotal += total;
    if (files.length > rule.count) errors.push(`${name} 最多选择 ${rule.count} 个文件`);
    if (files.some((file) => !rule.types.includes(file.type))) errors.push(`${name} 包含不支持的文件格式`);
    if (files.some((file) => file.size > rule.each)) errors.push(`${name} 中有单个文件超过 ${formatBytes(rule.each)}`);
    if (total > rule.total) errors.push(`${name} 总大小超过 ${formatBytes(rule.total)}`);
  }
  if (grandTotal > 250 * MB) errors.push('单次投稿总大小不能超过 250MB');
  return { errors, grandTotal };
}

function initSubmissionForm() {
  const form = document.querySelector('#submission-form');
  const summary = document.querySelector('#file-summary');
  const status = document.querySelector('#submission-status');
  const lockerBuilder = document.querySelector('.locker-builder');
  const workUpload = document.querySelector('#work-upload');
  const confirmLocker = document.querySelector('#confirm-locker');
  const lockerStatus = document.querySelector('#locker-status');
  if (!form || !summary || !status || !lockerBuilder || !workUpload || !confirmLocker || !lockerStatus) return;

  const workFieldsets = [...form.querySelectorAll('[data-work-field]')];
  const consent = form.elements.consent;
  const submitButton = form.querySelector('[type="submit"]');
  const avatarImage = lockerBuilder.querySelector('img');
  const avatarLabel = lockerBuilder.querySelector('.locker-avatar span');
  const syncLockerScene = (detail) => window.dispatchEvent(new CustomEvent('submission-locker-change', { detail }));
  let avatarUrl = '';

  const setWorkLocked = (locked) => {
    workFieldsets.forEach((fieldset) => { fieldset.disabled = locked; });
    consent.disabled = locked;
    submitButton.disabled = locked;
    workUpload.classList.toggle('is-locked', locked);
    workUpload.setAttribute('aria-disabled', String(locked));
    form.dataset.lockerConfirmed = String(!locked);
  };

  setWorkLocked(true);
  confirmLocker.disabled = true;

  for (const radio of form.elements.lockerNumber) {
    radio.addEventListener('change', () => {
      lockerBuilder.querySelector('.locker-choice-number').textContent = radio.value;
      syncLockerScene({ number: radio.value });
      confirmLocker.disabled = false;
      lockerStatus.textContent = `已选择 ${radio.value} 号柜，可继续调整外观。`;
    });
  }
  form.elements.lockerColor.addEventListener('input', (event) => {
    syncLockerScene({ color: event.target.value });
  });
  form.elements.lockerAccent.addEventListener('input', (event) => {
    lockerBuilder.style.setProperty('--locker-accent', event.target.value);
    syncLockerScene({ accent: event.target.value });
  });
  form.elements.avatar.addEventListener('change', () => {
    const [file] = form.elements.avatar.files;
    if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    avatarUrl = '';
    avatarImage.hidden = true;
    avatarLabel.hidden = false;
    if (!file) return;
    const rule = fileRules.avatar;
    if (!rule.types.includes(file.type) || file.size > rule.each) {
      form.elements.avatar.value = '';
      lockerStatus.textContent = '头像须为 JPG、PNG 或 WebP，且不超过 5MB。';
      lockerStatus.classList.add('has-error');
      return;
    }
    lockerStatus.classList.remove('has-error');
    avatarUrl = URL.createObjectURL(file);
    avatarImage.src = avatarUrl;
    avatarImage.hidden = false;
    avatarLabel.hidden = true;
  });
  confirmLocker.addEventListener('click', () => {
    if (!form.elements.lockerNumber.value) return;
    setWorkLocked(false);
    lockerStatus.classList.remove('has-error');
    lockerStatus.textContent = `${form.elements.lockerNumber.value} 号柜已确认，现在可以填写并上传作品。`;
    workUpload.querySelector('input, select, textarea')?.focus();
  });

  const updateSummary = () => {
    const { errors, grandTotal } = validateFiles(form);
    const names = Object.keys(fileRules).flatMap((name) => [...form.elements[name].files]);
    summary.textContent = names.length
      ? `${names.length} 个文件 · ${formatBytes(grandTotal)} / 250MB${errors.length ? ` · ${errors[0]}` : ''}`
      : '尚未选择文件 · 单次投稿总量最大 250MB';
    summary.classList.toggle('has-error', errors.length > 0);
  };

  for (const name of Object.keys(fileRules)) form.elements[name].addEventListener('change', updateSummary);
  form.elements.summary.addEventListener('input', () => {
    document.querySelector('[data-counter="summary"]').textContent = `${form.elements.summary.value.length} / 500`;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'submission-status';
    if (form.dataset.lockerConfirmed !== 'true') {
      lockerStatus.textContent = '请先选择并确认柜子。';
      lockerStatus.classList.add('has-error');
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = '请先补全必填信息。';
      status.classList.add('has-error');
      return;
    }
    const { errors } = validateFiles(form);
    if (errors.length) {
      status.textContent = errors.join('；');
      status.classList.add('has-error');
      return;
    }

    const endpoint = import.meta.env.VITE_SUBMIT_ENDPOINT;
    if (!endpoint) {
      status.textContent = '投稿资料已通过本地检查。当前尚未连接审核存储，文件没有离开你的设备。';
      status.classList.add('is-ready');
      return;
    }

    submitButton.disabled = true;
    status.textContent = '正在上传，请不要关闭页面…';
    try {
      const response = await fetch(endpoint, { method: 'POST', body: new FormData(form) });
      if (!response.ok) throw new Error('upload failed');
      form.reset();
      setWorkLocked(true);
      confirmLocker.disabled = true;
      lockerBuilder.style.removeProperty('--locker-accent');
      lockerBuilder.querySelector('.locker-choice-number').textContent = '01';
      syncLockerScene({ color: '#9aa3ac', number: '01' });
      document.querySelector('#deco-scroller [data-deco="-1"]')?.click();
      avatarImage.hidden = true;
      avatarLabel.hidden = false;
      updateSummary();
      status.textContent = '投稿成功，作品已进入审核。';
      status.classList.add('is-ready');
    } catch {
      status.textContent = '上传失败，请检查网络后重试。';
      status.classList.add('has-error');
    } finally {
      submitButton.disabled = form.dataset.lockerConfirmed !== 'true';
    }
  });
}

function initDecoPicker() {
  const scroller = document.querySelector('#deco-scroller');
  const label = document.querySelector('#deco-picker-label');
  if (!scroller || !label) return;
  const buttons = [...scroller.querySelectorAll('[data-deco]')];
  let selected = buttons[0];
  let settle;

  const nameOf = (button) => button.textContent.replace(/^\d+/, '').trim();

  const apply = (button) => {
    if (!button || button === selected) return;
    selected = button;
    buttons.forEach((node) => node.classList.toggle('is-on', node === button));
    label.textContent = nameOf(button);
    window.dispatchEvent(new CustomEvent('submission-locker-change', { detail: { deco: Number(button.dataset.deco) } }));
  };

  const nearest = () => {
    const mid = scroller.scrollTop + scroller.clientHeight / 2;
    return buttons.reduce((best, button) => {
      const center = button.offsetTop + button.offsetHeight / 2;
      const dist = Math.abs(center - mid);
      const t = Math.min(1, dist / 88);
      button.style.transform = dist < 20 ? 'none' : `rotateX(${t * 52}deg) scale(${1 - t * 0.22})`;
      button.style.opacity = dist < 20 ? '1' : String(1 - t * 0.62);
      return dist < best.dist ? { button, dist } : best;
    }, { button: buttons[0], dist: Infinity }).button;
  };

  const paint = () => apply(nearest());

  scroller.addEventListener('scroll', () => {
    nearest();
    clearTimeout(settle);
    settle = setTimeout(paint, 70);
  });
  scroller.addEventListener('click', (event) => {
    const button = event.target.closest('[data-deco]');
    if (!button) return;
    button.scrollIntoView({ block: 'center', behavior: 'smooth' });
    apply(button);
  });
  nearest();
}

initSubmissionForm();
initDecoPicker();
