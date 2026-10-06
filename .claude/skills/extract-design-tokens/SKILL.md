---
name: extract-design-tokens
description: Translate live Chrome computed styles into a normalized design token architecture in design/tokens.md and the Tailwind v4 theme CSS. Use when measuring the reference's typography, spacing, colour, radius, shadow or layout values.
---

# Extract design tokens (clean-room)

Pairs with the `design-token-extractor` agent.

## Procedure
1. Attach to the live reference with Claude-in-Chrome. Headless clients get an HTTP 429 checkpoint, so do not script against the live URL.
2. Read **rendered values only**: computed styles and bounding rects. Use `scripts/spec/measure-page.js` for geometry and `node scripts/spec/styles.mjs <url> "<own text>"` for computed spacing and type of an element and its ancestors.
3. Normalise into scales. The root line-height is 1.43, so text heights are exact multiples (14px = 20.02px, 16px = 22.88px, 22px = 31.46px).
4. Record each value in `design/tokens.md`, then mirror it as a CSS variable in `styles/tokens/*.css` or `app/globals.css`. Components reference tokens, never raw numbers.
5. Check our side: `node scripts/spec/measure-ours.mjs` writes `design/spec/ours-measure.json`; compare with the reference numbers using `scripts/spec/spec-diff.mjs`.

## Guardrails
- Never copy stylesheet rules, class names or markup. Numbers, colours and text are facts; structure is ours.
- Keep only values in `design/capture/` and `design/spec/`, never DOM dumps.
