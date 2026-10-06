---
name: pixel-diff-bands
description: Audit screenshot diffs and band measurements, isolating sub-pixel layout shifts and fine-tuning spacing tokens. Use after a layout change to see where ours drifts from the reference.
---

# Pixel-diff bands

Pairs with the `pixel-diff-reviewer` agent.

## Procedure
1. Run the app, then diff:
   - `npm run diff` (`scripts/pixel-diff.mjs`) compares a region of the local build with the saved `design/reference/full-page.jpg` and writes a diff image and mismatch percentage into `diffs/` (git-ignored).
   - `node scripts/spec/band-diff.mjs` cuts both pages into bands between named headings and prints mismatch % per band, so a few px of height in one section cannot shift the next. Images go to `design/spec/bands/`.
2. Classify each mismatch before fixing:
   - **Structural drift**: padding, margin, line-height, wrap. Fix it.
   - **Rasterization noise**: anti-aliasing, JPEG artefacts, font engine variance. Leave it and note it.
3. Fix in priority order: (1) page height and cumulative vertical drift, (2) section top anchors, (3) component dimensions (container width, hero aspect, sticky card), (4) font weight and line wraps.
4. Change a spacing token rather than a one-off value, re-run the band diff and confirm the neighbouring bands did not move.

## Output
A short table of bands with before/after mismatch %, and the token or component changed for each.
