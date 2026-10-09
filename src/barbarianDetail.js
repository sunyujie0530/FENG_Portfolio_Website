import { pageProgress } from './workDetailMotion.js';

export const BARBARIAN_BACK = '/assets/works/barbarian/back.png';

export function createBarbarianDetail(onBack) {
  const panel = document.createElement('article');
  panel.className = 'work-detail bcw-detail';
  panel.hidden = true;
  panel.setAttribute('aria-label', '野蛮人战士 作品详情');
  panel.innerHTML = `
    <button class="work-detail__back" type="button">← 返回全部作品</button>
    <div class="bcw-layout">
      <header class="bcw-author"><h1 tabindex="-1">WANG WENJI</h1><h2>王文骥</h2></header>
      <h3 class="bcw-section">01 作品简介</h3>
      <div class="work-detail__copy bcw-copy">
        <p>该模型以欧美卡通风格为基础，塑造了一位兼具力量感与野性气质的奇幻野蛮人战士。角色整体采用夸张的肌肉比例与宽肩壮臂的体型设计，通过低重心的战斗姿态强化其勇猛、强悍的视觉特征。头部以兽皮头饰与粗犷的面部轮廓突出原始部落气息，肩部兽骨装饰、皮毛护具及金属铆钉等元素进一步丰富了角色的身份特征与造型层次。武器采用战斧与圆盾的组合，突出角色近战攻防兼备的战斗定位。</p>
        <p>在雕刻表现上，运用概括化的形体语言与清晰的块面转折，强化肌肉结构、服饰褶皱及装饰细节之间的对比，在保留卡通化视觉特征的同时，兼顾角色的立体感与结构合理性。整体造型兼具奇幻色彩与游戏角色辨识度，体现了欧美卡通角色雕刻中夸张比例、鲜明轮廓与力量表现相结合的设计特点。</p>
      </div>
      <div class="bcw-media">
        <div class="work-detail__gallery">
          <img src="/assets/works/barbarian/scene-1.jpg" alt="野蛮人战士 全身" loading="lazy">
          <img src="${BARBARIAN_BACK}" alt="野蛮人战士 近景" loading="lazy">
          <img src="/assets/works/barbarian/scene-3.jpg" alt="野蛮人战士 深色背景" loading="lazy">
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
    const p = pageProgress(s, h);
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
