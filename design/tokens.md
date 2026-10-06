# Design Tokens

Light-only, desktop-only. Implemented in `app/globals.css` (Tailwind v4 CSS-first: `@theme` + `:root`).
There is no `tailwind.config.ts`.

Provenance legend:
- **devtools** = computed value pasted from the user's own browser session.
- **measured** = derived from a rendered screenshot (1192 css px viewport; the capture is 3441px wide, so ~2.887 device scale). Not from devtools.
- **~** = approximate; the source value was given as approximate.
- **unverified** = seen visually but no value supplied. Not in the theme. See "Open items".

Token names below are CSS custom property names. In Tailwind v4 the `--color-*`, `--font-*`, `--text-*`, `--radius-*`, `--shadow-*`, and `--ease-*` namespaces generate utilities (e.g. `text-ink`, `rounded-card`, `shadow-booking-card`, `ease-thumb`). Durations, layout, and gradient tokens are plain `:root` custom properties; consume them with arbitrary values, e.g. `duration-(--dur-thumb-transform)` or `bg-(image:--gradient-reserve)`.

Spacing: use Tailwind's default 4px scale (`--spacing`, not overridden). Values that are not multiples of 4 (7px, 15px, 22px, 46px, 111px) are component-specific and live under Component specs.

---

## Colors (devtools)

| Token | Value | Purpose |
|---|---|---|
| `--background` / `--color-background` | `#ffffff` | Page background, button backgrounds, lightbox overlay |
| `--color-white` | `#ffffff` | White fills, Reserve button text |
| `--foreground` / `--color-foreground` / `--color-ink` | `#222222` (rgb 34,34,34) | Body text, H1, summary lines, price, button text and borders, arrow border |
| `--color-ink-muted` | `#717171` (rgb 113,113,113) | Secondary/grey text (14px) |
| `--color-line` | `#ebebeb` (rgb 235,235,235) | 1px dividers |
| `--color-line-card` | `rgba(0,0,0,0.08)` | Booking card 1px border |
| `--color-brand-reserve-start` | `#e61e4d` (rgb 230,30,77) | Reserve gradient, 0% |
| `--color-brand-reserve-mid` | `#e31c5f` (rgb 227,28,95) | Reserve gradient, 50% |
| `--color-brand-reserve-end` | `#d70466` (rgb 215,4,102) | Reserve gradient, 100% |
| `--gradient-reserve` | `linear-gradient(to right, #e61e4d 0%, #e31c5f 50%, #d70466 100%)` | Reserve button background |

Note: no dark mode. The `prefers-color-scheme` block was removed on purpose.

## Typography

Font stack (`--font-sans`, applied to `body`):

```
"Airbnb Cereal VF", "Airbnb Cereal", Circular, -apple-system, BlinkMacSystemFont,
"Segoe UI", Roboto, "Helvetica Neue", sans-serif
```

Font file: `public/Airbnb.woff2`, a single variable font (weight axis 100-900; verified: widths vary smoothly across weights; covers ₹ · | é but NOT ★ ✓, so ratings use SVG stars). Loaded via `next/font/local` in `app/layout.tsx` as `--font-airbnb`, first in the stack.

| Role | Token | Size | Weight | Color | Line-height | Source |
|---|---|---|---|---|---|---|
| Body | `--text-body` | 14px | (regular, not stated) | `--color-ink` | not given | devtools |
| Secondary text | `--text-body` | 14px | not stated | `--color-ink-muted` | not given | devtools |
| Guests/bedrooms/beds/baths line | `--text-body-lg` | 16px | not stated | `--color-ink` | not given | devtools |
| Reserve button label | `--text-body-lg` | 16px | 500 | white | not given | devtools |
| Show all photos label | `--text-caption` | 12px | 500 | `--color-ink` | 16px (`--text-caption--line-height`) | devtools |
| Summary heading ("Entire serviced apartment...") | `--text-title-sm` | 22px | 500 | `--color-ink` | not given | devtools |
| Price | `--text-title-sm` | 22px | 500 | `--color-ink` | not given | devtools |
| H1 (listing title) | `--text-title` | 26px | 500 | `--color-ink` | not given | devtools |

Weight 500 = Tailwind `font-medium`. Line-height is only known for the Show all button; the rest are flagged below rather than guessed.

## Layout

### Measured from screenshot (NOT devtools), 1192 css px viewport

