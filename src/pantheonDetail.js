export const PANTHEON_BACK = '/assets/works/pantheon/back.jpg';

export function createPantheonDetail(onBack) {
  const panel = document.createElement('article');
  panel.className = 'work-detail bcw-detail';
  panel.hidden = true;
  panel.setAttribute('aria-label', '万神殿 作品详情');
  panel.innerHTML = `
    <button class="work-detail__back" type="button">← 返回全部作品</button>
    <div class="bcw-layout">
      <header class="bcw-author"><h1 tabindex="-1">SUN YUJIE</h1><h2>孙玉洁《万神殿》</h2></header>
      <h3 class="bcw-section">01 作品简介</h3>
      <div class="work-detail__copy bcw-copy">
        <p>选择以“重建”为叙事起点，将建筑与供水系统设计为核心玩法关卡。玩家在修复、取舍与调度的过程中，不再只是完成技术任务，而是不断面对公共利益与权力要求之间的张力与妥协。游戏并不提供单一正确答案，而是通过机制本身，引导玩家体会公共空间如何在不同选择下被塑造、扭曲甚至异化。</p>
        <p>从功能游戏的角度来看，本作希望打破传统叙事中“观看历史”的方式，转而通过互动机制让玩家“参与历史”。建筑不再只是背景，系统不再只是规则，而成为理解权力、空间与个体关系的一种认知工具。</p>
      </div>
      <div class="bcw-media">
        <div class="work-detail__gallery">
          <img src="/assets/works/pantheon/scene-1.jpg" alt="万神殿 哈德良皇帝对话" loading="lazy">
          <img src="/assets/works/pantheon/scene-2.jpg" alt="万神殿 角色与界面设定" loading="lazy">
          <img src="/assets/works/pantheon/scene-3.jpg" alt="万神殿 场景动线规划" loading="lazy">
        </div>
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
