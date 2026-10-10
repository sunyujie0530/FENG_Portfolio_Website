import './introMarquee.css';

export function startIntro({ onReveal } = {}) {
  const wrapper = document.querySelector('#intro');
  const enter = document.querySelector('.intro__enter');
  if (!wrapper || !enter) return () => {};

  let opened = false;
  const reveal = (event) => {
    if (opened) return;
    opened = true;
    document.body.classList.add('is-lockers');
    onReveal?.(Boolean(event));
  };

  enter.addEventListener('click', reveal);
  const teardown = () => {
    enter.removeEventListener('click', reveal);
  };
  startIntro.finish = reveal;
  return teardown;
}

export function finishIntro() {
  startIntro.finish?.();
}
