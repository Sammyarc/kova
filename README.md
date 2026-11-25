# Day 11 — Kova

A landing page for Kova, a fictional bank for people who live between two countries: paid in pounds, sending naira home, saving in dollars. It is built from the Day 11 reference in [../reference/](../reference/kova-reference.png), which was designed for this project.

Kova, its members, quotes, rates, fees and figures are invented. Exchange rates are sample values. Every form and button is a browser-only preview: nothing is sent and no account is opened.

## Run

Requires Node.js 18 or newer. There is no build step.

```sh
cd Day-11/kova
npm start            # http://127.0.0.1:4414
```

## Brand

- **Logo:** two interlocking rings, cream and mint, on a deep-green rounded tile. One ring for each home, linked by one account. Each ring passes over the other once, with a small gap at both crossings. The wordmark is lowercase Plus Jakarta Sans ExtraBold with tight tracking. The mark lives in [assets/icons/favicon.svg](assets/icons/favicon.svg) and as the `#logo-mark` symbol in the page.
- **Colour:** flat, with no gradients. Cream `#f6f2ec`, ink `#16131d` and white, with deep green `#155e3d` as the only accent and mint `#a6dfbd` for highlights on dark surfaces.
- **Type:** Plus Jakarta Sans 400 to 800, self-hosted as two variable subsets (Latin and Latin Extended, which carries the ₦ sign). OFL licence in `assets/fonts/`. Headings are two-tone, ink then grey, and nothing is set in italics.

## Sections

| Section | Notes |
| --- | --- |
| Header | Logo, a pill nav whose ink highlight slides to the hovered link or the section in view, **Log in** and **Open an account**. Transparent at the top, cream once you scroll. Below 1024px it becomes a full-screen menu. |
| Hero | The headline, intro, two buttons and member stats beside a photo with floating app cards: total balance, the GBP to NGN rate, a completed transfer and a savings goal. |
| Press | A slow marquee of invented publication names that pauses on hover. |
| Send home | A dark panel with a working converter and a comparison table. |
| Features | A bento grid covering currency wallets, cards, savings pots, Face ID, bills back home and a weekly spending chart. |
| Savings | A photo and a savings calculator. |
| Get started | Three steps, each with a phone screen. |
| Pricing | Three plans with card designs and a monthly/yearly switch. |
| Members | A rating panel, two photo reviews and a strip of security points. |
| FAQ | A sticky intro beside native `<details>` questions. |
| CTA and footer | A green call-to-action band with a phone, then a dark footer. The footer ends with a full-width **kova** wordmark whose lower half is cut off by the bottom of the page. |

## Motion and micro-interactions

[assets/js/site-core.js](assets/js/site-core.js) is the shared motion and UI core used by Teeline and the other days. Here it runs:

- the hero intro
- staggered reveals and photo zoom-ins
- Lenis smooth scroll, loaded when the browser is idle
- the menu and the demo dialog
- the rate-alert form
- the wordmark fit

[script.js](script.js) adds the page's own interactions:

- **Nav pill:** slides between links on hover and keyboard focus, and follows the section in view.
- **Hero cards:**
  - They bob gently on their own timings.
  - On desktop they drift with the pointer at different depths.
  - The balance counts up after the intro.
  - The rate sparkline draws itself and the savings ring fills.
- **Live rate:** every few seconds the GBP to NGN rate drifts slightly within a narrow band. The hero card and the converter's comparison figures flash mint when it changes.
- **Converter:**
  - Both amounts can be edited, and each updates the other.
  - The swap icon turns to show which side you're editing.
  - The currency (NGN, GHS, KES) and delivery method update the fee, arrival time, send button and comparison table.
- **In view:**
  - The savings-pot bars fill and the spending chart grows when they scroll into view.
  - The Face ID tiles scan while visible.
- **Hover:**
  - Cards lift, and the virtual cards fan apart.
  - Plan cards tilt.
  - The FAQ icon turns into a close mark, and footer links get a sliding underline.
- **Savings calculator:** a $50 to $2,000 slider projects 1, 3 and 5 years at 4.6% AER, compounded monthly.
- **Billing switch:** monthly or yearly prices swap in with a short slide.
- **Footer wordmark:** sized to fill the width, it rises into place as the footer scrolls in.

Only `transform`, `opacity` and colour are animated. Under `prefers-reduced-motion` the bobbing, parallax, count-up, rate tick, marquee and wordmark rise all stay off, and every element simply renders.

## Verify

Keep `npm start` running, then run `npm run verify`. It uses Playwright and axe-core, with Day 06's install as a fallback. [scripts/verify.mjs](scripts/verify.mjs), set up by [verify.config.mjs](scripts/verify.config.mjs), checks:

- horizontal overflow every 20px from 320 to 1920
- that the hero fits one screen with no overlaps, at 12 window shapes
- reduced motion
- 12px text and 44px tap targets at six widths
- WCAG 2.1 AA at 390 and 1440
- that the intro, Lenis and every reveal complete with motion on
- the dialog and the mobile menu
- the converter, the savings calculator, the billing switch, the nav pill and the footer wordmark

`npm run icons` regenerates the favicons and the 1200×630 share image from the running page.

## Deploy

The page is static; upload the folder. Before publishing, replace `https://kova.example.com/` in the four absolute URLs at the top of [index.html](index.html). Photo credits are in [assets/PHOTOS.md](assets/PHOTOS.md).
