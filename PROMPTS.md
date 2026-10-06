# Prompt History & AI Workflow Trajectory

This document records the summary prompt sequence, agent deliberations, and verification loops that drove the engineering of the Airbnb Listing Clone.

Each **User** block is a condensed verbatim quote of the message sent to the agent (long pastes trimmed, wording unchanged). The **Agent Reasoning & Action** blocks are summaries of what the agent did in response. 

---

## Prompt 1: Initial Discovery & Bypassing Bot Protection via Live Chrome

**User**:
> We need to reproduce the Airbnb listing page at `https://airbnb-clone-umber-two.vercel.app` pixel-for-pixel and interaction-for-interaction (Listing Page, Photo Tour, and Lightbox).
> However, headless scrapers and automated scripts are blocked with an HTTP 429 "Vercel Security Checkpoint".
> Connect to my active Google Chrome browser session via the Claude-in-Chrome extension so you can inspect the live site directly and plan out the clone.

**Agent Reasoning & Action**:
- Acknowledged the Vercel security challenge. Headless HTTP clients and Puppeteer/Playwright headless sessions fail the bot challenge.
- Invoked the Claude-in-Chrome extension to attach directly to the authorized browser tab.
- Visually surveyed the live listing page: header, title row, hero photo grid, booking column, review breakdown, map, host details, and overlays (Photo Tour and Lightbox).
- Identified key views:
  1. Main Listing Page (`/`).
  2. Scrollytelling Photo Tour (`?modal=PHOTO_TOUR_SCROLLABLE`).
  3. Single-photo Lightbox viewer (`&modalItem=1001`).
- Established the base tech stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, and TypeScript.

---

## Prompt 2: Establishing the Clean-Room Constitution & Non-Negotiables

**User**:
> The number one rule for this project is **strict clean-room implementation with zero plagiarism**.
> Under no circumstances should you copy the reference's HTML markup structure, CSS rules, class names, or JavaScript algorithms. The brief treats lift-and-shift as a hard failure.
> Facts, measurements, computed styles, colors, timings, and asset files are fine.
> Formulate our operating rules in `CLAUDE.md` and set up our project principles before writing any code.

**Agent Reasoning & Action**:
- Codified the clean-room protocol in `CLAUDE.md`:
  - Reference is treated strictly as an external black-box oracle.
  - Capture only rendered facts: dimensions, computed styles, text copy, image assets.
  - All components must be written from scratch in our own semantic component architecture (`app/`, `components/`, `features/`).
- Designed a 3-layer architecture for interactive features:
  - Layer 0: Pure state reducers (`state.ts`).
  - Layer 1: Presentational UI components.
  - Layer 2: Orchestration & scroll-spy hooks.
- Set up isolated developer sandbox routes under `app/dev/<section>` so each section can be built and tested independently before page assembly.

---

## Prompt 3: AI Subagent Fleet Architecture & Provisioning

**User**:
> We need a specialized multi-agent setup to ensure high fidelity, accessibility, and clean code.
> Design and configure our subagent fleet in `.claude/agents/` and cross-harness rules in `.cursorrules`.
> Each agent must have a clearly defined role, explicit checklist, and concrete tool permissions.

**Agent Reasoning & Action**:
- Configured 8 specialized subagents in `.claude/agents/`:
  1. `design-token-extractor`: Parses live DevTools computed styles into normalized token scales in `design/tokens.md` and `styles/tokens/*.css`.
  2. `pixel-diff-reviewer`: Analyzes canvas visual diffs and sub-pixel vertical alignment.
  3. `animation-matcher`: Samples transition durations, cubic-bezier timing functions, and micro-interactions.
  4. `a11y-reviewer`: Audits keyboard navigation, modal focus traps, and runs axe-core tests.
  5. `code-quality-auditor`: Enforces Next.js 16 conventions, strict TypeScript, and zero magic numbers.
  6. `clean-room-compliance`: Audits AST to certify 100% clean-room provenance and zero reference code leakage.
  7. `system-architect`: Designs the production-scale distributed architecture for vacation rental platforms.
  8. `performance-cwv-optimizer`: Optimizes Core Web Vitals (LCP, INP, CLS).
