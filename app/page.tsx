import { listing } from "@/data/listing";
import { GalleryProvider, PhotoGrid } from "@/features/gallery";
import { StickyNav } from "@/features/sticky-nav";
import { ListingActionsProvider } from "@/features/listing-actions";
import { Header } from "@/components/listing/Header";
import { TitleRow } from "@/components/listing/TitleRow";
import { SummaryHeading } from "@/components/listing/sections/SummaryHeading";
import { GuestFavouriteBanner } from "@/components/listing/sections/GuestFavouriteBanner";
import { HostRow } from "@/components/listing/sections/HostRow";
import { HighlightList } from "@/components/listing/sections/HighlightList";
import { AboutSection } from "@/components/listing/sections/AboutSection";
import { SleepingSection } from "@/components/listing/sections/SleepingSection";
import { AmenitiesSection } from "@/components/listing/sections/AmenitiesSection";
import { CalendarSection } from "@/components/listing/sections/CalendarSection";
import { BookingColumn } from "@/components/listing/sections/BookingColumn";
import { ReviewsSection } from "@/components/listing/sections/reviews/ReviewsSection";
import { LocationSection } from "@/components/listing/sections/location/LocationSection";
import { MeetYourHostSection } from "@/components/listing/sections/host/MeetYourHostSection";
import { ThingsToKnowSection } from "@/components/listing/sections/things-to-know/ThingsToKnowSection";
import { NearbyStaysSection } from "@/components/listing/sections/nearby/NearbyStaysSection";

/** Tabs of the sticky bar, in page order; each id is a section below. */
const NAV_SECTIONS = [
  { id: "photos", label: "Photos" },
  { id: "amenities", label: "Amenities" },
  { id: "reviews", label: "Reviews" },
  { id: "location", label: "Location" },
];

export default function ListingPage() {
  return (
    <ListingActionsProvider>
      <GalleryProvider
        photos={listing.photos}
        rooms={listing.rooms}
        featuredIds={listing.featuredPhotoIds}
      >
        <Header />
        <StickyNav
          sections={NAV_SECTIONS}
          observeId="photo-grid"
          price={{
            currency: listing.pricing.currency,
            total: listing.pricing.total,
            nights: listing.stay.nights,
          }}
          rating={{ value: listing.rating.value, count: listing.rating.count }}
          reserve={{ label: "Reserve" }}
        />

        <main id="main" className="mx-auto w-full max-w-(--layout-page-max) px-(--layout-page-gutter)">
          <div id="photos">
            <TitleRow title={listing.title} />
            <div id="photo-grid">
              <PhotoGrid />
            </div>
          </div>

          {/* Left column takes the rest; 565 + 96 + 372 = 1033 at a 1193px viewport. */}
          <div className="grid grid-cols-[1fr_var(--layout-booking-card-width)] gap-x-(--layout-content-card-gap) pt-12">
            <div>
              <SummaryHeading summary={listing.summary} />
              <GuestFavouriteBanner rating={listing.rating} />
              <HostRow host={listing.host} />
              <HighlightList items={listing.highlights} />
              <AboutSection description={listing.description} />
              <SleepingSection areas={listing.sleeping} />
              <AmenitiesSection id="amenities" amenities={listing.amenities} />
              <CalendarSection
                stay={listing.stay}
                calendar={listing.calendar}
                location={listing.summary.location}
              />
            </div>

            <BookingColumn pricing={listing.pricing} stay={listing.stay} />
          </div>

          <ReviewsSection
            id="reviews"
            rating={listing.rating}
            reviews={listing.reviews}
          />
          <LocationSection
            id="location"
            location={listing.location}
            neighbourhood={listing.neighbourhood}
          />
          <MeetYourHostSection host={listing.host} />
          <ThingsToKnowSection data={listing.thingsToKnow} />
          <NearbyStaysSection data={listing.nearby} />
        </main>
      </GalleryProvider>
    </ListingActionsProvider>
  );
}
