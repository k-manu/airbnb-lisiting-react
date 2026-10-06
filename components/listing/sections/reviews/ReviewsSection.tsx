import { useId } from "react";
import type { Listing } from "@/data/types";
import { RatingBreakdown } from "./RatingBreakdown";
import { RatingHeadline } from "./RatingHeadline";
import { ReviewCard } from "./ReviewCard";
import { ReviewTagRow } from "./ReviewTagRow";

interface ReviewsSectionProps {
  /** Anchor id, e.g. the target of the sticky nav's "Reviews" link. */
  id?: string;
  rating: Listing["rating"];
  reviews: Listing["reviews"];
}

/** Rating summary, topic chips and the first reviews. Owns its top divider. */
export function ReviewsSection({ id, rating, reviews }: ReviewsSectionProps) {
  const headingId = useId();

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="border-t border-line py-(--reviews-pad-y)"
    >
      <RatingHeadline rating={rating} headingId={headingId} />
      <RatingBreakdown rating={rating} />
      <ReviewTagRow tags={reviews.tags} />
      <ul className="grid grid-cols-2 gap-x-(--reviews-grid-gap-x) gap-y-(--reviews-grid-gap-y) pb-(--reviews-grid-pad-bottom)">
        {reviews.items.map((review) => (
          <li key={review.id}>
            <ReviewCard review={review} />
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="transition-reviews-button rounded-card border border-ink bg-white p-(--reviews-button-pad) text-body-lg leading-[normal] font-medium text-ink hover:bg-grey-100 active:scale-(--reviews-btn-press-scale)"
      >
        Show all {rating.count} reviews
      </button>
    </section>
  );
}
