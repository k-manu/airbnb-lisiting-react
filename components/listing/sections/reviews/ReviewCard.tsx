import type { Review } from "@/data/types";
import { StarIcon } from "./icons";
import { ReviewText } from "./ReviewText";
import { ReviewerAvatar } from "./ReviewerAvatar";

/** Filled stars, one per rating point; the numeric rating is read out instead. */
function StarRow({ rating }: { rating: number }) {
  return (
    <span aria-hidden="true" className="flex gap-(--reviews-star-gap)">
      {Array.from({ length: rating }, (_, index) => (
        <StarIcon key={index} className="size-(--reviews-star-size)" />
      ))}
    </span>
  );
}

/** One guest review: who, when, how many stars, and what they wrote. */
export function ReviewCard({ review }: { review: Review }) {
  return (
    <article>
      <header className="mb-2.5 flex items-center gap-3">
        <ReviewerAvatar author={review.author} />
        <div>
          <h3 className="text-review-name font-medium text-ink">
            {review.author.name}
          </h3>
          <p className="text-review-meta text-ink-muted">{review.tenure}</p>
        </div>
      </header>
      <p className="mb-1.5 flex items-center gap-1.5 text-review-meta text-ink">
        <StarRow rating={review.rating} />
        <span className="sr-only">Rated {review.rating} out of 5</span>
        <span aria-hidden="true">·</span>
        <span>{review.when}</span>
      </p>
      <ReviewText text={review.text} />
    </article>
  );
}
