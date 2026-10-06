---
name: a11y-audit
description: Audit keyboard navigation, focus management, ARIA semantics and WCAG 2.1 AA compliance across the Listing Page, Photo Tour, Lightbox and dialog overlays. Use after any change to an overlay, control or focus behaviour.
---

# Accessibility audit

Pairs with the `a11y-reviewer` agent.

## Procedure
1. Automated: `tests/a11y.e2e.mjs` runs axe-core on the listing page and on each overlay (Photo Tour, Lightbox, amenities dialog). Every audit must report zero violations. Run all e2e files with `npm test` (`scripts/run-e2e.mjs`).
2. Keyboard, by hand or with Playwright:
   - Tab and Shift+Tab reach every control in reading order and never get stuck in background content.
   - Escape closes the open overlay one level at a time (Lightbox to Photo Tour, Photo Tour to Listing Page).
   - In the Lightbox, ArrowLeft and ArrowRight move between photos and stop at the ends.
3. Dialogs: `role="dialog"` with `aria-modal="true"` and a label (`aria-labelledby` or `aria-label`) on Photo Tour, Lightbox and amenities.
4. Focus: trapped inside the open overlay, returned to the control that opened it on close.
5. Fix in the component, then re-run `npm test` and confirm the axe count is still 0.

## Output
A pass/fail list per view and overlay, with the exact control or key that failed.
