import type { Listing } from "@/data/listing";
import { AmenitiesModal } from "./amenities/AmenitiesModal";
import { AmenityRow } from "./amenities/AmenityRow";

/** "What this place offers": the ten highlighted amenities + full-list modal. */
export function AmenitiesSection({
  amenities,
  id,
}: {
  amenities: Listing["amenities"];
  /** Anchor target for the sticky nav. */
  id?: string;
}) {
  // The modal lists plain labels; carry the "not available" flags across.
  const unavailable = new Set(
    amenities.items.filter((item) => !item.available).map((item) => item.label),
  );

  return (
    <section
      id={id}
      aria-labelledby="amenities-heading"
      className="border-t border-line py-(--amenities-section-pad-y) leading-(--amenities-leading)"
    >
      <h2
        id="amenities-heading"
        className="mb-(--amenity-heading-gap) text-title-sm leading-(--amenities-heading-leading) font-medium text-ink"
      >
        What this place offers
      </h2>
      <ul className="mb-(--amenity-list-gap-below) grid grid-cols-2 gap-x-(--amenity-list-gap-x) gap-y-(--amenity-list-gap-y)">
        {amenities.items.map((item) => (
          <AmenityRow
            key={item.id}
            label={item.label}
            unavailable={!item.available}
            className="py-(--amenity-row-pad-y)"
          />
        ))}
      </ul>
      <AmenitiesModal
        total={amenities.total}
        groups={amenities.groups}
        unavailable={unavailable}
      />
    </section>
  );
}
