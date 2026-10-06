import type { ReactNode } from "react";
import { HomePinIcon, MagnifierIcon, MinusIcon, PlusIcon } from "./icons";

const CONTROL =
  "flex size-(--map-control-size) items-center justify-center bg-white text-ink shadow-map-control";
const ZOOM_BUTTON = `${CONTROL} rounded-(--map-control-radius) focus-visible:rounded-(--map-control-radius)!`;

function ControlIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-(--map-control-icon-size)">{children}</span>
  );
}

/**
 * The map with its controls. As in the reference the map is a still picture:
 * the search and zoom buttons are there (with no hover or press change, like the
 * reference) but do not change the view.
 */
export function LocationMap({ label }: { label: string }) {
  return (
    <div
      role="group"
      aria-label={`Map of ${label}`}
      className="relative h-(--map-height) overflow-hidden rounded-(--map-radius) bg-map-base"
    >
      {/* The picture is plain CSS in the reference too: two parks, a slanted coastline
          (water up to 34% of the width along a 115deg line) and a faint 90px street grid. */}
      <div aria-hidden className="absolute inset-0 bg-(image:--map-artwork)" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-(image:--map-grid) bg-size-[90px_90px] opacity-50"
      />

      <button
        type="button"
        aria-label="Search"
        className={`${CONTROL} absolute top-(--map-control-inset) left-(--map-control-inset) rounded-full focus-visible:rounded-full!`}
      >
        <ControlIcon>
          <MagnifierIcon />
        </ControlIcon>
      </button>

      <div
        role="group"
        aria-label="Map zoom"
        className="absolute top-(--map-control-inset) right-(--map-control-inset) flex flex-col gap-(--map-control-gap)"
      >
        <button type="button" aria-label="Zoom in" className={ZOOM_BUTTON}>
          <ControlIcon>
            <PlusIcon />
          </ControlIcon>
        </button>
        <button type="button" aria-label="Zoom out" className={ZOOM_BUTTON}>
          <ControlIcon>
            <MinusIcon />
          </ControlIcon>
        </button>
      </div>

      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 flex size-(--map-pin-size) -translate-1/2 items-center justify-center rounded-full bg-ink text-white shadow-map-pin"
      >
        <HomePinIcon className="h-(--map-pin-glyph-height) w-(--map-pin-glyph-width) translate-y-(--map-pin-glyph-shift)" />
      </div>
    </div>
  );
}
