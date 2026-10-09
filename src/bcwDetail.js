export const BCW_BACK = '/assets/works/blind-can-walk/back.png';

export function createBcwDetail(onBack) {
  const panel = document.createElement('article');
  panel.className = 'work-detail bcw-detail';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Blind Can Walk 作品详情');
  panel.innerHTML = `
    <button class="work-detail__back" type="button">← 返回全部作品</button>
    <div class="bcw-layout">
      <header class="bcw-author"><h1 tabindex="-1">WANG WENRUI  CHEN JIAWEI</h1><h2>王文睿 陈嘉伟 2025级硕士</h2><p class="bcw-roles">王文睿：策划、关卡、程序　策划：陈嘉伟</p></header>
      <h3 class="bcw-section">01 作品简介</h3>
      <div class="work-detail__copy bcw-copy">
        <p>这是一款本地双人合作闯关游戏。两名玩家分别通过PC和VR扮演一位盲人和一位行动不便的人。PC玩家眼前几乎一片漆黑，只能看见身边物体的轮廓；VR玩家能够看清周围环境，也可以用双手抓取物品，却无法独自行走，只能由PC玩家背着前进。</p>
        <p>两人需要结合各自的能力：VR玩家观察环境、指引方向并抓取物品，PC玩家则根据同伴的提示，背着两人向前移动。但合作未必总是顺利：一句没说清的指令、一次会错意的行动，都可能让彼此给对方添乱，也让闯关过程出现意想不到的好笑瞬间。玩家将在互相帮助与偶尔“坑队友”之间摸索默契，一起抵达终点。</p>
      </div>
      <div class="bcw-media">
        <div class="work-detail__gallery">
          <img src="/assets/works/blind-can-walk/scene-1.png" alt="Blind Can Walk 操作指引场景" loading="lazy">
          <img src="${BCW_BACK}" alt="Blind Can Walk 悬浮道具场景" loading="lazy">
          <img src="/assets/works/blind-can-walk/scene-3.png" alt="Blind Can Walk 双人协作场景" loading="lazy">
        </div>
        <h3>02 视频简介</h3>
        <video controls playsinline preload="none" poster="${BCW_BACK}" aria-label="Blind Can Walk 游戏演示"><source src="/assets/works/blind-can-walk/demo.mp4" type="video/mp4"></video>
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
    // Move the same heading to the center, without changing or cloning its text.
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
