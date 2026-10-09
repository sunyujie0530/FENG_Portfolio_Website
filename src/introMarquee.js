import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import './introMarquee.css';
import { revealProgress, stripScale } from './introReveal.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

const SCROLL_DISTANCE = 5000;
const SCROLL_DISTANCE_MOBILE = 2800;
const PIXEL_ROWS = 28;

let teardown = () => {};

export function startIntro({ onReveal, onProgress } = {}) {
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
  let playVersion = 0;
  const layer = document.createElement('div');
  layer.className = 'pixel-reveal';
  layer.setAttribute('aria-hidden', 'true');
  const strips = Array.from({ length: PIXEL_ROWS }, () => {
    const strip = document.createElement('i');
    layer.append(strip);
    return strip;
  });
  wrapper.prepend(layer);

  const updateReveal = () => {
    if (opened) return;
    const bounds = text.getBoundingClientRect();
    const progress = revealProgress(bounds.left, bounds.width, window.innerWidth);
    onProgress?.(progress);
    strips.forEach((strip, index) => {
      strip.style.transform = `scaleX(${stripScale(progress, index)})`;
    });
    // Finish when the screen is revealed, not only after passing the pin's end.
    if (progress === 1) {
      const version = playVersion;
      queueMicrotask(() => { if (version === playVersion) reveal(); });
    }
  };

  const clearPinSpacers = () => {
    document.querySelectorAll('.pin-spacer').forEach((spacer) => {
      const pinned = spacer.querySelector('#intro, .intro');
      if (pinned) spacer.replaceWith(pinned);
      else spacer.remove();
    });
  };

  const stop = () => {
    ctx?.revert();
    split?.revert();
    ctx = null;
    split = null;
    clearPinSpacers();
  };

  const reveal = () => {
    if (opened) return;
    opened = true;
    playVersion += 1;
    stop();
    onProgress?.(1);
    document.body.classList.add('is-lockers');
    window.scrollTo(0, 0);
    onReveal?.();
  };

  const play = async () => {
    const version = ++playVersion;
    opened = false;
    stop();
    gsap.set(wrapper, { autoAlpha: 1, clearProps: 'transform' });
    gsap.set(line, { xPercent: 0, clearProps: 'transform' });
    strips.forEach((strip) => { strip.style.transform = 'scaleX(1)'; });
    onProgress?.(reduced ? 1 : 0);
    window.scrollTo(0, 0);

    if (reduced) {
      reveal();
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

    if (version !== playVersion || opened) return;
    ctx = gsap.context(() => {
      split = SplitText.create(text, { type: 'chars,words', charsClass: 'char', wordsClass: 'word' });

      const scrollTween = gsap.to(line, {
        xPercent: -100,
        ease: 'none',
        onUpdate: updateReveal,
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
    playVersion += 1;
    opened = true;
    window.removeEventListener('resize', onResize);
    stop();
    layer.remove();
  };

  startIntro.replay = () => {
    document.body.classList.remove('is-lockers');
    play();
  };
  startIntro.finish = reveal;

  return () => teardown();
}

export function returnToIntro() {
  if (typeof startIntro.replay === 'function') startIntro.replay();
}

export function finishIntro() {
  if (typeof startIntro.finish === 'function') startIntro.finish();
}
