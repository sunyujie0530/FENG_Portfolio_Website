import {backend,currentUser,ownedWorks,saveWorkRevision} from './submissionBackend.js';
import {escapeHtml as e,statusLabels,fileRules} from './submissionData.js';
import {mountSubmissionAccount} from './submissionUi.js';
import './myWorks.css';

export function currentVersions(rows) {
  const groups = new Map();
  for (const row of rows) {
    const key = row.work_id || row.id;
    const current = groups.get(key);
    if (!current || row.created_at > current.created_at) groups.set(key,row);
  }
  return [...groups.values()];
}
const decorations = ['无','心情板','笔筒','背包','便签','海报','日历','便条','吉他'];
export function editorMarkup(row) {
  const field = (name,label,attrs = '') => `<label>${label}<input name="${name}" value="${e(row.data[name])}" required ${attrs}></label>`;
  const select = (name,label,values) => `<label>${label}<select name="${name}" required>${values.map(value => `<option ${row.data[name] === value ? 'selected' : ''}>${e(value)}</option>`).join('')}</select></label>`;
  return `<div class="my-works-heading"><div><p class="eyebrow">编辑作品</p><h2>${e(row.data.title)}</h2></div><button type="button" data-cancel>返回我的作品</button></div>
    <p class="edit-explanation">保存后重新进入审核。已发布作品继续展示原版，修改稿通过后自动替换；图片不更换时会保留。</p>
    <form class="work-editor"><div class="edit-grid">
      ${field('studentName','姓名','minlength="2" maxlength="20"')}
      ${select('grade','入学年级',[...new Set(['2024级','2025级','2026级',row.data.grade])])}
      ${field('title','作品名称','minlength="2" maxlength="40"')}
      ${select('category','作品类型',['游戏','动画','3D','视觉设计','交互设计','其他'])}
      ${field('year','创作年份','type="number" min="2020" max="2030"')}
      ${field('roles','团队成员与分工','maxlength="200"')}
      <label>柜外装饰<select name="deco">${decorations.map((label,i) => `<option value="${i - 1}" ${String(row.data.deco) === String(i - 1) ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
    </div><label>作品简介<textarea name="summary" required minlength="80" maxlength="500" rows="7">${e(row.data.summary)}</textarea></label>
    <div class="edit-media-grid">${Object.keys(fileRules).map(kind => {
      const files = row.files.filter(file => file.kind === kind);
      const complete = files.length === (kind === 'gallery' ? 3 : 1);
      return `<label>${{avatar:'个人头像',cover:'封面图',gallery:'展示图片（3 张）'}[kind]}
        <div class="edit-previews">${files.map(file => `<img src="${e(file.url)}" alt="${kind === 'avatar' ? '个人头像' : '现有作品图片'}">`).join('')}</div>
        <span>${complete ? '不选新文件则保留现有图片' : '请补齐图片后重新提交'}</span>
        <input name="${kind}" type="file" accept="image/jpeg,image/png,image/webp" ${kind === 'gallery' ? 'multiple' : ''} ${complete ? '' : 'required'}>
      </label>`;
    }).join('')}</div>
    <label class="edit-consent"><input type="checkbox" required>我确认拥有修改内容及图片的展示授权，同意重新提交审核。</label>
    <div class="edit-actions"><button type="submit">保存修改并重新送审</button><button type="button" data-cancel>取消编辑</button></div>
    <p class="edit-status" role="status"></p></form>`;
}

export function mountMyWorks(host) {
  let disposed = false, generation = 0, rows = [], filter = 'all', editing = false, saving = false;
  host.innerHTML = `<div class="my-works-heading"><div><p class="eyebrow page-guide">作品上传 / 我的作品</p><h1 tabindex="-1">我的作品</h1><p>查看投稿状态，编辑资料与图片。</p></div><a class="text-link" href="/submit">上传新作品 →</a></div>
    <section class="submission-account" id="my-works-account"></section>
    <div class="my-works-content"><div class="my-works-toolbar"><div class="kind-tabs" role="group" aria-label="按投稿状态筛选">${['all','approved','pending','rejected','draft'].map(status => `<button type="button" data-filter="${status}" aria-pressed="${status === filter}">${status === 'all' ? '全部' : statusLabels[status]}</button>`).join('')}</div><button type="button" data-refresh>刷新</button></div>
    <p class="my-works-status" role="status"></p><div class="my-works-list"></div></div><section class="my-works-editor" hidden></section>`;
  const content = host.querySelector('.my-works-content'), editor = host.querySelector('.my-works-editor');
  const status = host.querySelector('.my-works-status'), list = host.querySelector('.my-works-list');
  const disposeAccount = mountSubmissionAccount(host.querySelector('#my-works-account'),{showSubmissions:false});
  const showList = () => { editing = false; editor.hidden = true; editor.replaceChildren(); content.hidden = false; };
  const render = () => {
    const current = currentVersions(rows);
    const filtered = current.filter(row => filter === 'all' || row.status === filter);
    host.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.filter === filter)));
    status.textContent = `${current.length} 件作品${filter === 'all' ? '' : ` · 当前筛选 ${filtered.length} 件`}`;
    list.innerHTML = filtered.length ? filtered.map(row => {
      const cover = row.files.find(file => file.kind === 'cover');
      const root = row.work_id || row.id;
      const published = rows.find(version => (version.work_id || version.id) === root && version.status === 'approved');
      return `<article class="my-work-card">${cover ? `<img src="${e(cover.url)}" alt="${e(row.data.title)}封面">` : '<div class="my-work-placeholder">尚未上传封面</div>'}
        <div><span class="my-work-state">${statusLabels[row.status]}</span><h2>${e(row.data.title)}</h2><p>${e(row.data.studentName)} · ${e(row.data.grade)} · ${e(row.data.year)}</p>
        ${row.review_note ? `<p class="my-work-note">审核意见：${e(row.review_note)}</p>` : ''}
        ${published && published.id !== row.id ? '<p>原版正在展示，修改稿待通过后替换。</p>' : ''}
        <div class="edit-actions"><button type="button" data-edit="${e(row.id)}">查看 / 编辑</button>${published ? `<a href="/works/submission-${e(root)}">查看已发布作品 ↗</a>` : ''}</div></div></article>`;
    }).join('') : '<div class="my-works-empty"><h2>暂无作品</h2><p>投稿后即可在这里查看和编辑。</p></div>';
  };
  const load = async () => {
    const run = ++generation;
    rows = []; status.textContent = '正在读取你的作品…'; list.replaceChildren();
    try {
      if (!await currentUser()) {if (!disposed && run === generation) status.textContent = '请先登录，查看和编辑你上传的作品。'; return;}
      const records = await ownedWorks();
      if (disposed || run !== generation) return;
      rows = records; render();
    } catch (error) {if (!disposed && run === generation) status.textContent = `读取失败：${error.message}。可点击刷新重试。`;}
  };
  const openEditor = row => {
    editing = true; content.hidden = true; editor.hidden = false; editor.innerHTML = editorMarkup(row);
    const form = editor.querySelector('form'), message = editor.querySelector('.edit-status');
    let draftId;
    editor.querySelectorAll('[data-cancel]').forEach(button => button.addEventListener('click',() => {if (!saving) showList();}));
    form.addEventListener('submit',async event => {
      event.preventDefault();
      if (saving || !form.reportValidity()) return;
      saving = true; form.inert = true;
      message.textContent = '正在保存修改…';
      try {
        await saveWorkRevision(row,form,draftId,text => {message.textContent = text;});
        if (disposed) return;
        showList(); await load();
        status.textContent = '修改已提交审核。已发布原版会保留到修改稿通过。';
        window.dispatchEvent(new Event('published-catalog-change'));
      } catch (error) {
        draftId = error.draftId || draftId;
        if (!disposed) message.textContent = `${error.message}。修改内容已保留，可重试。`;
      } finally {saving = false; form.inert = false;}
    });
    editor.querySelector('[name="title"]').focus();
  };
  const click = event => {
    const target = event.target.closest('button');
    if (saving) return;
    if (target?.hasAttribute('data-refresh')) load();
    if (target?.dataset.filter) {filter = target.dataset.filter; render();}
    if (target?.dataset.edit) {const row = rows.find(row => row.id === target.dataset.edit); if (row) openEditor(row);}
  };
  host.addEventListener('click',click);
  const auth = backend?.auth.onAuthStateChange(event => {setTimeout(() => {
    if (disposed) return;
    if (event === 'SIGNED_OUT') {showList();rows = [];load();}
    else if (!editing && !saving) load();
  },0);});
  const visibility = () => {if (!document.hidden && !editing && !saving) load();};
  const unload = event => {if (saving) {event.preventDefault();event.returnValue = '';}};
  document.addEventListener('visibilitychange',visibility);
  window.addEventListener('beforeunload',unload);
  load();
  return () => {
    disposed = true; generation++; disposeAccount();
    auth?.data.subscription.unsubscribe();
    host.removeEventListener('click',click);
    document.removeEventListener('visibilitychange',visibility);
    window.removeEventListener('beforeunload',unload);
  };
}
