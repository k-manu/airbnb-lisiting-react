# Airbnb Listing Clone

A pixel-for-pixel, interaction-for-interaction clean-room clone of the Airbnb listing page ([reference](https://airbnb-clone-umber-two.vercel.app)). Desktop-first. Built with **Next.js 16 (App Router, Turbopack)**, **TypeScript**, **Tailwind CSS v4**, and **React 19**.

## Live Demo

**https://playpower-airbnb-clone-three-black.vercel.app/** (production build on Vercel, no login needed)

Direct links to the overlays:
- Photo Tour: [`/?modal=PHOTO_TOUR_SCROLLABLE`](https://playpower-airbnb-clone-three-black.vercel.app/?modal=PHOTO_TOUR_SCROLLABLE)
- Lightbox on photo 2 of 43: [`/?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1001`](https://playpower-airbnb-clone-three-black.vercel.app/?modal=PHOTO_TOUR_SCROLLABLE&modalItem=1001)

The layout is desktop-only, as the task specifies. To run it locally instead: `npm install`, then `npm run dev` (or `npm run build && npm run start`) and open http://localhost:3000. Node 20 or 22 (LTS) is recommended.

---

## How This Clone Meets the Task

The task: reproduce the reference listing page, its Photo Tour (full-screen gallery) and its Lightbox (single-photo viewer), matching visuals and behaviour, without copying the reference's implementation.

| Requirement | What was built | Evidence |
|---|---|---|
| **Listing page, visually identical** | Every section of the reference page, top to bottom: header and search pill, title row, hero photo grid, host row and highlights, sleeping arrangements, amenities, calendar, reviews, location, host card, things to know, nearby stays, sticky section nav and booking card. Layout, type, colour and spacing come from measured values, kept as tokens in `styles/tokens/*.css`. | Total page height 6186 px in both; section tops within 0.1 px; most pixel bands at or under 0.1% mismatch; the rest (1.7 to 3.1%) are text and photo rasterization differences. Every band is listed in [`design/FIDELITY_REPORT.md`](design/FIDELITY_REPORT.md). |
| **"Show all photos" opens the Photo Tour** | Full-screen gallery with a room thumbnail strip, per-room sections and scroll-synchronised state; URL follows the state (`?modal=PHOTO_TOUR_SCROLLABLE`). | `tests/gallery.e2e.mjs` ("photo tour"); overlay geometry compared in `design/spec/ov-tour-diff.txt`. |
| **Any photo opens the Lightbox** | Single-photo viewer with "n of 43" counter, previous/next buttons (previous disabled on the first photo), ArrowLeft / ArrowRight, and Escape that steps back one layer (Lightbox to Photo Tour to listing). URL carries the photo (`&modalItem=`). | `tests/gallery.e2e.mjs` ("lightbox"); overlay geometry in `design/spec/ov-viewer-diff.txt`; checked on the live deployment. |
| **Interactions and behaviour** | Share (toast), Save (heart toggle), display-only calendar with hover states, sticky nav with smooth scroll, amenities dialog, "more stays nearby" paging and keyboard support. | One e2e suite per feature in `tests/`; `npm run check` runs all 10. |
| **Hover, press and motion** | Transition durations and easing curves sampled from the reference and stored as tokens; hover, press and focus states compared element by element. | `design/spec/motion-diff.txt`, `design/spec/state-diff.txt`. |
| **Accessibility** | Native dialogs with labels, keyboard operation throughout, focus trapped in overlays and returned to the trigger on close. | axe-core reports 0 violations on the page and on each overlay (`tests/a11y.e2e.mjs`). |
| **Original work** | Clean-room method: the reference was observed (measurements, computed values, behaviour) and a spec written; all components, hooks and styles were then written from scratch in this project's own structure and names. | [`CLAUDE.md`](CLAUDE.md), [`ai-workflow/reports/clean-room-certification.md`](ai-workflow/reports/clean-room-certification.md). |

**Asset provenance:** the photos, icon artwork and typeface files are asset data taken from the reference listing and used as files. No markup, class names, CSS rules or JavaScript from the reference were copied. The favicon is this project's own addition (the reference has none).

---

## Evaluation Quick-Links & Highlights

| Evaluation Category | Core Artifact / Evidence | Summary |
|---|---|---|
| **Modern AI Workflow & Prompts** | [`PROMPTS.md`](PROMPTS.md)<br>[`ai-workflow/README.md`](ai-workflow/README.md) | Complete prompt history sequence detailing the live Chrome DevTools inspection, clean-room boundary enforcement, and multi-agent steering. |
| **Visual Fidelity & Behavioural Parity** | [`design/FIDELITY_REPORT.md`](design/FIDELITY_REPORT.md) | Sub-pixel layout match (6186px = 6186px, sections ≤0.1px), 8/12 bands ≤0.1% diff, 28-control behavioral parity matrix, and CSS motion tokens. |
| **Accessibility (a11y)** | [`tests/a11y.e2e.mjs`](tests/a11y.e2e.mjs)<br>[`ai-workflow/reports/a11y-audit-report.md`](ai-workflow/reports/a11y-audit-report.md) | **0 axe-core violations** across Listing Page, Photo Tour, Lightbox, and Amenities dialog. Full keyboard navigation and dialog focus traps. |
| **Production Architecture** | [`architecture/SYSTEM_DESIGN.md`](architecture/SYSTEM_DESIGN.md)<br>[`architecture/architecture-diagram.png`](architecture/architecture-diagram.png)<br>[`architecture/README.md`](architecture/README.md) | Staff-level production architecture: Redis Redlock & OCC for double-booking prevention, CDN edge caching (SWR) + Next.js ISR, and OpenSearch H3 indexing. |
| **AI Subagent Fleet & Code Governance** | [`.claude/agents/`](.claude/agents/)<br>[`ai-workflow/reports/`](ai-workflow/reports/) | 8 specialized subagents and generated audit reports for code quality, clean-room compliance, a11y, and motion matching. |

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on :3000. Also serves isolated `/dev/<section>` sandboxes |
| `npm run build` | Next.js Turbopack optimized production build |
| `npm run start` | Run production server |
| `npm run check` | Typecheck + lint + production build + all 10 e2e test suites |
| `npm test [name]` | Run e2e tests via `scripts/run-e2e.mjs` (starts isolated dev server on :3110) |
| `npm run diff -- <name> [url] [x,y,w,h]` | Pixel-diff a css-px region of the local build against reference screenshot |

---

## Clean-Room Methodology & Live Chrome Inspection

The reference site returns HTTP 429 ("Vercel Security Checkpoint") to automated headless scrapers. Claude was connected to an authorized Google Chrome browser session via the **Claude-in-Chrome DevTools extension** to inspect the live listing directly:
- **Non-Invasive Measurement**: Injected `scripts/spec/measure-page.js` to extract rendered geometry and bounding boxes, streaming them to `scripts/spec/collector.mjs`.
- **Computed Styles**: Extracted live computed styles into `design/tokens.md` and synthesized into CSS custom properties in `styles/tokens/*.css`.
- **Icon Artwork**: Extracted 71 vector artworks cleanly into `components/icon-art.generated.ts` and rendered via `components/ArtIcon.tsx`.
- **Zero Plagiarism**: All React components, state hooks, and CSS rules were authored from scratch under strict clean-room governance.

---

## Layout & Directory Map

```
app/page.tsx                  Page composition + section anchors (photos, amenities, reviews, location)
app/dev/                      Isolated dev sandbox route per section for focused development
components/ui/                Accessible primitives (ModalDialog with focus trap, IconButton, ExpandableText)
components/listing/           Header, TitleRow, and per-section components
features/gallery/             Hero PhotoGrid, Lightbox (prev/next, counter, Esc), and Photo Tour (?modal=PHOTO_TOUR_SCROLLABLE)
features/calendar/            Display-only calendar with hover states
features/sticky-nav/          Sticky navigation bar with smooth scrolling to sections
features/listing-actions/     Share ("Share options" toast) and Save (wishlist heart toggle)
data/                         Typed listing data (listing.ts, types.ts, gallery.generated.ts)
styles/tokens/                Measured design tokens imported into app/globals.css
ai-workflow/                  Multi-agent architecture and subagent execution reports
architecture/                 Production distributed system design and architecture specifications
tests/                        10 End-to-end test suites (Playwright + node:test)
```

---

## Building in Layers

Interactive behavior is structured in clear architectural layers:
- **Layer 0 (`state.ts`)**: Pure TypeScript reducer for overlay state (Photo Tour, Lightbox, modal item indices). Zero DOM/React dependencies.
- **Layer 1 (`PhotoGrid.tsx`, `Lightbox.tsx`)**: Presentation components consuming state.
- **Layer 2 (`PhotoTour.tsx`, `useScrollSpy.ts`)**: Scrollytelling container synchronizing scroll position and browser URL query parameters.

All overlays render inside accessible dialog wrappers (`ModalDialog.tsx`) ensuring keyboard focus is trapped on mount and returned to the trigger element on close.