- Created `.cursorrules` to enforce consistent token discipline across AI coding environments.

---

## Prompt 4: Live Design Token Extraction via DevTools

**User**:
> Dispatch `design-token-extractor` to inspect the live Chrome session.
> Extract all typography, color palettes, spacing scales, border radii, and layout geometry.
> Document them in `design/tokens.md` and generate the Tailwind CSS v4 custom properties. Do not use magic numbers.

**Agent Reasoning & Action**:
- Dispatched `design-token-extractor` to read computed styles from the live Chrome tab:
  - Primary colors: ink `#222222`, muted `#717171`, line `#ebebeb`, card border `rgba(0,0,0,0.08)`, brand `#ff385c`.
  - Reserve button gradient: `linear-gradient(to right, #e61e4d 0%, #e31c5f 50%, #d70466 100%)`.
  - Page container geometry: centered max-width 1280px with 80px gutters (`min(1120px, viewport - 160px)`).
  - Content grid: `1fr` left column + `372px` right column, separated by `96px` gap.
  - Hero grid: Fixed aspect ratio `1120 / 494` with `8px` gap.
- Synthesized tokens into `styles/tokens/*.css` and imported them into `app/globals.css`.

---

## Prompt 5: Behavioral Reverse-Engineering & Interaction Parity

**User**:
> Now interact with the live page in Chrome and test all interactive controls.
> Find out what happens when you click Share, Save, Reserve, the calendar dates, the review filters, and the photos.
> Document which controls are active vs inert, and implement the exact behavior in our feature modules.

**Agent Reasoning & Action**:
- Live tested all controls in Chrome:
  - **Share button**: Displays a bottom-floating toast with text "Share options" (does not open system share or copy URL).
  - **Save button**: Toggles heart fill to red `#ff385c`, changes label to "Saved", and displays a toast ("Saved to wishlist" / "Removed from wishlist").
  - **Reserve buttons** (hero card and sticky header): Display a toast "You won't be charged yet".
  - **Calendar**: Display-only. Day cells, month navigation arrows, and "Clear dates" are inert (hover states preserved).
  - **Booking card inputs**: Display-only divs (no `<form>` or `<input>`).
  - **Sticky sub-nav tabs**: Smooth-scroll the window to `(section top - 80px)` without hash mutations.
  - **Hero photos**: Clicking any photo opens the Photo Tour scrolled directly to that photo's section.
  - **Photo Tour & Lightbox**: Synchronizes URL parameters (`?modal=PHOTO_TOUR_SCROLLABLE`, `&modalItem=1001`), Esc key navigates back, arrow keys cycle photos.
- Implemented state reducers in `features/listing-actions/` and `features/gallery/`.

---

## Prompt 6: Sub-Pixel Layout Calibration & Solving the Line-Height Drift

**User**:
> We have built the page sections, but our preliminary visual diff shows an accumulated vertical height discrepancy.
> Write a non-invasive measurement probe to inspect both the live reference in Chrome and our local build.
> Find the root cause of the vertical drift and calibrate the layout until the page height matches exactly.

**Agent Reasoning & Action**:
- Created `scripts/spec/measure-page.js` to extract bounding rects of every element on the live Chrome page.
- Created `scripts/spec/collector.mjs` (port 3400) to receive streamed layout telemetry.
- **Root Cause Discovered**:
  - The live reference uses an exact line-height multiplier of `1.43` across all typography (e.g. 14px * 1.43 = 20.02px, 16px * 1.43 = 22.88px, 22px * 1.43 = 31.46px).
  - Our initial implementation used rounded integer line-heights (20px, 24px, 32px), accumulating ~0.3px per line over dozens of paragraphs to a 25px total page height error.
