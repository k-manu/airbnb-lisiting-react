import type { RatingSummary } from "@/data/listing";
import { LaurelIcon, RatingStarIcon } from "./top/icons";

/** The bordered "Guest favourite · rating · reviews" strip under the summary. */
export function GuestFavouriteBanner({ rating }: { rating: RatingSummary }) {
  if (!rating.guestFavourite) return null;

  return (
    <section
      aria-label="Rating summary"
      className="mt-8 flex items-center gap-banner-gap rounded-banner border border-border-strong px-7 py-4 leading-body text-ink"
    >
      <div className="flex shrink-0 items-center gap-1" aria-hidden>
        <LaurelIcon className="h-9 w-auto" />
        <p className="text-center text-body-md leading-badge font-medium">
          {rating.favouriteHeading.split(" ").map((word) => (
            <span key={word} className="block">
              {word}
            </span>
          ))}
        </p>
        <LaurelIcon className="h-9 w-auto -scale-x-100" />
      </div>

      <p className="flex-1 text-body leading-compact">{rating.bannerText}</p>

      <div className="flex shrink-0 items-center gap-banner-gap">
        <div className="text-center">
          <p className="text-xl leading-body font-bold">
            {rating.value.toFixed(2)}
            <span className="sr-only"> out of 5 stars</span>
          </p>
          <div aria-hidden className="mt-0.5 flex justify-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <RatingStarIcon key={i} className="size-2.5" />
            ))}
          </div>
        </div>

        <span
          aria-hidden
          className="h-(--banner-divider-height) w-px bg-border-strong"
        />

        <div className="text-center">
          <p className="text-xl leading-body font-bold">{rating.count}</p>
          <p className="text-note font-medium">Reviews</p>
        </div>
      </div>
    </section>
  );
}
