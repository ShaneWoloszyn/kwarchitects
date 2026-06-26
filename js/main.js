/* =========================================================
   KW ARCHITECTS — motion
   Lenis smooth scroll + GSAP ScrollTrigger
   ========================================================= */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Smooth scroll (Lenis) ---------- */
let lenis;
if (!reduceMotion && window.Lenis) {
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4,
  });

  window.lenis = lenis;
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  if (window.gsap && window.ScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}

/* ---------- Overlay menu ---------- */
const body = document.body;
const toggle = document.getElementById('menuToggle');
const menu = document.getElementById('menu');

function setMenu(open) {
  body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.setAttribute('aria-hidden', String(!open));
  toggle.querySelector('.nav__toggle-label').textContent = open ? 'Close' : 'Menu';
  if (lenis) open ? lenis.stop() : lenis.start();
}

toggle.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));

menu.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    setMenu(false);
    if (target && lenis) { e.preventDefault(); lenis.scrollTo(target, { offset: 0, duration: 1.3 }); }
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && body.classList.contains('menu-open')) setMenu(false);
});

/* In-page anchor links (e.g. scroll cue) via Lenis */
document.querySelectorAll('a[href^="#"]:not(.menu__item a)').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id === '#' || id === '#top') return;
    const target = document.querySelector(id);
    if (target && lenis) { e.preventDefault(); lenis.scrollTo(target, { duration: 1.3 }); }
  });
});

/* ---------- GSAP motion ---------- */
if (window.gsap && window.ScrollTrigger && !reduceMotion) {
  gsap.registerPlugin(ScrollTrigger);

  /* Hero entrance — staggered reveal */
  const heroReveals = gsap.utils.toArray('.hero .reveal');
  gsap.set(heroReveals, { yPercent: 110, opacity: 0 });
  gsap.to(heroReveals, {
    yPercent: 0,
    opacity: 1,
    duration: 1.3,
    ease: 'expo.out',
    stagger: 0.12,
    delay: 0.25,
  });

  /* Hero parallax — image drifts slower than scroll */
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.speed) || 0.18;
    gsap.to(el, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('section') || el,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  /* Generic line reveals (intro) */
  gsap.utils.toArray('.reveal-line').forEach((line) => {
    gsap.from(line, {
      yPercent: 100,
      opacity: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: line, start: 'top 88%' },
    });
  });

  /* Section fade/slide reveals — batched so grids stagger naturally */
  ScrollTrigger.batch('.reveal-fade', {
    start: 'top 86%',
    onEnter: (els) => gsap.to(els, {
      y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.09, overwrite: true,
    }),
  });
  gsap.set('.reveal-fade', { y: 42, opacity: 0 });

  /* Marquee — drifts left, nudged by scroll velocity */
  const track = document.querySelector('.marquee__track');
  if (track) {
    const half = track.scrollWidth / 2;
    let x = 0;
    gsap.ticker.add(() => {
      x -= 0.6 + Math.abs(lenis ? lenis.velocity : 0) * 0.25;
      if (-x >= half) x = 0;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  }

  /* Subtle parallax inside project/work media on scroll */
  gsap.utils.toArray('[data-tilt] .media__img').forEach((img) => {
    gsap.fromTo(img, { yPercent: -4 }, {
      yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: img.closest('.media'), start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  /* Project tile hover — image scales (GSAP composes it with the scroll parallax) */
  if (window.matchMedia('(hover: hover)').matches) {
    gsap.utils.toArray('.tile').forEach((tile) => {
      const img = tile.querySelector('.media__img');
      if (!img) return;
      tile.addEventListener('mouseenter', () => gsap.to(img, { scale: 1.06, duration: 0.9, ease: 'expo.out' }));
      tile.addEventListener('mouseleave', () => gsap.to(img, { scale: 1, duration: 0.9, ease: 'expo.out' }));
    });
  }
} else {
  /* Reduced motion / no GSAP — ensure content is visible */
  document.querySelectorAll('.reveal, .reveal-fade, .reveal-line').forEach((el) => {
    el.style.opacity = 1; el.style.transform = 'none';
  });
}

/* Footer year */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Fade in body once everything is wired (avoids FOUC flash) */
requestAnimationFrame(() => document.body.classList.add('is-ready'));