- **Resolution**:
  - Codified the exact `1.43` multiplier across `styles/tokens/*.css`.
  - Tuned container margins and padding to match live computed values.
  - Re-measured in Chrome: **Local Page Height = 6186px, Live Page Height = 6186px (0.0px delta)**.
  - All section tops aligned within 0.1px.

---

## Prompt 7: Motion Sampling & Transition Tokens

**User**:
> Dispatch `animation-matcher` to sample transition timings and curves from the live Chrome DevTools Animations panel.
> Ensure our modals, toasts, and hover states match the reference's micro-interactions.

**Agent Reasoning & Action**:
- Dispatched `animation-matcher` to record transition timings in Chrome DevTools:
  - Dialog overlay fade: `0.2s ease`.
  - Lightbox photo crossfade: `animation: lbFade 0.3s ease`.
  - Toast notification slide: `0.2s ease` translateY(20px) with an exact 2.5s hold time.
  - Button hover: `0.2s ease` background color transition.
  - Hero image hover: `filter` brightness transition; press scale `scale(0.997)` over `0.1s ease`.
- Codified motion tokens into `styles/tokens/*.css` and eliminated all inline transition declarations.
- Ran `scripts/spec/motion-diff.mjs` verifying identical transition properties on all 130 animated elements.

---

## Prompt 8: Clean-Room Icon Asset Compilation & Band Diffs

**User**:
> We need icon artwork that matches the reference without copying their markup or SVG class names.
> Extract the vector shapes as design assets, build a clean icon registry in `components/icon-art.generated.ts`, and run `band-diff.mjs` to measure visual regression across all page sections.

**Agent Reasoning & Action**:
- Executed `scripts/spec/extract-icons.mjs` and `build-icon-registry.mjs`:
  - Extracted 71 unique vector artworks into a clean, typed registry in `components/icon-art.generated.ts`.
  - Built `components/ArtIcon.tsx` to render vector assets inline with dynamic sizing and fill inheritance.
- Dispatched `pixel-diff-reviewer` to execute `scripts/spec/band-diff.mjs`:
  - 8 of 12 vertical bands achieved ≤ 0.1% diff.
  - Remaining 4 bands (reviews, nearby) showed 1.7–3.1% diff, isolated entirely to Playwright Chromium font rasterization engine differences (confirmed identical in Google Chrome).
- Recorded full results in `design/FIDELITY_REPORT.md`.

---

## Prompt 9: Accessibility Hardening & Axe-Core Verification

**User**:
> Dispatch `a11y-reviewer` and `code-quality-auditor` to audit the application for accessibility and code cleanliness.
> Ensure full keyboard navigation, modal focus traps, ARIA attributes, and verify with automated axe-core tests.
> Drive accessibility violations to zero.

**Agent Reasoning & Action**:
- Dispatched `a11y-reviewer`:
  - Built `components/ui/ModalDialog.tsx` with native keyboard focus trapping, Esc key listener, and focus restoration to the trigger element on unmount.
  - Added full keyboard navigation to the Lightbox (`ArrowLeft`, `ArrowRight`, `Escape`).
  - Added accessible skip link targeting `#main`.
  - Marked display-only calendar days with `aria-disabled="true"`.
- Ran automated test suite `node scripts/run-e2e.mjs a11y` (using Playwright and `@axe-core/playwright`):
  - Listing Page: **0 violations**.
  - Photo Tour: **0 violations**.
  - Lightbox Viewer: **0 violations**.
  - Amenities Modal: **0 violations**.
- Dispatched `code-quality-auditor` to verify zero magic numbers and strict TypeScript types.
- Generated `ai-workflow/reports/a11y-audit-report.md` and `code-quality-report.md`.

---

## Prompt 10: Production Architecture Diagram & System Design

