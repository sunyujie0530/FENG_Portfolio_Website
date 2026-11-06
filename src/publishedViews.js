import { escapeHtml as e } from './submissionData.js';

export function publishedDetail(work, backLabel) {
  const copy = String(work.summary || '').split(/\n+/).filter(Boolean).map(text => `<p>${e(text)}</p>`).join('');
  const credit = `${e(work.authorName)} · ${e(work.authorGrade)} · ${e(work.year)}`;
  const images = [{ kind:'cover', url:work.cover }, ...work.files.filter(file => file.kind === 'gallery')];
  const gallery = Array.from({length:Math.ceil(images.length / 3)}, (_, row) => `<div class="work-detail__gallery">${images.slice(row * 3,row * 3 + 3).map((file,i) => `<img src="${e(file.url)}" alt="${e(work.title)}展示图片 ${row * 3 + i + 1}" loading="lazy">`).join('')}</div>`).join('');
  return `<button class="work-detail__back" type="button">← 返回${e(backLabel)}</button>
    <section class="work-detail__hero"><div class="work-detail__intro">
      <p class="page-guide">作品详情 / ${e(work.title)}</p><h1 tabindex="-1">${e(work.title)}</h1>
      <h2><a href="/creators/${e(work.creatorId)}">${credit}</a></h2><p class="bcw-roles">${e(work.roles)}</p>
      <div class="work-detail__copy">${copy}</div><a class="work-detail__down scroll-more" href="#published-content">滑动查看更多</a>
    </div></section>
    <section class="work-detail__content" id="published-content"><header><h2>${e(work.title)}</h2><p>${credit}</p></header>
      <div class="work-detail__body"><h3>01 作品简介</h3><div class="work-detail__copy">${copy}</div>${gallery}
      ${work.files.filter(file => file.kind === 'document').map(file => `<a class="text-link" href="${e(file.url)}" target="_blank" rel="noopener noreferrer">下载作品 PDF ↗</a>`).join('')}</div>
    </section>`;
}

export function createPublishedDetail(work, onBack) {
  const panel = document.createElement('article');
  panel.className = 'work-detail';
  panel.hidden = true;
  panel.setAttribute('aria-label', `${work.title}作品详情`);
  panel.innerHTML = publishedDetail(work, '全部作品');
  panel.querySelector('.work-detail__back').addEventListener('click',onBack);
  panel.querySelector('.work-detail__down').addEventListener('click',event => {
    event.preventDefault();
    panel.scrollTo({top:panel.querySelector('.work-detail__content').offsetTop,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  document.querySelector('#works').append(panel);
  return panel;
}

export function creatorView(works, renderCard) {
  const author = works[0];
  return `<a class="back-link" href="/works">← 返回全部作品</a><p class="page-guide">创作者 / ${e(author.authorName)}</p>
    <header class="collection-heading"><div><h1 tabindex="-1">${e(author.authorName)}</h1><p>${e(author.authorGrade)} · ${works.length} 件已发布作品</p></div></header>
    <div class="project-grid" id="project-results">${works.map(renderCard).join('')}</div>`;
}
