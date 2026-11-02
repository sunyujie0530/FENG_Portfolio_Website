// Reuse Chen Jiawei's hero/content layout without replacing each work's content.
export function standardWorkLayout(panel, index) {
  const author = panel.querySelector('.bcw-author');
  if (!author) return panel;
  const copy = panel.querySelector('.bcw-copy');
  const media = panel.querySelector('.bcw-media');
  const heading = panel.querySelector('.bcw-section');
  const back = panel.querySelector('.work-detail__back');
  const hero = document.createElement('section');
  hero.className = 'work-detail__hero';
  const intro = document.createElement('div');
  intro.className = 'work-detail__intro';
  const content = document.createElement('section');
  content.className = 'work-detail__content';
  content.id = `work-content-${index}`;
  const header = document.createElement('header');
  const name = document.createElement('h2');
  name.textContent = author.querySelector('h1').textContent;
  const subtitle = document.createElement('p');
  subtitle.textContent = author.querySelector('h2').textContent;
  header.append(name, subtitle);
  copy.classList.remove('bcw-copy');
  heading.classList.remove('bcw-section');
  const introCopy = copy.cloneNode(true);
  const down = document.createElement('a');
  down.className = 'work-detail__down scroll-more';
  down.href = `#${content.id}`;
  down.textContent = '滑动查看更多';
  down.addEventListener('click', event => {
    event.preventDefault();
    panel.scrollTo({ top: panel.clientHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  intro.append(...author.childNodes, introCopy, down);
  hero.append(intro);
  const body = document.createElement('div');
  body.className = 'work-detail__body';
  body.append(heading, copy, ...media.childNodes);
  content.append(header, body);
  panel.replaceChildren(back, hero, content);
  panel.classList.remove('bcw-detail');
  panel.updateLayout = undefined;
  return panel;
}
