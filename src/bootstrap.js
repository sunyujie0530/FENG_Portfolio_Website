try {
  await import('./main.js');
} catch (error) {
  console.error('三维页面初始化失败，切换图文浏览', error);
  const [{ initBrowse }, { hidePortals, showPortal }] = await Promise.all([
    import('./browse.js'), import('./portal.js'),
  ]);
  document.body.classList.add('no-webgl');
  initBrowse(mode => {
    hidePortals();
    if (mode === 'submit' || mode === 'about') showPortal(mode);
  }, { plain:true });
}

document.addEventListener('webglcontextlost', event => {
  event.preventDefault();
  if (document.querySelector('.graphics-status')) return;
  const notice = document.createElement('p');
  notice.className = 'graphics-status';
  notice.setAttribute('role', 'status');
  notice.textContent = '三维显示暂时中断，请刷新页面恢复。';
  document.body.append(notice);
}, true);
document.addEventListener('webglcontextrestored', () => document.querySelector('.graphics-status')?.remove(), true);
