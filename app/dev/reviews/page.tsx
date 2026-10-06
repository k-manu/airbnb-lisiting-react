import { listing } from "@/data/listing";
import { ReviewsSection } from "@/components/listing/sections/reviews/ReviewsSection";
import { SectionSandbox } from "../_components/SectionSandbox";

export default function Page() {
  return (
    <SectionSandbox top={2668} layout="full">
      <ReviewsSection
        id="reviews"
        rating={listing.rating}
        reviews={listing.reviews}
      />
    </SectionSandbox>
  );
}
