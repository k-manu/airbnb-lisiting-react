# PROGRESS ledger (single source of truth for "what is done / next")

Update this as items finish so nothing is redone. Status: `[ ]` todo, `[~]` in progress, `[x]` done (verified), `[!]` blocked/decision.
Rule: implement in our own structure; the reference gives behaviour, measured values, text and assets only (see CLAUDE.md).
User instruction 2026-09-20: quality first, token cost secondary; no PROMPTS.md logging; architecture diagram deferred.

Reference access: live site only via the Claude-in-Chrome extension (headless gets 429). Observed facts so far: see memory `reference-behaviour-observations`.

## Phase 0: Baseline
- [~] 0.1 baseline: not run before edits (server already up); after Phase 1 typecheck+lint clean and 84/84 e2e green on the dev server. Full `npm run check` (incl. production build) still to run in Phase 5
- [x] 0.2 dev server on :3000 was already running and hot-reloads our edits (tests run against it with E2E_ORIGIN=http://localhost:3000)

## Phase 1: Behaviour parity (observed on the live reference 2026-09-20)
- [x] 1.1 Share button: toast text "Share options" (ours: "Link copied"); confirm it does not copy/navigate
- [x] 1.2 Reserve button: shows toast "You won't be charged yet"
- [x] 1.3 Calendar inert: day cells, Clear dates, month arrows do nothing (keep visuals, keep arrows' hover state)
- [x] 1.4 Booking card inert: check-in/checkout/guests fields, Claim do nothing (hover states stay)
- [x] 1.5 Inert: "Show all 19 reviews", "How reviews work", map zoom +/-/search, neighbourhood "Show more", "Message host", header menu/language/search buttons (hover only)
- [x] 1.6 Hero photo click opens Photo Tour scrolled to that photo (not straight to Lightbox); "Show all photos" opens at top
- [x] 1.7 Lightbox: URL `modalItem`, counter, Esc returns to Tour then closes; check behaviour at last photo (live check needed)
- [x] 1.8 Update e2e tests that encoded the old guesses; add tests for 1.1-1.6
- [!] 1.9 DECISION: keep our focus trap/return (reference has none). Default = keep ours.

## Phase 2: Measure the reference once (data, not markup)
- [x] 2.1 Probe written: `scripts/spec/measure-page.js` (geometry + own-text only, keys `t:/i:/s:/b:/c:` + occurrence #n; window.__measure({yMin,yMax,occlusion})). Ours: `node scripts/spec/measure-ours.mjs [url] [out]` -> design/spec/ours-measure.json (viewport 1193 wide = live layout width)
- [x] 2.2 Live page captured at scrollY 0, layout width 1193, 491 rows, 6 slices each hash-verified (`scripts/spec/fnv.mjs`) -> `design/spec/reference-measure/slice-*.txt`, assembled to `design/spec/reference-page.txt`. NOT yet captured: sticky bar at scroll 1000, booking column at scroll 1200/2000 (do in 2.3b)
- [x] 2.3 Diff tool built: `node scripts/spec/spec-diff.mjs [--ref f] [--ours f] [--tol n]` (drift steps, size/x diffs, unmatched). Method: the true comparison is OURS IN THE USER'S CHROME vs live reference: collector `scripts/spec/collector.mjs` (port 3400) receives rows POSTed by our page inside the extension's Chrome -> design/spec/chrome/*.json. Live Chrome DevTools is used for computed-style lookups.
- Servers left running for this phase: prod :3001, dev :3000, collector :3400 (stop them at the end)
- [x] 2.4 DONE. Mismatch fixing (round log): R0 ours-in-Chrome 6211 vs live 6186 -> R1 exact 1.43 line-heights + container/grid rules (content 1120 max, 1fr|372, gap 96, hero aspect 1120/494) -> 6200 -> R2 spacing values (summary 6, host row, about 32, notice 8, amenity heading 24, sleeping pad 32, calendar title lh) -> 6194. Hero grid, title row, header now exact (<=0.1px). R3 reverted the screenshot-bias "measured" tokens to the stylesheet values (map 480, place pad 48/48, host pad 48, host columns 340, notice/gap values, calendar weekday gap 6, know/nearby margins, Show-all inset 24 + 15px icon) -> PAGE HEIGHT 6186 = LIVE 6186; all section tops within 0.1px (reviews 2662.6/2662.5, location 4012.5, host 4863.9, things 5425.7, nearby 5771.6). R4 removed the leftover pt-px shim, booking card pt 22, reviews "How reviews work" button padding 1/6 -> ROWS WITH |dy|>0.5: 8 of 427, page height 6186 = live. Remaining: a few x/width diffs (design/spec/diff-chrome.txt section C), then responsive widths, sticky bar, booking column sticky, colours.
- [x] 2.5 Page-height gap resolved: ours 6186 = live 6186 (root cause: rounded line-heights + tokens fitted to a 0.6%-oversized screenshot; see findings). Sticky bar matches live to <=0.4px (nav y1 h64, Reserve y13 h40); booking column sticky positions identical at scroll 1200/2000.

## Phase 3: Motion and states (measured, stored as tokens)
- [x] 3.1 (transitions verified via live Chrome DevTools motion inspection) `node scripts/spec/motion-diff.mjs`: 130 animated elements on both sides, all durations/easings/delays identical after fixes (default easing now `ease`; map buttons, calendar arrows, Claim, Message host removed unneeded transitions/press scales; sticky Reserve uses filter+transform like the card; hero img filter transition; skip link no extra outline). Live rAF sampling not needed.
- [x] 3.2 `node scripts/spec/state-diff.mjs` (rest/hover/press/focus of every control, needs `hover: hover` media emulation and releasing the mouse away from the control): 37 of 56 controls identical in all states, rest are non-visual (svg colour inheritance, underline as ::after vs span). Global `cursor: pointer` on buttons restored (Tailwind v4 resets it) -- was the biggest state difference. [orig: Hover/active/focus states of every control (colour, background, transform, timing)
- [x] 3.3 Applied and verified (motion-diff, state-diff, tests)

## Phase 4: Visual pass
- [x] 4.1 Screenshot side-by-side per section (`band-diff.mjs`), see Phase 4 result
- [x] 4.2 Icon artwork: every icon renders the reference artwork (used as an asset, per CLAUDE.md "icon and logo artwork")
- [x] 4.3 Pixel diff regions, numbers recorded below

## Phase 5: Final verification
- [x] 5.1 `npm run check` green (10 e2e files), axe 0 violations on page and each overlay (`tests/a11y.e2e.mjs`; blocked calendar days are `aria-disabled` so axe treats their faded colour as inactive)
- [x] 5.2 HANDOFF.md rewritten for the current state, CLAUDE.md definition of done ticked (remaining: architecture diagram, PROMPTS.md, zip: deferred by the user)
- Deferred by user: architecture diagram, PROMPTS.md, zip


## Findings log (observed live 2026-09-20; not derivable from code, do not re-observe)
- Chrome extension tab: use a FRESH tab (an old tab collapsed to a 197x87 viewport after resize_window). Do not call resize_window. Click coords are in the frame of the latest screenshot (1208 or 1568 wide: check the "coordinate frame" line); JS rects are css px.
- `getComputedStyle` returns empty strings in the extension's page context (blocked). Rects (getBoundingClientRect / Range rects), text, attributes, screenshots, and live DevTools computed style panels provide exact measurements.
- Live viewport 1208x536, scrollbar 15px (layout width 1193), dpr 3.18, page height 6186, max scrollY 5650, one wheel tick = 200 px.
- Toast: "Share options", "Saved to wishlist", "Removed from wishlist", "You won't be charged yet". Save = filled red heart + label "Saved". Tour bar Share/Save are inert (no toast, no state).
- Calendar: display-only (days are divs; arrows, Clear dates inert; keyboard glyph is a non-focusable div; no hover ring on days). Sub-nav tabs: CORRECTED 2026-09-21 (the first note "inert" was a hidden-tab artefact: the extension tab had visibilityState "hidden", so smooth scrolls never ran). A tab click is intercepted (no hash change, no history entry) and calls a smooth window scroll to (section top - 80px): Photos 8.94, Amenities 1718.0, Reviews 2582.5, Location 3932.5 at layout width 1193 (ids photos/amenities/reviews/location). Found by wrapping window.scrollTo/history.pushState in the live page and calling link.click(). Ours: features/sticky-nav/scrollToSection.ts + token --sticky-nav-scroll-offset. Map zoom/search inert. Neighbourhood "Show more" inert. Booking fields are plain divs (no form/inputs); both Reserve buttons are `type=button` and toast.
- Photo Tour: URL `?modal=PHOTO_TOUR_SCROLLABLE` (open = pushState). Thumbnail strip click smooth-scrolls to that room. Hero photo click opens the tour at that photo's room. Lightbox: `&modalItem=<1000+index>` (open = pushState, arrows = replaceState, Esc/X/grid-icon = history back to the tour URL), counter "N of 43", room name as title, no wrap, prev/next disabled at ends. Reference has no focus trap/return; ours keeps them (decision 1.9).
- Reference overlays are not native <dialog> elements.

## Responsive + exact-CSS findings (Phase 2, read from live Chrome computed styles; values only)
Tools: `scripts/spec/styles.mjs` (computed values of an element + ancestors), `styles-diff.mjs` (typography of every text element, ref vs ours), `responsive.mjs` / `responsive2.mjs` (layout at many widths), `sections.py` / `side.py` (per-section offsets vs the live Chrome capture).
- Root line-height 1.43 (20.02px at 14px). Reference line-heights are exact multiples 1.43 (17.16, 20.02, 22.88, 28.6, 37.18) or `normal`; ours were rounded px (17, 20, 24, 28) and a 21px inherited default -> ~+0.3px per line, accumulating to most of the 25px page-height gap.
- Container: centred, max-width 1280 incl. 80px side padding => content = min(1120, W-160). Desktop layout starts at W>=1130 (below it the reference collapses to one column; desktop only, so we only keep >=1130 behaviour).
- Content grid: `1fr 372px`, column gap 96px (565+96+372 at W=1193). Ours had 562/99 and a 374.2px booking column starting at x=737.8 (JPEG guess) -> now 372px at x=741.
- Hero photo grid: `aspect-ratio 1120/494`; small tiles keep ~1.12 aspect (272x243 at 1120), big tile = remaining width; gap 8. Section has margin-bottom 48 (ours: 48 padding-top on the grid, equivalent).
- Header: fluid (padding 0 80, no max-width), 3-col grid with the search pill 392.1px in the middle. Title row padding 32/18 (ours 33/18).
- Sleeping cards 274.5px wide at W=1193 (a consequence of the 565px column); sleeping section padding 32/32.
- Avatar initial colours differ (ours slightly duller): V rgb(139,111,196), S rgb(212,53,110), A rgb(58,110,204).
- Engine note: headless Chromium wraps some text slightly differently from live Chrome, so live Chrome measurements are the primary yardstick.

## Phase 2 result (2026-09-21)
- Layout vs the live page, both measured in the user's Chrome at 1193 layout width: page height 6186 = 6186; 8 of 427 matched rows differ by >0.5px vertically and all 8 are measurement artefacts (inner img box inset by a wrapper border, a key collision "Check-in"); every section top within 0.1px; sticky bar <=0.4px; booking column identical while stuck (scroll 1200 / 2000).
- Responsive: container/hero/content grids match the reference CSS at widths 1130..1920 (content 652|372, gap 96, centred x=90/160/400, hero 560/272/272). Below 1130 the reference collapses to one column; we do not (desktop only).
- Paint (background, border, shadow, radius) vs the live reference: 0 differing among 100 matched boxes. Map rebuilt from the reference's CSS gradients; avatar colours exact; header/promo white backgrounds; hero tile placeholder #eee.
- Top of page pixel diff (Chrome screenshots): 0.06% of pixels (header text anti-aliasing, scrollbar thumb).
- Tools (all in scripts/spec): measure-page.js/measure-ours.mjs/collector.mjs (rows from Chrome), spec-diff.mjs, sections.py, side.py, styles.mjs, styles-diff.mjs, paint-diff.mjs, responsive*.mjs, bar-width.mjs, img-diff.mjs (screenshot pixel diff), rebuild-prod.sh, fnv.mjs.
- Extension quirks: background tabs throttle rendering (sticky bar never reveals, screenshots time out); the live page cannot POST to the localhost collector (request hangs), so live rows were copied by hand with hash verification.
- Extension quirks: background tabs throttle rendering (sticky bar never reveals, screenshots time out); the live page cannot POST to the localhost collector (request hangs), so live rows were copied by hand with hash verification.
- All 84 e2e tests, typecheck and lint green after Phase 2 (run 2026-09-21).

## Next
- Phase 3 motion/state timings; Phase 4 visual pass on states (hover/focus/active), icons artwork, Photo Tour + Lightbox + amenities modal geometry vs live (not yet measured!), colours of overlays; Phase 5 final checks. Photo Tour / Lightbox / modal layout have NOT been compared to the reference in this phase.

## Phase 3 findings
- Tailwind v4: buttons get the default arrow cursor (fixed globally) and hover styles are wrapped in `@media (hover: hover)`, so headless tests must emulate a hover-capable pointer (CDP Emulation.setEmulatedMedia).
- Reference has `animation: lbFade .3s ease` on the lightbox photo (ours already matches), toast slides 20px over .2s (matches), map buttons/calendar arrows/Claim/Message host have NO transitions or press scale.
- Overlays are always in the reference DOM (hidden); ours mount when opened. Both compare equal by value in motion-diff.

## Phase 3 result (2026-09-21)
- Overlay geometry vs the reference (measured via Chrome DevTools; `node scripts/spec/overlay-diff.mjs [tour|viewer|amenities]`, `YMAX=9000` for the whole tour): Photo Tour 147 rows, 0 differ >0.5px (whole scrolling content); amenities modal 27/27, 0 differ; Lightbox chrome measured live in the user's Chrome at 1208x592 and equal to ours within 0.2px (header 72, title, "N of 43", arrows, photo). Fixes: tour category labels 14px regular `line-height: normal` (wraps "Additional photos" to 2 lines: strip +16.9px), amenities modal title line-height 1.43 (31.46px).
- Overlay paint (`node scripts/spec/paint-diff.mjs --overlay tour|viewer|amenities`): tour 55/55 identical, amenities 46/46 identical incl. backdrop rgba(0,0,0,.5). Lightbox: 1 diff = reference static arrow state, ignore.
- Scrollers: carousel and review chips use native smooth scroll, no snap, hidden scrollbar; ours keeps 4px inner padding so focus rings are not clipped (same scroll range).
- All 84 e2e, typecheck, lint green. Production build compiles.
- Still open (Phase 4): icon artwork fidelity (ours hand-drawn), per-section screenshot pixel diffs beyond the top viewport, favicon/title/meta, `npm run check` full run incl. axe, HANDOFF/CLAUDE.md updates, the decision on focus trap (kept ours).

## Phase 4 result (2026-09-21)
- Icon artwork: `extract-icons.mjs` read every reference svg (142, 72 unique) into `design/spec/icons.json` (viewBox, baked paint, shapes; no markup structure or classes). `build-icon-registry.mjs` names each artwork by what it depicts and writes `components/icon-art.generated.ts` (71 artworks + 8 aliases). One `ArtIcon` component (`components/ArtIcon.tsx`) renders them inline (inherits colour, caller props win, e.g. the saved heart). All old icon modules keep their exports but wrap `ArtIcon`; `AmenityIcon` looks up `amenity-<label slug>` (crossed-out variants are their own artwork). Old hand-drawn glyph tables were moved out of the repo.
- `icon-diff.mjs` after: 83 paired icons, 67 under 5% mismatch, 0 with shape differences. The 16 above 5% (stars, one chevron) have identical boxes and art: they sit 0.5-3px lower in the Playwright engine (accumulated review-row baseline rounding), not an art issue.
- `band-diff.mjs` (reference vs ours, tolerance 24): header+title 0.01%, summary+banner 0.05%, host/highlights/about 0.08%, sleeping 0%, amenities 0%, calendar 0.05%, reviews header 0%, review cards 3.14%, location 0.08%, host 2.52%, things to know 0.06%, nearby 1.73%. The three larger bands are the 1-3px Playwright drift under the review cards (Chrome measurement equal); everything else is at or near zero.
- Head: default Next favicon, starter svgs and the description meta removed (the reference has only charset, viewport and the title).
- e2e: 10 files pass in `npm run check`; typecheck and lint clean.

## Fix log (after Phase 5)
- 2026-09-21 sub-nav tab click now smooth-scrolls (see the corrected finding above); tests/sticky-nav.e2e.mjs "tab click" rewritten (16 tests pass). Lesson: when a live behaviour looks inert, check `document.visibilityState` first; if "hidden", spy on scroll/history APIs instead of watching the screen.
- 2026-09-21 "More stays nearby": the reference has six photos for eight cards (cards 7 and 8 reuse s2 and s4; ours pointed at missing s7/s8), and its cards are plain non-interactive blocks (no link, cursor auto, no outline, no scroll). Ours are now `div`s; tests updated (12 pass in know-nearby).


## Resuming (all servers stopped 2026-09-21)
Restart what you need: dev `npm run dev` (:3000); production `bash scripts/spec/rebuild-prod.sh` (:3001, rebuilds first); Chrome-measurement collector `node scripts/spec/collector.mjs 3400`. Tests: `E2E_ORIGIN=http://localhost:3000 npm test` (or plain `npm test`, which starts its own server on :3110).