| Token | Value | Notes |
|---|---|---|
| `--layout-page-gutter` | ~80px | Page side padding |
| `--layout-content-width` | 1032px | 1192 - 2 x 80. Whether this is a max-width or just the result of the viewport is still unknown (see Open items) |
| `--layout-grid-cols` | `2.056fr 1fr 1fr` (= 515 / 250.5 / 250.5 px) | Measured from screenshot edges (round 2 of pixel-diff review): col1 515 / col2 250.5 / col3 250.5 css px with 8px gaps = 1032 (symmetric small columns; an earlier 515/250/251 split was replaced since a real layout cannot be asymmetric). Devtools said ~516 / 250 / 250; the screenshot places col2 at x=603 and col3 at x=861 css, i.e. 1 css px earlier than 516/250/250 would. Aligning to the measurement cut col2/col3 photo mismatch by ~35%. Revert to `516fr 250fr 250fr` if a devtools re-read disagrees |
| `--layout-header-height` | 88px | Bar height; a 1px `--color-line` border sits below it (measured) |
| `--layout-header-search-height` | 48px | Search pill, vertically centred (measured) |
| `--layout-header-circle-size` | 40px | Globe and menu buttons, bg `--color-surface-muted` (measured) |
| `--layout-header-search-btn-size` | 32px | Red circular search button inside the pill, bg `--color-brand` (measured) |
| Header pill border / dividers | 1px `#dddddd` | Measured from screenshot (border and 24px-tall dividers both sample ~rgb 221) |
| Header pill shadow | `0 1px 4px rgba(0,0,0,0.1)` | Measured from screenshot: fitted against the shadow falloff (top ~6px, bottom ~12px, sides ~9px at 2.887x) |
| Header pill inner spacing | pl 28px, icon gap 16px, segment dividers mx 16px, search-btn ml 24px, pr 7px | Measured from screenshot (element-to-element gaps; pr 7 + 1px border = 8px from pill edge to red button, same as top/bottom) |
| Header globe / menu glyphs | 16px box, 1.5px stroke; globe circle fills the box, menu bars 14px wide at 4px pitch, butt caps | Measured from screenshot |
| `--layout-content-col-width` | ~561px | Listing content column (left of booking card) |
| `--layout-content-card-gap` | ~96px | Gap between content column and booking card |
| `--layout-booking-card-width` | 372px | Also given by devtools as ~372px |

Resolved: the screenshot viewport is ~1192px, not 1200 (grid rows measure 224 css px and the 8px gap measures 22 device px, both at 2.887x). Content is therefore 1032px, which matches the devtools grid exactly, and 561 + 96 + 372 = 1029 is within measurement error of it.

### From devtools

| Token | Value | Notes |
|---|---|---|
| `--layout-grid-gap` | 8px | Photo grid, both directions |
| `--layout-grid-row-height` | ~224px | 2 rows. Grid height = 2 x 224 + 8 = ~456px |
| `--layout-tour-thumb-cols` | 8 | Photo Tour top thumbnail grid |
| `--layout-tour-thumb-size` | ~111px | Column width |
| `--layout-tour-thumb-gap` | 12px | Row and column gap |
| `--layout-tour-thumbs-margin-bottom` | 40px | |
| `--layout-tour-text-width` | ~500px | Sticky text panel |
| `--layout-tour-photo-width` | ~458px | Photo column |
| `--layout-tour-photo-gap` | 12px | Flex column row-gap between photos |
| `--layout-avatar-size` | ~46px | Host avatar, circular (`rounded-full`) |
| `--layout-arrow-size` | 40px | Lightbox prev/next arrow |

Note: Photo Tour overall row is ~976px, but ~500 + ~458 = ~958px; the implied ~18px is presumably a column gap that was not given. Thumbnail grid: 8 x ~111 + 7 x 12 = ~972px, consistent with ~976 within rounding.

## Radii (devtools)

| Token | Value | Used by |
|---|---|---|
| `--radius-grid` | 12px | Photo grid outer corners |
| `--radius-card` | 12px | Booking card |
| `--radius-button` | 8px | Show all photos button |
| `--radius-thumb` | 8px | Photo Tour top thumbnails |
| `--radius-pill` | 999px | Reserve button |
| (Tailwind `rounded-full`) | 50% | Host avatar, lightbox arrows (circle) |

## Shadows (devtools)

| Token | Value | Used by |
|---|---|---|
| `--shadow-show-all` | `0 2px 8px 0 rgba(0,0,0,0.15)` | Show all photos button |
| `--shadow-booking-card` | `0 6px 16px 0 rgba(0,0,0,0.12)` | Booking card |

## Motion

All durations are plain `:root` custom properties (no Tailwind duration namespace in v4). Easings are in `--ease-*`. Every transition in components must reference one of these; no inline magic numbers.

