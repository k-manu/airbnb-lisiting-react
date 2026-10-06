import { listing } from "@/data/listing";
import { ListingActionsProvider } from "@/features/listing-actions";
import { StickyNav } from "@/features/sticky-nav";

const sections = [
  { id: "photos", label: "Photos" },
  { id: "amenities", label: "Amenities" },
  { id: "reviews", label: "Reviews" },
  { id: "location", label: "Location" },
];

/** Tall filler standing in for a page section; the last one is deliberately short. */
function Block({ id, height }: { id?: string; height: number }) {
  return (
    <section
      id={id}
      aria-label={id ?? "intro"}
      style={{ height }}
      className="scroll-mt-(--sticky-nav-total-height) border-t border-line py-8 text-title"
    >
      {id ?? "intro (title, host, description: no tab of its own)"}
    </section>
  );
}

/**
 * Dev-only sandbox: the bar over filler blocks that carry the anchor ids (the hero is followed by
 * untabbed content, as on the real page, so "Photos" stays current after it), so
 * scrolling, the reveal and the section spy can be exercised on their own.
 */
export default function Page() {
  return (
    <ListingActionsProvider>
      <StickyNav
        sections={sections}
        observeId="photos"
        price={{
          currency: listing.pricing.currency,
          total: listing.pricing.total,
          nights: listing.stay.nights,
        }}
        rating={{ value: listing.rating.value, count: listing.rating.count }}
        reserve={{ label: "Reserve" }}
      />
      <main className="px-(--layout-page-gutter)">
        <div aria-hidden style={{ height: 88 }} />
        <Block id="photos" height={520} />
        <Block height={900} />
        <Block id="amenities" height={1100} />
        <Block id="reviews" height={1000} />
        <Block id="location" height={320} />
        <p id="booking" className="sr-only">
          Booking card
        </p>
      </main>
    </ListingActionsProvider>
  );
}
