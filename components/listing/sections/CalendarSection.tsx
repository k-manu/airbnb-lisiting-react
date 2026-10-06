import type { Listing } from "@/data/listing";
import {
  CalendarFooter,
  StayCalendar,
  formatShortDate,
  nightsBetween,
} from "@/features/calendar";

interface CalendarSectionProps {
  stay: Listing["stay"];
  calendar: Listing["calendar"];
  /** "Candolim, India": the heading uses the part before the comma. */
  location: string;
}

/**
 * Availability section: the stay's heading and dates, the two months, and the
 * footer row. It is display-only, as in the reference (no date picking).
 */
export function CalendarSection({
  stay,
  calendar,
  location,
}: CalendarSectionProps) {
  const nights = nightsBetween(stay.checkIn, stay.checkOut);
  const place = location.split(",")[0].trim();

  return (
    <section
      aria-labelledby="calendar-heading"
      className="border-t border-line py-(--calendar-section-pad-y)"
    >
      <h2
        id="calendar-heading"
        className="text-title-sm leading-(--calendar-title-line-height) font-medium text-ink"
      >
        {nights} {nights === 1 ? "night" : "nights"} in {place}
      </h2>
      <p className="mt-(--calendar-subtitle-gap) mb-(--calendar-body-gap) text-body leading-(--calendar-subtitle-line-height) text-ink-muted">
        {formatShortDate(stay.checkIn)} - {formatShortDate(stay.checkOut)}
      </p>
      <StayCalendar
        checkIn={stay.checkIn}
        checkOut={stay.checkOut}
        unavailable={calendar.unavailable}
        firstMonth={calendar.firstMonth}
      />
      <CalendarFooter className="mt-(--calendar-footer-gap)" />
    </section>
  );
}
