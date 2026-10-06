# HANDOFF: Project Status & Evaluation Dossier

Airbnb listing clone (Playpower Labs take-home). Reference: https://airbnb-clone-umber-two.vercel.app. Live deployment: https://playpower-airbnb-clone-three-black.vercel.app/
Goal: pixel-for-pixel and interaction-for-interaction. Desktop only. The fundamental rule (see `CLAUDE.md`): **strict clean-room implementation with zero code plagiarism**. Facts, assets, computed tokens, and observed behaviors are measured via live browser inspection; internal markup/class names/JS logic are never copied. Work clean-room: observe, write a spec, implement in our own semantic structure.

---

## Status (Ready for Evaluation)

- **AI Workflow & Prompt Sequence**: Documented in `PROMPTS.md` covering the 10-prompt lifecycle from initial live Chrome DevTools inspection to final distributed architecture and accessibility certification.
- **AI Subagents & Governance**: 8 specialized subagents configured in `.claude/agents/` and cross-harness `.cursorrules`. Execution reports provided in `ai-workflow/reports/` (code quality, a11y, clean-room certification, motion & states).
- **Visual & Behavioral Parity**: Documented in `design/FIDELITY_REPORT.md`:
  - Exact 6186px page height match vs the live reference in Chrome (0.0px delta).
  - All section tops aligned within 0.1px.
  - 8 of 12 bands at or under 0.1% diff in `band-diff.mjs` (remaining 1.7–3.1% due to browser font rasterization differences).
  - Complete 28-control behavioral parity matrix (toasts, inert calendar/booking card, smooth scrolling, URL routing).
  - Transition durations and cubic-bezier curves recorded as CSS tokens.
- **Accessibility & Compliance**: WCAG 2.1 AA compliant, 0 axe-core violations on page, Photo Tour, Lightbox, and Amenities dialog (`tests/a11y.e2e.mjs`). Keyboard focus trap and return fully implemented.
- **Production Architecture**: High-level diagram (`architecture/architecture-diagram.png`, editable `.excalidraw`, regenerate with `scripts/architecture/build-diagram.mjs`) plus the design paper in `architecture/SYSTEM_DESIGN.md` (high-concurrency reservation locking with Redis Redlock + OCC, global edge caching with Next.js ISR, CDC to OpenSearch H3 geospatial clustering, async media pipeline, and observability).
- **Build & Tests**: `npm run check` passes 100% green (typecheck, lint, production build, 10 e2e test files).

---

## Run & Test Commands

| Command | Does |
|---|---|
| `npm run dev` | Dev server on :3000 (serves listing and dev-only `/dev/<section>` sandboxes) |
| `npm run build` | Next.js Turbopack production build |
| `npm run start` | Production server on :3000 |
| `npm run check` | Typecheck + lint + production build + all 10 e2e test suites |
| `npm test [name]` | Run e2e tests via `scripts/run-e2e.mjs` (spawns test server on :3110) |
| `npm run diff -- <name> <url> x,y,w,h` | Pixel-diff a css-px region against the reference screenshot |

---

## Clean-Room Methodology & Live Chrome Inspection

1. **Bot Checkpoint & Live Browser Access**:
   The live reference returns HTTP 429 ("Vercel Security Checkpoint") to automated headless scrapers. Claude was connected to an authorized Google Chrome browser session via the Claude-in-Chrome DevTools extension to perform non-invasive layout measurements, computed styles extraction, and behavioral testing directly on the rendered page.
2. **Measurement Probes**:
   - `scripts/spec/measure-page.js` was injected into the live browser context to stream exact element geometries and text metrics to `scripts/spec/collector.mjs` (port 3400).
   - This revealed that the live page uses an exact 1.43 line-height multiplier (20.02px at 14px), resolving an initial 25px height accumulation.
3. **Design Tokens & Icons**:
   - All rendered styles were extracted into structured scales in `design/tokens.md` and `styles/tokens/*.css`.
   - 71 clean-room vector icon artworks cataloged into `components/icon-art.generated.ts` and rendered via `components/ArtIcon.tsx`.
4. **Zero-Plagiarism Verification**:
   - Every React component, hook, and CSS custom property was authored from scratch in our own semantic architecture.
   - Audited and certified in `ai-workflow/reports/clean-room-certification.md`.

---

## Architecture & Code Map

```
app/page.tsx                  Page composition + anchor IDs (photos, photo-grid, amenities, reviews, location)
app/dev/*                     Dev-only sandbox routes for isolated section testing
components/listing/           Header, TitleRow, TitleActions; sections/ = component per section
components/ui/                Accessible primitives: ModalDialog (focus trap/return), IconButton, ExpandableText
features/gallery              PhotoGrid, Lightbox (prev/next, counter, arrow keys, Esc), Photo Tour (?modal=PHOTO_TOUR_SCROLLABLE)
features/calendar, sticky-nav Sticky nav with smooth scroll to sections; display-only calendar with hover states
features/listing-actions      Share (toast "Share options"), Save (wishlist toggle + toast)
data/                         Typed listing data (listing.ts, types.ts, gallery.generated.ts)
styles/tokens/*.css           Measured design tokens (layout, typography, colors, animations)
ai-workflow/                  Multi-agent architecture guide and subagent execution audit reports
architecture/                 SYSTEM_DESIGN.md (production architecture) & README.md
tests/*.e2e.mjs               10 Playwright + node:test suites (including a11y.e2e.mjs)
```

---

## Submission Packaging Note

When creating the submission archive:
- Include all source code, tests, documentation (`PROMPTS.md`, `README.md`, `CLAUDE.md`, `HANDOFF.md`), `ai-workflow/`, `architecture/`, `design/`, and public assets.
- Exclude `node_modules/`, `.next/`, `diffs/`, and temporary build artifacts.