| Component | Property | Duration token | Duration | Easing token | Easing |
|---|---|---|---|---|---|
| Show all photos | transform | `--dur-showall-transform` | 0.1s | `--ease-standard` | `ease` |
| Show all photos | background | `--dur-showall-background` | 0.15s | `--ease-standard` | `ease` |
| Reserve button | filter | `--dur-reserve-filter` | 0.15s | `--ease-standard` | `ease` |
| Reserve button | transform | `--dur-reserve-transform` | 0.05s | `--ease-standard` | `ease` |
| Photo Tour thumbnail | transform | `--dur-thumb-transform` | 0.25s | `--ease-thumb` | `cubic-bezier(0.2, 0, 0, 1)` |
| Photo Tour thumbnail | filter | `--dur-thumb-filter` | 0.2s | `--ease-standard` | `ease` |
| Lightbox overlay | opacity (open/close) | `--dur-lightbox-fade` | ~0.25s | `--ease-standard` | `ease` |
| Lightbox arrow | background | `--dur-arrow-background` | 0.16s | `--ease-standard` | `ease` |
| Lightbox arrow | transform | `--dur-arrow-transform` | 0.08s | `--ease-standard` | `ease` |

Easing was stated in the paste for every row above (`ease`, or the cubic-bezier for the thumbnail transform). The lightbox fade duration is approximate (~0.25s).

## Component specs

### Photo grid
- Grid: 3 columns (`--layout-grid-cols`), 2 rows (~224px), gap 8px, container radius 12px (`--radius-grid`, overflow hidden).
- Column widths 515 / 250.5 / 250.5 px at the 1192px viewport (measured from screenshot edges; devtools read ~516 / 250 / 250, see `--layout-grid-cols`).

### "Show all photos" button
- `position: absolute; bottom: 24px; right: 24px`
- Border ~1px solid `--color-ink`; radius 8px; background white
- Shadow `--shadow-show-all`
- Padding 7px vertical / 15px horizontal (border-box implication: 7 + 1px border = 8px, 15 + 1 = 16px effective)
- Text 12px, weight 500, line-height 16px
- Transition: transform 0.1s ease, background 0.15s ease
- Hover/active/focus values: NOT GIVEN (see Open items)

### Booking card
- Width ~372px; border ~1px solid `--color-line-card`; radius 12px; shadow `--shadow-booking-card`
- Padding: 22px top, 24px left/right, 24px bottom
- Price: 22px, weight 500

### Reserve button
- Background `--gradient-reserve`; radius 999px; height 48px; padding 0 24px
- Text white, 16px, weight 500
- Transition: filter 0.15s ease, transform 0.05s ease
- Hover/active values: NOT GIVEN (transition properties imply `filter` change on hover, e.g. brightness, and `transform` on press, but the end values are unknown)

### Summary, host row, dividers
- Summary heading 22px / 500; details line 16px; secondary text 14px `--color-ink-muted`
- Divider 1px solid `--color-line`
- Host avatar ~46px x 46px, circular

### Photo Tour view
- Layout: room-by-room scrollytelling. Left text panel (room name + amenities) is sticky while that room's photos scroll in the right column; the panel content swaps to the next room based on scroll position (IntersectionObserver pattern, not a hard page break).
- Top thumbnail grid: 8 columns of ~111px, gap 12px both directions, margin-bottom 40px, thumbnail radius 8px.
- Thumbnail hover transition: transform 0.25s `cubic-bezier(0.2,0,0,1)`, filter 0.2s ease (end values NOT GIVEN).
- Room section padding: 16px top, 0 sides, 4px bottom.
- Photo column: flex column, row-gap 12px, ~458px wide. Text panel ~500px. Overall row ~976px.

### Lightbox
- Full-screen overlay, white background, opacity fade ~0.25s ease on open and close.
- Prev/next arrow: 40px x 40px circle, white background, ~1px solid `--color-ink` border, centered vertically via `top: 50%; transform: translateY(-50%)`.
- Arrow transition: background 0.16s ease, transform 0.08s ease (hover background and press transform end values NOT GIVEN). Note the hover/press `transform` must preserve the `translateY(-50%)` centering.
- Horizontal offset of arrows from the viewport edge: NOT GIVEN.

---

## Open items / unverified (please re-inspect these specific elements)

