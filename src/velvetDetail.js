export const VELVET_BACK = '/assets/works/velvet-garden/back.jpg';

export function createVelvetDetail(onBack) {
  const panel = document.createElement('article');
  panel.className = 'work-detail bcw-detail';
  panel.hidden = true;
  panel.setAttribute('aria-label', '绒花数字花园 作品详情');
  panel.innerHTML = `
    <button class="work-detail__back" type="button">← 返回全部作品</button>
    <div class="bcw-layout">
      <header class="bcw-author"><h1 tabindex="-1">SUN YUJIE</h1><h2>孙玉洁</h2></header>
      <h3 class="bcw-section">01 作品简介</h3>
      <div class="work-detail__copy bcw-copy">
        <p>互联网时代的今天，绒花在许多电视剧及服化道设计中都有所应用，尤其是《延禧攻略》中使用南京绒花作为头饰，掀起了一波新风潮。绒花在当代语境的独特呈现有哪些？如何做到传承与创新并行？在新媒体传播下的融合后又会产生怎样的新形态？</p>
        <p>在现代工业化模式下，绒花非遗技艺受到各大潮流冲击，继承力薄弱且淡出大众视野。该项目将绒花技艺与中国传统纹样结合并进行数字化转译，使用虚拟数字技术实现绒花技艺与传统纹样的数字化造景，对非遗绒花的内容和形式进行突破和创新，打造一个虚拟的绒花数字花园，旨在突破绒花非遗文化传播的局限性，以创新的手法弘扬传统文化艺术，让非遗“绒”入生活。</p>
      </div>
      <div class="bcw-media">
        <div class="work-detail__gallery">
          <img src="${VELVET_BACK}" alt="绒花数字花园 莲花造景" loading="lazy">
          <img src="/assets/works/velvet-garden/scene-2.jpg" alt="绒花数字花园 太湖石与花丛" loading="lazy">
          <img src="/assets/works/velvet-garden/scene-3.jpg" alt="绒花数字花园 环绕花丛" loading="lazy">
        </div>
        <h3>02 视频简介</h3>
        <video controls playsinline preload="none" poster="${VELVET_BACK}" aria-label="绒花数字花园 演示视频"><source src="/assets/works/velvet-garden/demo.mp4" type="video/mp4"></video>
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
