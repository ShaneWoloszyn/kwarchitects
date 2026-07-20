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

/* In-page anchor links (e.g. scroll cue) via Lenis — tiles open the
   lightbox and #start links open the intake modal instead */
document.querySelectorAll('a[href^="#"]:not(.menu__item a):not(.tile):not([href="#start"])').forEach((a) => {
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

  /* Marquee now scrolls continuously via CSS animation (see .marquee__track) */

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

/* ---------- Project intake form (submits to Formspree via AJAX) ---------- */
const intake = document.querySelector('.intake');
if (intake) {
  const done = intake.querySelector('.intake__done');
  const fail = intake.querySelector('.intake__error');
  const submit = intake.querySelector('.intake__submit');

  const showOk = () => {
    intake.querySelectorAll('input, select, textarea, button').forEach((el) => { el.disabled = true; });
    if (fail) fail.hidden = true;
    if (done) { done.hidden = false; if (lenis) lenis.scrollTo(done, { offset: -120 }); else done.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  };

  intake.addEventListener('submit', async (e) => {
    e.preventDefault();                 // HTML5 validation has already passed here
    const endpoint = intake.getAttribute('action') || '';

    /* Demo mode: no real Formspree id yet — confirm visually but don't send. */
    if (!endpoint || endpoint.includes('YOUR_FORM_ID')) {
      console.warn('Intake form: set the form `action` to your Formspree URL to receive submissions. Showing demo confirmation only — nothing was sent.');
      showOk();
      return;
    }

    const label = submit.textContent;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    if (fail) fail.hidden = true;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(intake),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Request failed: ' + res.status);
      showOk();
    } catch (err) {
      submit.disabled = false;
      submit.textContent = label;
      if (fail) fail.hidden = false;
    }
  });
}

/* ---------- Intake form modal ---------- */
const startModal = document.getElementById('startModal');
if (startModal) {
  const closeBtn = startModal.querySelector('.modal__close');

  const openModal = () => {
    startModal.classList.add('open');
    startModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (lenis) lenis.stop();
    const first = startModal.querySelector('input, select, textarea');
    if (first) setTimeout(() => first.focus(), 300);
  };
  const closeModal = () => {
    startModal.classList.remove('open');
    startModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lenis && !document.body.classList.contains('menu-open')) lenis.start();
  };

  /* Every "start a project" trigger: nav pill, About invite, contact CTA */
  document.querySelectorAll('a[href="#start"], [data-open-start]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (document.body.classList.contains('menu-open')) setMenu(false);
      openModal();
    });
  });

  closeBtn.addEventListener('click', closeModal);
  startModal.addEventListener('click', (e) => { if (e.target === startModal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && startModal.classList.contains('open')) closeModal();
  });
}

/* ---------- Lightbox: click a project photo → centered fullscreen ----------
   Supports single images and multi-image galleries (data-gallery on the
   card), plus an optional external link (data-article / data-link with a
   custom label). Arrow keys / on-screen arrows navigate galleries. */
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lbImg = lightbox.querySelector('.lightbox__img');
  const lbCap = lightbox.querySelector('.lightbox__cap');
  const lbCount = lightbox.querySelector('.lightbox__count');
  const lbLink = lightbox.querySelector('.lightbox__link');
  const lbClose = lightbox.querySelector('.lightbox__close');
  const lbPrev = lightbox.querySelector('.lightbox__nav--prev');
  const lbNext = lightbox.querySelector('.lightbox__nav--next');

  let items = [];
  let index = 0;

  const render = () => {
    const item = items[index];
    lbImg.src = item.src;
    lbImg.alt = item.alt || '';
    const many = items.length > 1;
    if (lbCount) {
      lbCount.hidden = !many;
      lbCount.textContent = (index + 1) + ' / ' + items.length;
    }
    if (lbPrev) lbPrev.hidden = !many;
    if (lbNext) lbNext.hidden = !many;
    /* Warm the next image so gallery paging feels instant */
    if (many) { const pre = new Image(); pre.src = items[(index + 1) % items.length].src; }
  };
  const step = (dir) => {
    if (items.length < 2) return;
    index = (index + dir + items.length) % items.length;
    render();
  };

  const openLightbox = (list, caption, link, linkLabel, start = 0) => {
    items = list;
    index = start;
    lbCap.textContent = caption || '';
    if (lbLink) {
      lbLink.hidden = !link;
      if (link) {
        lbLink.href = link;
        lbLink.innerHTML = (linkLabel || 'Read the feature') + ' <span aria-hidden="true">↗</span>';
      }
    }
    render();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    if (lenis) lenis.stop();
    lbClose.focus();
  };
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (lenis && !document.body.classList.contains('menu-open')) lenis.start();
  };

  /* Project tiles (anchors — suppress navigation) */
  document.querySelectorAll('.tile').forEach((tile) => {
    tile.addEventListener('click', (e) => {
      e.preventDefault();
      const img = tile.querySelector('.media__img');
      if (!img) return;
      const name = tile.querySelector('.tile__name');
      const tag = tile.querySelector('.tile__tag');
      const caption = [name && name.textContent.trim(), tag && tag.textContent.trim()].filter(Boolean).join(' — ');
      let list = [{ src: img.currentSrc || img.src, alt: img.alt }];
      if (tile.dataset.gallery) {
        list = tile.dataset.gallery.split(',').map((s, i) => ({
          src: s.trim(),
          alt: (name ? name.textContent.trim() : img.alt) + ' — photo ' + (i + 1),
        }));
      }
      openLightbox(list, caption, tile.dataset.article, tile.dataset.articleLabel);
    });
  });

  /* What-We-Do card photos — may carry a data-gallery list */
  document.querySelectorAll('.work__card .media').forEach((media) => {
    media.addEventListener('click', () => {
      const img = media.querySelector('.media__img');
      if (!img) return;
      const card = media.closest('.work__card');
      const cap = card && card.querySelector('.work__caption');
      const caption = cap ? cap.textContent.trim() : '';
      let list = [{ src: img.currentSrc || img.src, alt: img.alt }];
      if (card && card.dataset.gallery) {
        list = card.dataset.gallery.split(',').map((s, i) => ({
          src: s.trim(),
          alt: (caption || img.alt) + ' — photo ' + (i + 1),
        }));
      }
      openLightbox(list, caption, card && card.dataset.link, card && card.dataset.linkLabel);
    });
  });

  /* Before + After pairs — click either state → both in the lightbox */
  document.querySelectorAll('.ba-pair').forEach((pair) => {
    const cells = [...pair.querySelectorAll('.ba-pair__cell')];
    const name = pair.querySelector('.ba-pair__name');
    cells.forEach((cell, i) => {
      cell.addEventListener('click', () => {
        const list = cells.map((c) => {
          const img = c.querySelector('img');
          return { src: img.currentSrc || img.src, alt: img.alt };
        });
        const caption = (name ? name.textContent.trim() : '') + ' — Before + After';
        openLightbox(list, caption, null, null, i);
      });
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', () => step(-1));
  if (lbNext) lbNext.addEventListener('click', () => step(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
}

/* ---------- Scroll progress hairline (works with or without Lenis) ---------- */
const progressEl = document.querySelector('.progress');
if (progressEl) {
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressEl.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
}

/* Footer year */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Fade in body once everything is wired (avoids FOUC flash) */
requestAnimationFrame(() => document.body.classList.add('is-ready'));