1. ~~Font file~~ - resolved: `public/Airbnb.woff2` is wired in (see Typography). Re-check H1 vertical alignment after the font swap.
2. **Brand red**: `--color-brand` #ff385c is *sampled from screenshot pixels* (rgb 255,56,92), not from devtools. Distinct from the Reserve gradient stops. Confirm if exactness matters.
3. **Header**: geometry and colours are now *measured from the screenshot* (see Layout). Pill border/shadow, dividers and globe/menu glyph geometry are now measured (see Layout). Still missing: nav/search typography (assumed 14px, 500 for "Anywhere / Anytime / Become a host", 400 grey for "Add guests" - unverified; x-heights match the screenshot, widths do not because of the font) and any scroll behaviour.
4. **Hover / active / focus states not given**: Show all photos (transform and background end values), Reserve button (filter value, transform value), Photo Tour thumbnails (transform scale and filter, e.g. brightness), lightbox arrows (hover background color, press transform). Focus ring style for all interactive elements is also missing.
5. **Lightbox**: close button (size, position, icon, shape, hover), arrow icon (glyph and size), arrow offset from edges, photo max size and padding, counter/caption typography, backdrop details beyond "white".
6. **Photo Tour**: header/back/close control, room name and amenity typography (sizes, weights, line-heights, colors), sticky `top` offset, the gap between text panel and photo column (~18px implied), photo radius in the right column, and any scroll-swap transition timing (the info panel swap animation, if any).
7. **Line-heights**: only known for the Show all button (16px). H1, 22px lines, 14px, 16px lines need re-inspection. Letter-spacing is also unknown for all text.
8. **Text weights for non-500 text**: body, the 16px details line, and the 14px secondary text weights were not stated (assumed regular 400 but unverified).
9. **Layout ambiguity**: whether the 1032px content width is a fixed max-width (and centred) or just the result of a 1192px viewport minus 80px gutters. Needs one more devtools reading at a different window width, or a second screenshot.
10. **Booking card internals**: date/guest input styling, price sub-text, labels, fee rows, "You won't be charged yet" line, and internal dividers.
11. **Icons**: sizes, stroke, and colors for all icons (share, save, amenities, show-all icon if any).
12. **Lightbox fade** is ~0.25s (approximate); confirm exact value and whether open and close use the same duration/easing.
13. **Section spacing**: vertical rhythm between listing sections (padding/margin around dividers) was not provided beyond the Photo Tour room section padding.
14. **Photo Tour / Lightbox chrome (implemented with guesses, `features/gallery`)**: these were built to the devtools values above, but the following are *my assumptions* and need the reference to confirm: the visible "Photo tour" heading (size 22px/500) above the thumbnails; thumbnail aspect ratio (3:2 at ~111px wide); thumbnail hover end-values (`--thumb-hover-scale: 1.02`, `--thumb-hover-brightness: 0.95`); text-panel sticky offset (`--layout-tour-panel-top: 96px`); photo-column photo radius (currently 0); tour header/close button (64px sticky bar, X at left); Lightbox close button and "n / N" counter placement; Lightbox photo margins (96px each side); arrow offset (24px from the edge). The tour has no fade (only the Lightbox is specified to fade). Tour room names/details in `data/listing.ts` are mock placeholders.

## Header assets & fitted values (from the real assets, pixel-fitted to the screenshot)

| Item | Value | How |
|---|---|---|
| Logo | Inline SVG (`components/brand/AirbnbLogo.tsx`), viewBox 3490x1080, rendered 32px tall (~103.4px wide), `fill: currentColor`, colour `--color-brand` | Asset supplied by the user from the reference; vertical centre matches the screenshot to 0.15 css px |
| Search-pill house icon | `public/brand/search-house.png` (240x216, transparent padding + soft shadow), rendered in a **48x48** box (`object-contain`, so the artwork draws ~48x43), box left edge at x~412 | Box size given by the user from the reference; an earlier pixel-fit (~49x44 css, left 412, centred on the 88px bar) agrees with it |
| Pill padding | left 18px, right 8px, 8px gap between icon and "Anywhere" | Derived from the fit: 393 (pill edge) + 1 (border) + 18 = 412; 412 + 48.9 + 8 = 468.9 vs 468.7 measured for the text |

## Values read from the reference's rendered styles (values only)

Source: Live inspection via the Claude-in-Chrome DevTools session. Only computed values, measurements, and tokens were recorded; our
implementation and class names are completely our own.

