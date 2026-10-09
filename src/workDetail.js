import './workDetail.css';

export const CLAY_BACK = '/assets/works/clay-doll/back.png';
const paragraphs = [
  '“泥人张”是中国天津极具代表性的民间艺术门类，距今已有百余年的历史。它不仅是民间手工技艺的结晶，更是天津文化的重要象征。随着时代的发展，这一传统艺术逐渐面临传承与传播的困境。年轻一代对其了解有限，而线下体验泥塑的机会亦较少。',
  '在此背景下，我们团队在准备本次功能游戏作品时，希望能借助游戏这一媒介，把传统的泥塑技艺以一种更容易被接受的方式呈现出来。本次游戏设计以“功能游戏”的设计思路为引导，通过沉浸式互动与分关卡体验，模拟泥人张的制作全过程，让玩家在娱乐中感受民间艺术的独特魅力，理解其背后的文化价值，从而实现“寓教于乐、寓艺于玩”的功能目标。',
];

export function createWorkDetail(onBack) {
  const panel = document.createElement('article');
  panel.className = 'work-detail';
  panel.hidden = true;
  panel.setAttribute('aria-label', '泥人张作品详情');
  const copy = paragraphs.map((text) => `<p>${text}</p>`).join('');
  panel.innerHTML = `
    <button class="work-detail__back" type="button">← 返回全部作品</button>
    <section class="work-detail__hero">
      <div class="work-detail__intro">
        <h1 tabindex="-1">CHENJIAWEI</h1>
        <h2>陈嘉伟 2025级硕士</h2>
        <div class="work-detail__copy">${copy}</div>
        <a class="work-detail__down" href="#clay-content">向下探索作品 ↓</a>
      </div>
    </section>
    <section class="work-detail__content" id="clay-content">
      <header><h2>CHENJIAWEI</h2><p>陈嘉伟 2025级硕士</p></header>
      <div class="work-detail__body">
        <h3>01 作品简介</h3>
        <div class="work-detail__copy">${copy}</div>
        <div class="work-detail__gallery">
          <img src="/assets/works/clay-doll/visual-2.png" alt="泥人张游戏中的茶室场景" loading="lazy">
          <img src="/assets/works/clay-doll/visual-3.png" alt="泥人张游戏中的庭院场景" loading="lazy">
          <img src="/assets/works/clay-doll/key-visual.png" alt="泥人张指尖塑梦主视觉" loading="lazy">
        </div>
        <h3>02 视频简介</h3>
        <img class="work-detail__poster" src="/assets/works/clay-doll/key-visual.png" alt="泥人张指尖塑梦视频封面，视频待补充" loading="lazy">
      </div>
    </section>`;
  document.querySelector('#works').append(panel);
  panel.querySelector('button').addEventListener('click', onBack);
  panel.querySelector('a').addEventListener('click', (event) => {
    event.preventDefault();
    panel.scrollTo({ top: innerHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  return panel;
}
