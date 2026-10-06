---
name: match-motion
description: Sample transition durations, cubic-bezier timing functions and micro-interactions from the live Chrome session and synchronize them with design/tokens.md. Use when matching hover, press, overlay and toast motion.
---

# Match motion

Pairs with the `animation-matcher` agent.

## Procedure
1. Sample from the live reference through Claude-in-Chrome: `transition-property`, `-duration`, `-timing-function`, `-delay`, plus any `@keyframes` (`node scripts/spec/keyframes.mjs <url>` lists them as values only).
2. Record each timing as a CSS token in `design/tokens.md` and `styles/tokens/*.css` (duration and easing separately). Components use the tokens.
3. Compare reference and ours in the same engine:
   - `node scripts/spec/motion-diff.mjs` for every element that animates (writes `design/spec/motion-diff.txt`).
   - `node scripts/spec/state-diff.mjs` for rest, hover, press and keyboard focus of buttons, links and photo tiles (writes `design/spec/state-diff.txt`).
   - `node scripts/spec/overlay-diff.mjs [tour|viewer|amenities|all]` for Photo Tour, Lightbox and amenities modal geometry.
4. Time-based behaviour (for example the toast hold time) is measured by observation and written down as a number, then implemented from that number.

## Guardrails
- Elements are identified by what a person sees (aria-label, own text, alt), never by class or markup.
- Prefer transforms and opacity so overlay transitions stay off the layout path.
