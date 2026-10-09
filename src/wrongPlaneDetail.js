export function createWrongPlaneDetail(onBack) {
  const panel = document.createElement('article');
  panel.className = 'work-detail bcw-detail';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Wrong Plane 作品详情');
  panel.innerHTML = `
    <button class="work-detail__back" type="button">← 返回全部作品</button>
    <div class="bcw-layout">
      <header class="bcw-author"><h1 tabindex="-1">WANG WENRUI</h1><h2>王文睿 2025级硕士</h2></header>
      <h3 class="bcw-section">01 作品简介</h3>
      <div class="work-detail__copy bcw-copy">
        <p>这是一款可以在2D与3D之间切换的平台跳跃游戏。玩家在3D模式下调整角色朝向，决定场景转换后对应的2D平面；切换至2D模式后，角色便沿着选定的平面移动和跳跃。由于朝向不同，同一组平台在2D模式下的位置关系也会发生变化。</p>
        <p>玩家需要在3D模式下寻找合适的方向，再切换到2D模式越过障碍；必要时返回3D模式重新调整朝向，继续寻找路径。通过交替使用两种模式，玩家最终到达门洞，进入下一关。</p>
      </div>
      <div class="bcw-media">
        <div class="work-detail__gallery">
          <img src="/assets/works/wrong-plane/scene-1.png" alt="Wrong Plane 2D 平面跳跃" loading="lazy">
          <img src="/assets/works/wrong-plane/scene-2.png" alt="Wrong Plane 3D 平台" loading="lazy">
          <img src="/assets/works/wrong-plane/scene-3.png" alt="Wrong Plane 红色平面" loading="lazy">
        </div>
        <h3>02 视频简介</h3>
        <video controls playsinline preload="none" poster="/assets/works/wrong-plane/scene-3.png" aria-label="Wrong Plane 演示视频"><source src="/assets/works/wrong-plane/demo.mp4" type="video/mp4"></video>
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
