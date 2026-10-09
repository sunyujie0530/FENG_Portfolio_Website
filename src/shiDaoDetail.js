export const SHI_FRONT = '/assets/works/shi-dao/front.jpg';
export const SHI_BACK = '/assets/works/shi-dao/back.jpg';

export function createShiDaoDetail(onBack) {
  const panel = document.createElement('article');
  panel.className = 'work-detail bcw-detail';
  panel.hidden = true;
  panel.setAttribute('aria-label', '屎到临头 作品详情');
  panel.innerHTML = `
    <button class="work-detail__back" type="button">← 返回全部作品</button>
    <div class="bcw-layout">
      <header class="bcw-author"><h1 tabindex="-1">SHI DAO LIN TOU</h1><h2>《屎到临头》</h2></header>
      <h3 class="bcw-section">01 作品简介</h3>
      <div class="work-detail__copy bcw-copy">
        <p>《屎到临头》是一款2V3非对称欢乐对抗游戏，采用3D黏土动画风格渲染，角色搭配搞怪动画，营造出荒诞又可爱的视觉体验。</p>
        <p>你将扮演人类或狗狗，在公园展开一场“有味道”的对决。节奏轻快，配合至上，笑点密集。这场胜负，真的会“屎”到临头。</p>
      </div>
      <div class="bcw-media">
        <div class="work-detail__gallery">
          <img src="${SHI_BACK}" alt="屎到临头 主视觉" loading="lazy">
          <img src="/assets/works/shi-dao/scene-2.jpg" alt="屎到临头 对局准备" loading="lazy">
          <img src="/assets/works/shi-dao/scene-3.jpg" alt="屎到临头 主菜单" loading="lazy">
        </div>
        <h3>02 视频简介</h3>
        <video controls playsinline preload="none" poster="${SHI_BACK}" aria-label="屎到临头 宣传与实机"><source src="/assets/works/shi-dao/demo.mp4" type="video/mp4"></video>
      </div>
    </div>`;
  document.querySelector('#works').append(panel);
  panel.querySelector('button').addEventListener('click', onBack);
  const layout = panel.querySelector('.bcw-layout');
  const author = panel.querySelector('.bcw-author');
  const copy = panel.querySelector('.bcw-copy');
  const section = panel.querySelector('.bcw-section');
  const media = panel.querySelector('.bcw-media');
  let last = '';
  panel.updateLayout = () => {
    const w = panel.clientWidth, h = panel.clientHeight, s = panel.scrollTop;
    const key = `${w}:${h}:${s}`;
    if (!w || !h || key === last) return;
    last = key;
    const mobile = w < 700;
    const progress = Math.min(1, s / h);
    const p = progress * progress * (3 - 2 * progress);
    const mix = (a, b) => a + (b - a) * p;
    const left = mix(mobile ? .07 : .1, mobile ? .07 : .205) * w;
    const width = mix(mobile ? .86 : .43, mobile ? .86 : .59) * w;
    author.style.left = `${left}px`;
    author.style.width = `${width}px`;
    author.style.top = `${mix(mobile ? h * .43 : h * .25, h + h * .065)}px`;
    author.querySelector('h1').style.fontSize = `${mix(Math.min(w * (mobile ? .072 : .047), 90), Math.min(w * (mobile ? .061 : .038), 72))}px`;
    for (const heading of author.children) {
      heading.style.transform = `translateX(${mobile ? 0 : (width - heading.offsetWidth) * p / 2}px)`;
    }
    const endCopyY = Math.max(h * .4, 260);
    copy.style.left = `${left}px`;
    copy.style.width = `${width}px`;
    copy.style.top = `${mix((mobile ? h * .43 : h * .25) + author.offsetHeight + 28, h + endCopyY)}px`;
    section.style.cssText = `left:${left}px;width:${width}px;top:${h + endCopyY - 64}px;opacity:${p}`;
    media.style.cssText = `left:${left}px;width:${width}px;top:${h + endCopyY + copy.offsetHeight + 24}px;opacity:${p}`;
    layout.style.height = `${h + endCopyY + copy.offsetHeight + media.offsetHeight + 100}px`;
  };
  return panel;
}
