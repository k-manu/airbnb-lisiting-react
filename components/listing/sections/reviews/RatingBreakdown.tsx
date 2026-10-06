import type { RatingSummary } from "@/data/types";
import { CATEGORY_ICONS } from "./icons";

const STARS = [5, 4, 3, 2, 1] as const;

/** One column of the breakdown row; every column after the first shows a rule on its left (the first keeps the space). */
const CELL =
  "px-(--reviews-cell-pad-x) not-first:border-l not-first:border-reviews-rule";
const CELL_LABEL =
  "mb-3 text-body leading-(--reviews-leading) font-medium text-ink";

function OverallBars({ rating }: { rating: RatingSummary }) {
  return (
    <div className={CELL}>
      <h3 className={CELL_LABEL}>Overall rating</h3>
      <ul className="flex flex-col gap-(--reviews-bar-gap-y)">
        {STARS.map((stars) => {
          const share = (rating.distribution[stars] / rating.count) * 100;
          return (
            <li
              key={stars}
              className="grid grid-cols-[var(--reviews-bar-label-width)_1fr] items-center gap-x-(--reviews-bar-gap-x)"
            >
              <span className="text-review-tiny text-ink">
                <span className="sr-only">
                  {rating.distribution[stars]} reviews with{" "}
                </span>
                {stars}
                <span className="sr-only"> stars</span>
              </span>
              <span
                aria-hidden="true"
                className="h-(--reviews-bar-height) overflow-hidden rounded-xs bg-reviews-bar-track"
              >
                <span
                  className="block h-full bg-ink"
                  style={{ width: `${share}%` }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Overall star distribution followed by the six category scores. */
export function RatingBreakdown({ rating }: { rating: RatingSummary }) {
  return (
    <div className="grid grid-cols-(--reviews-breakdown-cols) pt-(--reviews-breakdown-pad-top) pb-(--reviews-breakdown-pad-bottom)">
      <OverallBars rating={rating} />
      {rating.categories.map((category) => {
        const Icon = CATEGORY_ICONS[category.id];
        return (
          <div key={category.id} className={CELL}>
            <h3 className={CELL_LABEL}>{category.label}</h3>
            <p className="mb-2 text-review-stat font-medium text-ink">
              {category.value.toFixed(1)}
            </p>
            <Icon className="size-(--reviews-category-icon-size) text-ink" />
          </div>
        );
      })}
    </div>
  );
}
