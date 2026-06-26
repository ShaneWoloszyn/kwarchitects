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

  /* Generic line reveals (intro + future sections) */
  gsap.utils.toArray('.reveal-line').forEach((line) => {
    const inner = line.firstChild;
    gsap.from(line, {
      yPercent: 100,
      opacity: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: line, start: 'top 88%' },
    });
  });
}

/* Fade in body once everything is wired (avoids FOUC flash) */
requestAnimationFrame(() => document.body.classList.add('is-ready'));
