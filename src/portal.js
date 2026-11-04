import './portal.css';
import { MB, fileRules, validateFiles } from './submissionData.js';
import { backendConfigured, currentUser, uploadSubmission } from './submissionBackend.js';
import { mountSubmissionAccount } from './submissionUi.js';

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

function initSubmissionForm() {
  const form = document.querySelector('#submission-form');
  const summary = document.querySelector('#file-summary');
  const status = document.querySelector('#submission-status');
  if (!form || !summary || !status) return;
  const submitButton = form.querySelector('[type="submit"]');
  const avatarImage = document.querySelector('#avatar-preview');
  let avatarUrl = '';
  form.elements.avatar.addEventListener('change', () => {
    const [file] = form.elements.avatar.files;
    if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    avatarUrl = '';
    avatarImage.hidden = true;
    if (!file) return;
    const rule = fileRules.avatar;
    if (!rule.types.includes(file.type) || file.size > rule.each) {
      form.elements.avatar.value = '';
      status.textContent = '头像须为 JPG、PNG 或 WebP，且不超过 5MB。';
      status.classList.add('has-error');
      return;
    }
    status.classList.remove('has-error');
    avatarUrl = URL.createObjectURL(file);
    avatarImage.src = avatarUrl;
    avatarImage.hidden = false;
  });
  const updateSummary = () => {
    const { errors, grandTotal } = validateFiles(form);
    const names = Object.keys(fileRules).flatMap((name) => [...form.elements[name].files]);
    summary.textContent = names.length
      ? `${names.length} 个文件 · ${formatBytes(grandTotal)} / 90MB${errors.length ? ` · ${errors[0]}` : ''}`
      : '尚未选择文件 · 单次投稿总量最大 90MB · 不支持视频';
    summary.classList.toggle('has-error', errors.length > 0);
  };

  for (const name of Object.keys(fileRules)) form.elements[name].addEventListener('change', updateSummary);
  form.elements.summary.addEventListener('input', () => {
    document.querySelector('[data-counter="summary"]').textContent = `${form.elements.summary.value.length} / 500`;
  });

  let uploading = false;
  window.addEventListener('beforeunload', event => { if (uploading) { event.preventDefault(); event.returnValue = ''; } });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (uploading) return;
    status.className = 'submission-status';
    if (!backendConfigured) { status.textContent = '后端尚未配置，文件没有上传。请先完成配置说明。'; status.classList.add('has-error'); return; }
    try { if (!await currentUser()) throw new Error('请先在上方完成邮箱验证并登录'); }
    catch (error) { status.textContent = error.message; status.classList.add('has-error'); return; }
    if (uploading) return;
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

    uploading = true;
    submitButton.disabled = true;
    form.inert = true;
    document.querySelector('#submission-account').inert = true;
    status.textContent = '正在上传，请不要关闭页面…';
    try {
      await uploadSubmission(form, message => { status.textContent = message; });
      form.reset();
      document.querySelector('#deco-scroller [data-deco="-1"]')?.click();
      avatarImage.hidden = true;
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
      avatarUrl = '';
      document.querySelector('[data-counter="summary"]').textContent = '0 / 500';
      updateSummary();
      status.textContent = '投稿成功，作品已进入审核。可在上方“我的投稿”查看结果。';
      status.classList.add('is-ready');
      window.dispatchEvent(new Event('submission-complete'));
    } catch (error) {
      status.textContent = `上传未完成：${error.message || '请检查网络后重试'}。资料和文件选择已保留；可重试当前草稿，请先查看“我的投稿”避免重复提交。`;
      status.classList.add('has-error');
      window.dispatchEvent(new Event('submission-complete'));
    } finally {
      uploading = false;
      form.inert = false;
      document.querySelector('#submission-account').inert = false;
      submitButton.disabled = false;
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
mountSubmissionAccount(document.querySelector('#submission-account'));
