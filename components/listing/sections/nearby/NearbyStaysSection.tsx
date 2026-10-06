import type { Listing } from "@/data/listing";
import { NearbyCarousel } from "./NearbyCarousel";
import { NearbyStayCard } from "./NearbyStayCard";

/** "More stays nearby": a paged row of stay cards. */
export function NearbyStaysSection({ data }: { data: Listing["nearby"] }) {
  return (
    <section
      aria-labelledby="nearby-heading"
      className="border-t border-line py-(--know-section-padding-y)"
    >
      <NearbyCarousel
        label="Nearby stays"
        heading={
          <h2
            id="nearby-heading"
            className="text-title-sm leading-(--know-heading-line-height) font-medium text-ink"
          >
            More stays nearby
          </h2>
        }
      >
        {data.items.map((stay) => (
          <NearbyStayCard key={stay.id} stay={stay} />
        ))}
      </NearbyCarousel>
    </section>
  );
}
