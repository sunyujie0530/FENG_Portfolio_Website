import { backend, backendConfigured, checked, currentUser, isAdmin, mySubmissions, signedFiles, resumeDraft } from './submissionBackend.js';
import { escapeHtml as e, statusLabels } from './submissionData.js';
import './submissionUi.css';

export function mountSubmissionAccount(host) {
  host.innerHTML = `<h2>邮箱登录</h2><p>先通过邮件登录链接或验证码验证邮箱，再上传图片和 PDF。作品审核通过后公开。</p>
    <p class="backend-notice" ${backendConfigured ? 'hidden' : ''}>后端尚未配置：现在可以预览和填写，但不能真实上传。请按 docs/BACKEND_SETUP.md 创建项目。</p>
    <div class="account-controls"><label>登录邮箱<input id="account-email" type="email" autocomplete="email" maxlength="254"></label>
    <button type="button" id="account-send">发送登录邮件</button>
    <label>邮箱验证码<input id="account-code" inputmode="numeric" autocomplete="one-time-code" maxlength="10"></label>
    <button type="button" id="account-verify">验证并登录</button><button type="button" id="account-logout" hidden>退出登录</button></div>
    <p id="account-status" role="status" aria-live="polite"></p><a class="text-link" id="review-entry" href="/review" hidden>进入管理员审核 →</a>
    <h3>我的投稿</h3><div id="my-submissions">登录后可查看审核结果。</div>`;
  const email = host.querySelector('#account-email'), code = host.querySelector('#account-code');
  const send = host.querySelector('#account-send'), verify = host.querySelector('#account-verify'), logout = host.querySelector('#account-logout');
  const status = host.querySelector('#account-status'), mine = host.querySelector('#my-submissions');
  let busy = false, cooldown = 0, timer, sentEmail = '', generation = 0;
  const controls = () => { send.disabled = !backend || busy || cooldown > 0; verify.disabled = !backend || busy || !sentEmail; logout.disabled = busy; send.textContent = cooldown ? `${cooldown} 秒后重发` : '发送登录邮件'; };
  const refresh = async () => {
    const run = ++generation;
    try {
      const user = await currentUser();
      if (run !== generation) return;
      logout.hidden = !user;
      email.disabled = Boolean(user);
      verify.hidden = code.parentElement.hidden = send.hidden = Boolean(user);
      const schoolEmail = document.querySelector('#submission-form [name="email"]');
      if (schoolEmail) { schoolEmail.value = user?.email || ''; schoolEmail.readOnly = true; }
      if (!user) { mine.textContent = '登录后可查看审核结果。'; host.querySelector('#review-entry').hidden = true; return; }
      email.value = user.email;
      status.textContent = `已登录：${user.email}`;
      const [rows, admin] = await Promise.all([mySubmissions(),isAdmin()]);
      if (run !== generation) return;
      host.querySelector('#review-entry').hidden = !admin;
      mine.innerHTML = rows.length ? rows.map(row => `<article><strong>${e(row.data.title)}</strong><span>${statusLabels[row.status]}</span>
        ${row.review_note ? `<p>审核意见：${e(row.review_note)}</p>` : ''}
        ${['draft','rejected'].includes(row.status) ? `<button type="button" data-resume="${e(row.id)}">继续填写这份投稿</button>` : ''}</article>`).join('') : '<p>暂时没有投稿。</p>';
      mine.querySelectorAll('[data-resume]').forEach(button => button.addEventListener('click', () => {
        const row = rows.find(row => row.id === button.dataset.resume);
        const form = document.querySelector('#submission-form');
        if (!form) return;
        resumeDraft(row.id,user.id);
        for (const name of ['avatar','cover','gallery','document']) form.elements[name].value = '';
        form.elements.avatar.dispatchEvent(new Event('change',{bubbles:true}));
        form.elements.cover.dispatchEvent(new Event('change',{bubbles:true}));
        for (const name of ['studentName','title','grade','category','year','roles','summary']) form.elements[name].value = row.data[name] || '';
        form.elements.lockerColor.value = row.data.lockerColor;
        form.elements.lockerAccent.value = row.data.lockerAccent;
        const radio = [...form.elements.lockerNumber].find(input => input.value === row.data.lockerNumber);
        radio.checked = true; radio.dispatchEvent(new Event('change',{ bubbles:true }));
        form.elements.lockerColor.dispatchEvent(new Event('input',{ bubbles:true }));
        form.elements.lockerAccent.dispatchEvent(new Event('input',{ bubbles:true }));
        document.querySelector(`#deco-scroller [data-deco="${row.data.deco}"]`)?.click();
        form.elements.summary.dispatchEvent(new Event('input',{ bubbles:true }));
        status.textContent = '已恢复投稿资料。请确认柜子、填写学号并重新选择文件，然后提交；旧文件会被替换。';
      }));
    } catch (error) { status.textContent = `账户读取失败：${error.message}`; }
  };
  const action = async fn => {
    if (busy) return;
    busy = true; controls();
    try { await fn(); } catch (error) { status.textContent = error.message || '操作失败，请重试'; }
    finally { busy = false; controls(); }
  };
  send.addEventListener('click', () => action(async () => {
    if (!email.reportValidity() || !email.value.trim()) throw new Error('请填写有效邮箱');
    checked(await backend.auth.signInWithOtp({ email:email.value.trim(), options:{ shouldCreateUser:true, emailRedirectTo:new URL('/submit',window.location.origin).href } }));
    sentEmail = email.value.trim(); cooldown = 60;
    status.textContent = '登录邮件已发送，请检查收件箱或垃圾邮件。收到登录链接时，请在当前浏览器打开；收到数字验证码时，在下方输入。';
    clearInterval(timer); timer = setInterval(() => { cooldown--; controls(); if (!cooldown) clearInterval(timer); },1000);
  }));
  verify.addEventListener('click', () => action(async () => {
    if (sentEmail !== email.value.trim()) throw new Error('邮箱已变化，请向当前邮箱重新发送验证码');
    if (!/^\d{6,10}$/.test(code.value.trim())) throw new Error('请输入邮件中的数字验证码');
    checked(await backend.auth.verifyOtp({ email:sentEmail, token:code.value.trim(), type:'email' }));
    code.value = ''; await refresh();
  }));
  logout.addEventListener('click', () => action(async () => {
    checked(await backend.auth.signOut());
    const form = document.querySelector('#submission-form');
    if (form) {
      for (const name of ['studentName','studentId','email','title','roles','summary']) form.elements[name].value = '';
      for (const name of ['avatar','cover','gallery','document']) form.elements[name].value = '';
      form.elements.avatar.dispatchEvent(new Event('change',{bubbles:true}));
      form.elements.cover.dispatchEvent(new Event('change',{bubbles:true}));
      form.elements.summary.dispatchEvent(new Event('input',{bubbles:true}));
    }
    status.textContent = '已退出登录'; await refresh();
  }));
  controls(); refresh();
  backend?.auth.onAuthStateChange(() => { setTimeout(refresh,0); });
  window.addEventListener('submission-complete',refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
}

export function mountReview(host) {
  let disposed = false, version = 0;
  host.innerHTML = '<a class="back-link" href="/submit">← 返回作品上传</a><p class="page-guide">管理员 / 投稿审核</p><h1 tabindex="-1">投稿审核</h1><div class="review-tools"><button type="button" data-status="pending">待审核</button><button type="button" data-status="approved">已发布</button><button type="button" id="review-refresh">刷新</button></div><p role="status" id="review-status"></p><div id="review-list"></div>';
  const status = host.querySelector('#review-status'), list = host.querySelector('#review-list');
  let selected = 'pending';
  const load = async () => {
    const run = ++version;
    status.textContent = '正在读取…'; list.replaceChildren();
    try {
      if (!backendConfigured) throw new Error('后端尚未配置，请先完成配置说明');
      if (!await isAdmin()) throw new Error('需要管理员权限。请先在作品上传页登录管理员邮箱。');
      const rows = checked(await backend.from('submissions').select('id,data,contact_email,student_id,status,submitted_at,submission_files(*)').eq('status',selected).order('submitted_at',{ ascending:false }));
      const items = await Promise.all(rows.map(async row => ({ ...row,files:await signedFiles(row.submission_files) })));
      if (disposed || run !== version) return;
      status.textContent = `${selected === 'pending' ? '待审核' : '已发布'}：${items.length} 件`;
      for (const row of items) {
        const card = document.createElement('article'); card.className = 'review-card';
        card.innerHTML = `<h2>${e(row.data.title)}</h2><p>${e(row.data.studentName)} · ${e(row.data.grade)} · ${e(row.data.category)} · ${e(row.data.year)}</p>
          <p>联系方式：${e(row.contact_email)}　学号：${e(row.student_id)}</p><p>${e(row.data.roles)}</p><p class="review-copy">${e(row.data.summary)}</p>
          <div class="review-media">${row.files.map(file => file.kind === 'document' ? `<a href="${e(file.url)}" target="_blank" rel="noopener noreferrer">下载 PDF</a>` : `<img src="${e(file.url)}" alt="${file.kind === 'cover' ? '作品封面' : file.kind === 'avatar' ? '学生头像' : '展示图片'}" loading="lazy">`).join('')}</div>
          <p>展示柜样式：${e(row.data.lockerNumber)}（仅样式预览，不自动覆盖现有柜子）</p><label>审核意见<textarea maxlength="500" rows="2"></textarea></label>
          <div>${selected === 'pending' ? '<button type="button" data-review="approve">通过并发布</button>' : ''}<button type="button" data-review="reject">${selected === 'pending' ? '退回修改' : '下架作品'}</button></div>`;
        card.querySelectorAll('[data-review]').forEach(button => button.addEventListener('click', async () => {
          card.querySelectorAll('button').forEach(node => { node.disabled = true; });
          try {
            checked(await backend.rpc('review_submission',{ p_id:row.id,p_approve:button.dataset.review === 'approve',p_note:card.querySelector('textarea').value.trim() }));
            window.dispatchEvent(new Event('published-catalog-change')); await load();
          } catch (error) { if (!disposed) status.textContent = `审核失败：${error.message}`; card.querySelectorAll('button').forEach(node => { node.disabled = false; }); }
        }));
        list.append(card);
      }
    } catch (error) { if (!disposed && run === version) status.textContent = error.message; }
  };
  host.querySelectorAll('[data-status]').forEach(button => button.addEventListener('click', () => { selected = button.dataset.status; load(); }));
  host.querySelector('#review-refresh').addEventListener('click',load);
  const auth = backend?.auth.onAuthStateChange(() => {
    list.replaceChildren();
    setTimeout(() => { if (!disposed) load(); },0);
  });
  load();
  return () => { disposed = true; version++; auth?.data.subscription.unsubscribe(); };
}