**User** (the brief, pasted):
> Submit a high-level architecture diagram for a production-scale vacation-rental marketplace (think Airbnb) alongside your app. The diagram should illustrate your scaling strategy for frontend, backend, storage, search, and deployment. Tools like lucid.app or excalidraw are recommended.
>
> this is what they require now, to get a perfect score for the architecture diagram, what needs to be done, and how should we do it

**Agent Reasoning & Action**:
- Checked the repo first: `README.md`, `HANDOFF.md` and `CLAUDE.md` all linked to `architecture/SYSTEM_DESIGN.md`, but the `architecture/` folder did not exist. Reported this as a missing deliverable rather than a finished one.
- Proposed the plan: one diagram with five clearly labelled areas (frontend, backend, storage, search, deployment), a scaling-strategy callout in each, numbered request flows, a legend and stated scale assumptions, delivered as an editable Excalidraw file plus a PNG/SVG export and a written companion.

**User**:
> Go ahead. Goal is to get the perfect score out of the grader. Lets do it in excalidraw as you said, give me step by step instructions on what to do next

**Agent Reasoning & Action**:
- Authored directly by the primary agent. The `system-architect` subagent was not dispatched for this step; its focus areas in `.claude/agents/system-architect.md` (booking engine, global reads, geospatial search, media pipeline, observability and resilience) were used as the design brief.
- Wrote `scripts/architecture/build-diagram.mjs`, which generates the editable `.excalidraw`, an `.svg` and a `.png` from a single spec, so the layout is reproducible.
- Diagram content: clients and edge, frontend, backend, storage, events and workers, search, and deployment zones; a scaling-strategy callout per zone; request flows 1 to 5; a design-point box (100M MAU, 10k search QPS, 150 bookings/s, 3 regions, SLOs).
- Wrote `architecture/SYSTEM_DESIGN.md` (design point, scaling strategy per area, request flows, double-booking prevention with Redis lock + optimistic concurrency + idempotent payments and a Pending → Reserved → Payment authorized → Confirmed state machine, failure modes, trade-offs) and `architecture/README.md`, then linked them from `README.md` and `HANDOFF.md`.
- Reviewed the render and fixed arrows that crossed zone subtitles.

**User**:
> could you increase the text size in the .excalidraw a little bit and check how that works with everything and also bold important text. dont touch the existing files in architecture, create a new folder inside that and do this

**Agent Reasoning & Action**:
- Added a `--large` mode to the generator (body 12 to 14, titles 16 to 19, zone headers 18 to 20) writing to `architecture/large-text/`. The default output was regenerated into a scratch folder and confirmed byte-identical, so the existing files stayed untouched.
- Excalidraw has no bold weight, so headings use its heaviest font (Lilita One). Two callouts overflowed at the larger size and were made taller.
- Loaded the file into excalidraw.com as a check; the tab became unresponsive at high zoom, so that check was only partial.

**User**:
> Ok the large text ones are good, you can make it the main one we are gonna submit

**Agent Reasoning & Action**:
- Moved the large-text files into `architecture/` (after confirming they were unedited generator output), removed the `large-text/` folder and made the large version the generator default (`--compact` keeps the old sizes).

**User** (consistency pass after a grader-style review):
> fix the architecture related and prompt 10 inconsistency alone(also condensed verbatim). Also write skills we used to match the agents description

**Agent Reasoning & Action**:
- Fixed the diagram's design point (it said 4 regions while the diagram shows 3) and aligned the Booking box with the reservation state machine.
- Aligned `SYSTEM_DESIGN.md` with the `system-architect` brief (reservation state machine, `Idempotency-Key`, stale-while-revalidate with tag-based revalidation, read-your-own-writes) and made the CDN wording vendor-neutral in `README.md`.
- Rewrote this entry to describe what actually happened; the earlier version of it described a subagent dispatch and a verification run that this step did not include.
- Added `.claude/skills/` with one skill per agent and documented them in `ai-workflow/README.md`.
