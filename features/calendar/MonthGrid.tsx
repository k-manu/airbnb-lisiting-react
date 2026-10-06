import { useId } from "react";
import {
  WEEKDAY_NAMES,
  formatLongDate,
  formatMonthTitle,
  monthWeeks,
} from "./dates";
import { DayCell, type Band } from "./DayCell";
import type { ISODate, MonthKey } from "./types";

interface MonthGridProps {
  month: MonthKey;
  blocked: ReadonlySet<ISODate>;
  checkIn: ISODate;
  checkOut: ISODate;
}

/** Spoken status appended to a day's date. */
function describe(
  date: ISODate,
  blocked: boolean,
  checkIn: ISODate,
  checkOut: ISODate,
) {
  const label = formatLongDate(date);
  if (blocked) return `${label}, unavailable`;
  if (date === checkIn) return `${label}, selected check-in date`;
  if (date === checkOut) return `${label}, selected check-out date`;
  return label;
}

/** ISO dates compare correctly as text. */
function bandOf(date: ISODate, checkIn: ISODate, checkOut: ISODate): Band | null {
  if (date === checkIn) return "start";
  if (date === checkOut) return "end";
  return date > checkIn && date < checkOut ? "full" : null;
}

/** One month: title, weekday header and the week rows. */
export function MonthGrid({ month, blocked, checkIn, checkOut }: MonthGridProps) {
  const titleId = useId();

  return (
    <div>
      <div
        id={titleId}
        className="mb-(--calendar-month-title-gap) text-center text-body-lg leading-(--calendar-month-title-line-height) font-medium text-ink"
      >
        {formatMonthTitle(month)}
      </div>
      <div role="table" aria-labelledby={titleId}>
        <div
          role="row"
          className="mb-(--calendar-weekday-gap) grid grid-cols-7 text-center text-caption leading-(--calendar-weekday-line-height) font-medium text-ink"
        >
          {WEEKDAY_NAMES.map((name) => (
            <div key={name} role="columnheader" aria-label={name}>
              {name[0]}
            </div>
          ))}
        </div>
        {monthWeeks(month).map((week) => (
          <div
            key={week.find(Boolean) ?? month}
            role="row"
            className="grid grid-cols-7"
          >
            {week.map((date, slot) =>
              date ? (
                <DayCell
                  key={date}
                  date={date}
                  label={describe(date, blocked.has(date), checkIn, checkOut)}
                  edge={date === checkIn || date === checkOut}
                  band={bandOf(date, checkIn, checkOut)}
                  blocked={blocked.has(date)}
                />
              ) : (
                <div key={`gap-${slot}`} role="cell" aria-hidden />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
