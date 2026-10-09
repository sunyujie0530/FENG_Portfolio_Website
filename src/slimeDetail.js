export const SLIME_BACK = '/assets/works/slime-runner/back.png';

export function createSlimeDetail(onBack) {
  const panel = document.createElement('article');
  panel.className = 'work-detail bcw-detail';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'SLIME RUNNER 作品详情');
  panel.innerHTML = `
    <button class="work-detail__back" type="button">← 返回全部作品</button>
    <div class="bcw-layout">
      <header class="bcw-author"><h1 tabindex="-1">YANG YIKUN</h1><h2>杨沂锟 2026级硕士</h2></header>
      <h3 class="bcw-section">01 作品简介</h3>
      <div class="work-detail__copy bcw-copy">
        <p>《SLIME RUNNER》是一款以音乐节奏驱动关卡空间的横版节奏平台游戏。游戏将音乐从传统背景元素转化为关卡的“时间标尺”：BPM决定角色移动速度，并进一步对应平台长度、障碍间距、收集物位置与动作节奏，使音乐、空间与操作形成统一的节奏系统。玩家需要操控史莱姆持续向前奔跑，通过短跳、标准跳跃与滑翔等动作跨越障碍，并依据金币、钻石及场景提示判断下一拍的行动时机。</p>
        <p>当前关卡以160 BPM为基础，一拍对应200 UE移动距离，四拍构成一个基础关卡模块，使跳跃与平台布局具有明确的节拍关系。游戏同时结合检查点、死亡复活与音乐进度同步机制，保证失败后的节奏连续性，并通过操作音效和收集反馈强化玩家对拍点、风险与奖励的感知。整体设计强调“听得见节奏、看得懂空间、做得出动作”的核心体验。</p>
      </div>
      <div class="bcw-media">
        <div class="work-detail__gallery">
          <img src="/assets/works/slime-runner/scene-1.png" alt="SLIME RUNNER 城市夜景关卡" loading="lazy">
          <img src="/assets/works/slime-runner/scene-2.png" alt="SLIME RUNNER 线框眼镜关卡" loading="lazy">
          <img src="/assets/works/slime-runner/scene-3.png" alt="SLIME RUNNER 开始菜单" loading="lazy">
        </div>
        <h3>02 视频简介</h3>
        <video controls playsinline preload="none" poster="${SLIME_BACK}" aria-label="SLIME RUNNER 演示视频"><source src="/assets/works/slime-runner/demo.mp4" type="video/mp4"></video>
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
