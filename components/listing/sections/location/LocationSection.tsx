import { useId } from "react";
import type { Listing } from "@/data/types";
import { LocationMap } from "./LocationMap";
import { NeighbourhoodHighlights } from "./NeighbourhoodHighlights";

interface LocationSectionProps {
  /** Anchor id, e.g. the target of the sticky nav's "Location" link. */
  id?: string;
  location: Listing["location"];
  neighbourhood: Listing["neighbourhood"];
}

/** Where the home is: place name, drawn map and neighbourhood blurb. Owns its top divider. */
export function LocationSection({
  id,
  location,
  neighbourhood,
}: LocationSectionProps) {
  const headingId = useId();

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="border-t border-line pt-(--place-pad-top) pb-(--place-pad-bottom)"
    >
      <h2
        id={headingId}
        className="mb-(--place-title-gap) text-place-title font-medium text-ink"
      >
        Where you’ll be
      </h2>
      <p className="mb-(--place-label-gap) text-place-label text-ink">
        {location.label}
      </p>
      <LocationMap label={location.label} />
      <p className="mt-(--place-note-gap) text-place-note text-ink">
        {location.note}
      </p>
      <NeighbourhoodHighlights text={neighbourhood.text} />
    </section>
  );
}
