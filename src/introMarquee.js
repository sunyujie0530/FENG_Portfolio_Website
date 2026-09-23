import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import './introMarquee.css';

gsap.registerPlugin(ScrollTrigger, SplitText);

const SCROLL_DISTANCE = 5000;
const SCROLL_DISTANCE_MOBILE = 2800;
const PIXEL_COLS = 48;
const PIXEL_ROWS = 28;

let teardown = () => {};

export function startIntro({ onReveal } = {}) {
  const wrapper = document.querySelector('#intro');
  const line = document.querySelector('.intro__line');
  const text = document.querySelector('.intro__text');
  const stage = document.querySelector('#stage');
  if (!wrapper || !line || !text || !stage) return () => {};

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 768px)').matches;
  const yJitter = mobile ? 80 : 200;
  const rotJitter = mobile ? 8 : 20;
  const endDistance = mobile ? SCROLL_DISTANCE_MOBILE : SCROLL_DISTANCE;

  let split;
  let ctx;
  let opened = false;

  const stop = () => {
    ctx?.revert();
    split?.revert();
    ctx = null;
    split = null;
  };

  const reveal = () => {
    if (opened) return;
    opened = true;
    stop();
    pixelReveal(() => {
      document.body.classList.add('is-lockers');
      window.scrollTo(0, 0);
      onReveal?.();
    });
  };

  const play = async () => {
    opened = false;
    stop();
    gsap.set(wrapper, { autoAlpha: 1, clearProps: 'transform' });
    gsap.set(line, { xPercent: 0, clearProps: 'transform' });
    window.scrollTo(0, 0);

    if (reduced) {
      document.body.classList.add('is-lockers');
      onReveal?.();
      return;
    }

    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 1200))
      ]);
    } catch {
      /* keep going with fallback metrics */
    }

    ctx = gsap.context(() => {
      split = SplitText.create(text, { type: 'chars,words', charsClass: 'char', wordsClass: 'word' });

      const scrollTween = gsap.to(line, {
        xPercent: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          pin: true,
          scrub: true,
          end: `+=${endDistance}`,
          invalidateOnRefresh: true,
          onLeave: reveal
        }
      });

      split.chars.forEach((char) => {
        gsap.from(char, {
          yPercent: `random(-${yJitter}, ${yJitter})`,
          rotation: `random(-${rotJitter}, ${rotJitter})`,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: char,
            containerAnimation: scrollTween,
            start: 'left 100%',
            end: 'left 30%',
            scrub: 1
          }
        });
      });
    }, wrapper);

    ScrollTrigger.refresh();
  };

  play();

  const onResize = () => ScrollTrigger.refresh();
  window.addEventListener('resize', onResize);

  teardown = () => {
    window.removeEventListener('resize', onResize);
    stop();
  };

  startIntro.replay = () => {
    document.body.classList.remove('is-lockers');
    document.querySelector('.pixel-reveal')?.remove();
    play();
  };

  return () => teardown();
}

export function returnToIntro() {
  if (typeof startIntro.replay === 'function') startIntro.replay();
}

function pixelReveal(onDone) {
  const layer = document.createElement('div');
  layer.className = 'pixel-reveal';
  layer.style.setProperty('--cols', PIXEL_COLS);
  layer.style.setProperty('--rows', PIXEL_ROWS);
  const cells = [];
  for (let i = 0; i < PIXEL_COLS * PIXEL_ROWS; i += 1) {
    const cell = document.createElement('i');
    cells.push(cell);
    layer.append(cell);
  }
  document.body.append(layer);

  gsap.set('#intro', { autoAlpha: 0 });
  const order = cells
    .map((cell, i) => ({ cell, t: ((i * 37 + 17) * 13) % 1000 }))
    .sort((a, b) => a.t - b.t)
    .map((item) => item.cell);

  gsap.to(order, {
    opacity: 0,
    duration: 0.01,
    ease: 'none',
    stagger: { each: 0.0018 },
    onComplete() {
      layer.remove();
      onDone();
    }
  });
}