import Image from "next/image";
import type { RatingSummary } from "@/data/types";

// Intrinsic size of the laurel bitmaps; the drawn height comes from the token
// and the width follows the bitmap's aspect ratio.
const LAUREL_WIDTH = 240;
const LAUREL_HEIGHT = 365;

function Laurel({ side }: { side: "left" | "right" }) {
  return (
    <Image
      src={`/assets/images/ui/laurel-${side}.png`}
      alt=""
      width={LAUREL_WIDTH}
      height={LAUREL_HEIGHT}
      unoptimized
      className="h-(--reviews-laurel-height) w-auto"
    />
  );
}

/** Big score between two laurels, the "Guest favourite" title and its blurb. */
export function RatingHeadline({
  rating,
  headingId,
}: {
  rating: RatingSummary;
  headingId: string;
}) {
  return (
    <div className="pt-(--reviews-headline-pad-top) pb-(--reviews-headline-pad-bottom) text-center">
      <p className="flex items-center justify-center gap-(--reviews-score-gap)">
        <Laurel side="left" />
        <span className="sr-only">
          Rated {rating.value} out of 5 from {rating.count} reviews
        </span>
        <span
          aria-hidden="true"
          className="text-review-score font-medium tracking-review-score text-ink"
        >
          {rating.value}
        </span>
        <Laurel side="right" />
      </p>
      <h2
        id={headingId}
        className="mt-2 text-title-sm leading-(--reviews-leading) font-medium text-ink"
      >
        {rating.favouriteHeading}
      </h2>
      <p className="mx-auto mt-2 max-w-(--reviews-blurb-max-width) text-review-blurb text-ink">
        {rating.favouriteText}
      </p>
      <button
        type="button"
        className="mt-3.5 px-1.5 py-px text-body leading-[normal] font-medium text-ink underline"
      >
        How reviews work
      </button>
    </div>
  );
}
