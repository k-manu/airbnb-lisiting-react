---
name: perf-cwv-check
description: Optimize Core Web Vitals (LCP, INP, CLS), font rendering, responsive image loading and client bundle size. Use when a change touches images, fonts, overlays or client-side state.
---

# Performance and Core Web Vitals check

Pairs with the `performance-cwv-optimizer` agent.

## Procedure
1. Measure on a production build (`npm run build && npm start`), not the dev server, using the DevTools Performance panel or Lighthouse.
2. **LCP.** The hero photo grid loads with high fetch priority. The typeface is hosted locally (`public/Airbnb.woff2`) through `next/font/local` with `display: "swap"`.
3. **INP.** Overlay transitions use transforms and opacity, not layout properties. Defer non-critical state work with React transitions where it helps.
4. **CLS.** Media containers keep explicit aspect ratios (for example the hero at `1120 / 494`) so nothing reflows when images load.
5. **Bundle.** Keep interactive code in client components only where needed; check that a server-only change does not grow the client bundle.
6. Re-check the pixel bands afterwards (`pixel-diff-bands`) so a performance change did not move the layout.

## Output
The three vitals before and after, and the change that moved each.
