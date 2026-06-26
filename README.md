# KW Architects PC — marketing site

A quiet, image-forward single-page site for KW Architects PC, an award-winning
architecture firm in Wells, Maine. Coastal New England mood: soft sand, fog grey,
driftwood, sea-glass green, deep slate. The photography does the talking.

## Stack
- Vanilla HTML / CSS / JS — no build step
- [Lenis](https://github.com/darkroomengineering/lenis) — inertia smooth scroll
- [GSAP + ScrollTrigger](https://gsap.com/) — parallax & scroll-driven reveals
- Fonts: **Fraunces** (display serif) + **Inter** (sans), via Google Fonts

## Run locally
```bash
python3 -m http.server 8011
# open http://localhost:8011
```

## Swapping in real photography
Placeholder images are Unsplash URLs marked with the `swap` class and carry an
`onerror` gradient fallback. Search for `class="... swap"` in `index.html` and
replace the `src` with final assets (drop files in `assets/img/`). Recommended:
full-bleed 2000px+ wide, warm/muted coastal grade.

## Sections
1. Hero — wordmark + tagline (built)
2. Intro line (built)
3. What We Do — Commercial / Residential *(pending)*
4. Selected Projects — asymmetric grid *(pending)*
5. Process — four numbered steps *(pending)*
6. Voices — testimonials *(pending)*
7. Contact / footer *(pending)*
