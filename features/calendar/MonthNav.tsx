import { ChevronIcon } from "./icons";

const buttonClass =
  "pointer-events-auto inline-flex size-(--calendar-nav-size) items-center justify-center rounded-full text-ink hover:bg-grey-200 focus-visible:rounded-full";

/**
 * Previous / next month buttons, floated over the two month titles. The
 * reference offers them but they do not page (the calendar is fixed on the
 * stay's two months), so they only carry their hover fill.
 */
export function MonthNav() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-(--calendar-nav-offset) z-10 flex justify-between">
      <button type="button" aria-label="Previous month" className={buttonClass}>
        <ChevronIcon
          direction="left"
          className="h-(--calendar-nav-icon-height) w-(--calendar-nav-icon-width)"
        />
      </button>
      <button type="button" aria-label="Next month" className={buttonClass}>
        <ChevronIcon
          direction="right"
          className="h-(--calendar-nav-icon-height) w-(--calendar-nav-icon-width)"
        />
      </button>
    </div>
  );
}
