import { escapeHtml as e } from './submissionData.js';

export function publishedDetail(work, backLabel) {
  return `<article class="published-detail"><button class="text-link" type="button" data-published-back>← 返回${e(backLabel)}</button>
    <p class="page-guide">全部作品 / 作品详情</p><h1 tabindex="-1">${e(work.title)}</h1>
    <p><a href="/creators/${e(work.creatorId)}">${e(work.authorName)} · ${e(work.authorGrade)}</a> · ${e(work.year)}</p>
    <img class="published-cover" src="${e(work.cover)}" alt="${e(work.title)}封面">
    <h2>作品简介</h2><p class="published-copy">${e(work.summary)}</p><p>${e(work.roles)}</p>
    <div class="published-gallery">${work.files.filter(file => file.kind === 'gallery').map(file => `<img src="${e(file.url)}" alt="${e(work.title)}展示图片" loading="lazy">`).join('')}</div>
    ${work.files.filter(file => file.kind === 'document').map(file => `<a class="text-link" href="${e(file.url)}" target="_blank" rel="noopener noreferrer">下载作品 PDF ↗</a>`).join('')}</article>`;
}
export function creatorView(works, renderCard) {
  const author = works[0];
  return `<a class="back-link" href="/works">← 返回全部作品</a><p class="page-guide">创作者 / ${e(author.authorName)}</p>
    <header class="collection-heading"><div><h1 tabindex="-1">${e(author.authorName)}</h1><p>${e(author.authorGrade)} · ${works.length} 件已发布作品</p></div></header>
    <div class="project-grid" id="project-results">${works.map(renderCard).join('')}</div>`;
}
