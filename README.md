# KW Architects PC — marketing site

A quiet, image-forward single-page site for KW Architects PC, an award-winning
architecture firm in Wells, Maine. Coastal New England mood: soft sand, fog grey,
driftwood, sea-glass green, deep slate. The photography does the talking.

## Stack
- Vanilla HTML / CSS / JS — no build step
- [Lenis](https://github.com/darkroomengineering/lenis) — inertia smooth scroll
- [GSAP + ScrollTrigger](https://gsap.com/) — parallax & scroll-driven reveals
- Fonts: **Archivo** (clean modern display/wordmark) + **Inter** (sans), via Google Fonts

Motion libraries are **vendored** in `js/vendor/` (no CDN dependency), so the
site runs fully offline. To refresh them: `npm install` then re-copy the
`dist/*.min.js` files. `node_modules/` is gitignored.

## Run locally
```bash
python3 -m http.server 8011
# open http://localhost:8011
```
Respects `prefers-reduced-motion` — all animation is disabled and content
shown statically when the user prefers reduced motion.

## Swapping in real photography
Placeholder images are Unsplash URLs marked with the `swap` class and carry an
`onerror` gradient fallback. Search for `class="... swap"` in `index.html` and
replace the `src` with final assets (drop files in `assets/img/`). Recommended:
full-bleed 2000px+ wide, warm/muted coastal grade.

## Sections
1. Hero — wordmark + tagline, parallax media, scroll cue
2. Intro line
3. Marquee — Design · Coastal · Maine · New Hampshire · Lake Front (scroll-reactive)
4. What We Do — Residential / Commercial, asymmetric pair
5. Selected Projects — asymmetric grid, hover scale + scroll parallax
6. Process — four numbered steps
7. About — firm logo, overview, Passive House (CPHC®) callout, team bios, closing copy
8. Contact / footer — two columns: get-in-touch (studio + mailing address, email,
   phone, Facebook/Instagram) on the left, project intake form on the right

## Project intake form
The intake form lives in the right column of the contact section and submits to
**Formspree** via AJAX (graceful inline confirmation; native POST fallback if JS is
off). **Before launch:** create a free form at https://formspree.io and replace
`YOUR_FORM_ID` in the form's `action` in `index.html`. Until then it runs in demo
mode (shows the thank-you message, logs a console warning, sends nothing).

> **Note:** The Voices/testimonials section was removed; its CSS (`.voices`,
> `.quote`) is left in place in case client quotes are added back later.
