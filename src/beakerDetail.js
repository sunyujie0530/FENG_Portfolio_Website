import { pageProgress } from './workDetailMotion.js';

export const BEAKER_FRONT = '/assets/works/beaker-crow/front.png';

export function createBeakerDetail(onBack) {
  const panel = document.createElement('article');
  panel.className = 'work-detail bcw-detail';
  panel.hidden = true;
  panel.setAttribute('aria-label', '烧杯与鸦榨 作品详情');
  panel.innerHTML = `
    <button class="work-detail__back" type="button">← 返回全部作品</button>
    <div class="bcw-layout">
      <header class="bcw-author"><h1 tabindex="-1">WANG WENJI</h1><h2>王文骥</h2></header>
      <h3 class="bcw-section">01 作品简介</h3>
      <div class="work-detail__copy bcw-copy">
        <p>该游戏 Demo 是一款以奇幻魔法世界为背景的休闲经营类游戏，围绕魔女与乌鸦共同经营的魔法饮品店展开。游戏将魔女的炼金术与现实中的饮品调制相结合，玩家需要根据顾客的不同需求，在限定时间内选择原料、搭配配方并完成饮品制作。玩法参考《沙威玛传奇》的限时订单机制，通过逐渐增加的订单数量与原料种类，强化游戏的操作节奏与经营挑战。</p>
        <p>角色设计上，魔女负责炼金调饮，乌鸦则利用喜爱收集闪亮物品的习性，承担收取金币与协助经营的工作，形成具有趣味性的角色分工。整体采用中世纪复古的奇幻美术风格，将魔法元素融入饮品制作流程，营造富有魔法氛围的休闲经营体验。</p>
      </div>
      <div class="bcw-media">
        <div class="work-detail__gallery">
          <img src="/assets/works/beaker-crow/scene-1.jpg" alt="烧杯与鸦榨 吧台经营" loading="lazy">
          <img src="/assets/works/beaker-crow/scene-2.jpg" alt="烧杯与鸦榨 魔女对话" loading="lazy">
          <img src="/assets/works/beaker-crow/scene-3.jpg" alt="烧杯与鸦榨 炼金开场" loading="lazy">
        </div>
        <h3>02 视频简介</h3>
        <video controls playsinline preload="none" poster="${BEAKER_FRONT}" aria-label="烧杯与鸦榨 演示视频"><source src="/assets/works/beaker-crow/demo.mov" type="video/quicktime"></video>
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