| Token / behaviour | Value |
|---|---|
| Palette | ink `#222`, muted `#717171` (and `#6a6a6a`), line `#ddd`, soft line `#ebebeb`, brand `#ff385c`, grey-100 `#f7f7f7`, grey-200 `#f2f2f2`, grey-300 `#ebebeb`, card border `rgba(0,0,0,.08)` |
| Reserve gradient (rest / hover) | `#e61e4d → #e31c5f → #d70466` / `#d81b5f → #c31a5b → #bd0463` (left to right) |
| Container | `max-width: 1280px` (page gutter 80px at 1192px wide) |
| Font | one variable file, weight axis **200-900** |
| Hover fills | Show all photos / Show all amenities / Become a host / Previous+Next arrows: `#f7f7f7`; Share, Save, Claim, Back: `#f2f2f2`; globe/menu circles, Message host: `#ebebeb` |
| Search pill hover | shadow `0 2px 8px rgba(0,0,0,.12)` |
| Hero photo hover / press | dark overlay `rgba(0,0,0,.10)` / `scale(.997)` |
| Press (`:active`) scales | Reserve `.985`, Show all photos `.96`, Share/Save `.96`, Show all amenities `.98`, Back `.9`, lightbox arrows `translateY(-50%) scale(.92)` |
| Tour thumbnail hover / press | image `scale(1.04)` + `brightness(.94)` / `scale(.99)` (replaces the earlier 1.02/.95 guesses) |
| Tour photo hover | image `scale(1.04)`, overlay `rgba(0,0,0,.08)` |
| Keyboard focus | `outline: 2px solid #222; outline-offset: 2px; border-radius: 6px` |
| Transitions in use | fill `.15-.2s`, press `.05-.08s`, overlay fade `opacity .25s ease`, modal enter `opacity+transform .3s cubic-bezier(.2,0,0,1)`, thumbnails `.25s cubic-bezier(.2,0,0,1)` |
| Lightbox arrows | can be **disabled** (no wrap): Previous is disabled on the first photo |
| Photo Tour top bar | **Back**, Share, Save (not a Close X); category thumbnails are buttons labelled with the room name |
| Lightbox dialog | contains a **Show all photos** button next to Close / Previous / Next |
| Photo Tour URL | `?modal=PHOTO_TOUR_SCROLLABLE` (deep-linkable overlay) |

Resolved open items: thumbnail hover end-values, arrow hover/press values, focus ring, Reserve hover, container width.
Still open: tour top-bar layout and spacing, lightbox chrome placement, modal enter animation targets (needs a capture of
those open states with computed styles).

## Photo Tour and Photo viewer (values from the reference; implemented in `features/gallery`)

| Item | Value |
|---|---|
| Tour overlay | full-screen white; enters with `opacity` + `translateY(28px)` over .3s `cubic-bezier(.2,0,0,1)`, exits the same way |
| Tour bar | 88px tall, 32px side padding; Back (left, -8px margin), title "Photo tour" centred (16px/500), Share + Save on the right (2px gap) |
| Round icon buttons | 40px circle, 18px icon; hover fill `#f2f2f2`; press `scale(.9)`; transition fill .16s + transform .08s |
| Content column | `max-width: 1024px`, side padding 24px, bottom padding 96px |
| Category strip | 8 columns, 12px gap, 40px below; image aspect 106:100, 8px radius; hover `scale(1.04)` + `brightness(.94)`, press `scale(.99)`; label 13px/500 `#717171`, 8px under the image |
| Room section | two equal columns, 60px column gap, 20px row gap, padding 16px 0 4px; left column sticky at `top: 20px` |
| Room title / details | 32px/500, line-height 1.1, letter-spacing -0.02em / 16px `#717171`, 8px above, line-height 1.4 |
| Photos | 3:2, 8px radius, bg `#eee`; hover: image `scale(1.04)` over .4s `cubic-bezier(.2,0,0,1)` + overlay `rgba(0,0,0,.08)` (.2s); rows of 1 or 2 with a 12px gap |
| Row rule | rows alternate 1 wide / 2 side by side starting with 1; when exactly 2 remain they form a pair (verified against all 9 rooms) |
| Viewer | white; fades .25s ease; header 72px (grid button left, room name centred 16px/500, counter 14px + Close right); stage padding 88px 96px; image `max-width: min(1100px, 100%)`, contained; image fades in .3s on change |
| Viewer arrows | 40px circle, 1px `#222` border, white; 20px from the edges; hover `#f7f7f7`; press `translateY(-50%) scale(.92)`; disabled: opacity .28, border `#ccc` |

## Share / Save feedback (values from the reference stylesheet; `features/listing-actions`)

| Item | Value |
|---|---|
| Toast | dark pill: background `#222`, white 14px/500 text, padding `14px 22px`, radius 8px; fixed at the bottom centre, 32px above the bottom edge; hidden state is `opacity 0` + 20px lower, shown state fades in and rises over `.2s`; no pointer events; announced as a polite status |
| Saved state | the heart's icon colour becomes brand `#ff385c` (outline only; the icon's fill stays none). The button label stays "Save" |
| Not in the snapshot | the toast wording and how long it stays: ours are "Link copied", "Saved to wishlist", "Removed from wishlist" and 2.5s |

