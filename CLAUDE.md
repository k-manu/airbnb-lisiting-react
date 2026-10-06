@AGENTS.md

# Airbnb Listing Clone (Playpower Labs take-home)

Reproduce https://airbnb-clone-umber-two.vercel.app pixel-for-pixel and interaction-for-interaction:
Listing Page, Photo Tour (full-screen gallery) and Lightbox (single-photo viewer). Desktop only.
**Read `HANDOFF.md` first**: status, decisions, next steps, how to run.

## The one rule: no plagiarism

Never reproduce the reference's implementation: its markup structure, CSS rules, class names or JavaScript logic,
whether copied, renamed, paraphrased or ported line by line. The brief treats lift-and-shift as a hard failure.

Everything else is allowed, including inspecting the reference in any way that is useful:
- **Facts are fine:** numbers, colours, sizes, spacing, timings, easings, text content, and asset files (photos, icon
  and logo artwork used as assets).
- **Observed behaviour is fine:** what happens on click, hover, scroll, keyboard and over time.
- **Method:** work clean-room. Observe outcomes via live browser inspection, write them down as a spec, implement from the spec in our own structure
  and names.

## Stack
Next.js (App Router) + TypeScript + Tailwind v4. Mock listing data in `data/`. No backend. Deploy target: Vercel or any host.

## Quality bar (goals)
Exact layout, spacing, type, colour, icons, images; motion timings recorded as tokens; full keyboard support, ARIA,
focus trapped in overlays and returned on close, Escape and arrow keys in the Lightbox.

## Definition of done
- [x] Listing page matches the reference layout/spacing/type/colour (`band-diff`: 8 of 12 bands ≤ 0.1%, rest 1.7-3.1% from Playwright baseline drift)
- [x] "Show all photos" opens the Photo Tour
- [x] Any photo opens the Lightbox with prev/next, arrow keys, Esc and a focus trap
- [x] Hover/scroll/transition timings verified against the reference (`motion-diff`, `state-diff`, `overlay-diff` in `scripts/spec/`)
- [x] axe reports 0 violations on the page and each overlay
- [x] `PROMPTS.md` has the full prompt sequence documented
- [x] Production architecture documentation delivered (`architecture/SYSTEM_DESIGN.md`)
- [x] Code clean for submission, not pushed to a public repo (exclude `node_modules`, `.next`, `diffs/`)
