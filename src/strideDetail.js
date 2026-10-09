export const STRIDE_FRONT = '/assets/works/stride/front.jpg';
export const STRIDE_BACK = '/assets/works/stride/back.jpg';

export function createStrideDetail(onBack) {
  const panel = document.createElement('article');
  panel.className = 'work-detail bcw-detail';
  panel.hidden = true;
  panel.setAttribute('aria-label', '迈步 作品详情');
  panel.innerHTML = `
    <button class="work-detail__back" type="button">← 返回全部作品</button>
    <div class="bcw-layout">
      <header class="bcw-author"><h1 tabindex="-1">LI RUOHAN</h1><h2>李若晗 2025级硕士</h2></header>
      <h3 class="bcw-section">01 作品简介</h3>
      <div class="work-detail__copy bcw-copy">
        <p>这是一部 AIGC 动画短片，整体采用写实影像与复古像素艺术相结合的视觉风格，在现实与幻想的交错中，呈现当代青年面对人生选择时的焦虑与迷茫。</p>
        <p>深夜加班后，疲惫不堪的青年坐上回家的地铁。闭上双眼，焦虑、疲惫与困惑如噩梦般袭来；再次睁眼，他已来到一片陌生的像素世界。沙滩上矗立着无数扇门，有人在门前犹豫不决，有人被人群裹挟着推入其中。青年执着于寻找唯一“正确”的选择，却因过度思考而逐渐沉入象征迷茫的海底。</p>
        <p>回到人潮涌动的写实地铁，每个人都拥有属于自己的色彩，而摇摆的人不断被他人的颜色浸染，渐渐失去自我。直到一个坚定做自己的人出现，以行动给予他勇气。短片借由 AI 生成影像的现实质感、像素化场景与色彩变化，表达关于选择与成长的思考：人生未必存在标准答案，与其困在思考中等待确定，不如勇敢迈出第一步——行动本身，就是一种答案。</p>
      </div>
      <div class="bcw-media">
        <div class="work-detail__gallery">
          <img src="${STRIDE_FRONT}" alt="迈步 像素门扉海滩" loading="lazy">
          <img src="${STRIDE_BACK}" alt="迈步 地铁人潮" loading="lazy">
        </div>
        <h3>02 视频简介</h3>
        <video controls playsinline preload="none" poster="${STRIDE_BACK}" aria-label="迈步 短片"><source src="/assets/works/stride/demo.mp4" type="video/mp4"></video>
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
