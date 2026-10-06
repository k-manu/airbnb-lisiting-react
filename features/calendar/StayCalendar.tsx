import { useMemo } from "react";
import { addMonths } from "./dates";
import { MonthGrid } from "./MonthGrid";
import { MonthNav } from "./MonthNav";
import type { ISODate, MonthKey } from "./types";

export interface StayCalendarProps {
  checkIn: ISODate;
  checkOut: ISODate;
  /** Days that are struck through. */
  unavailable: readonly ISODate[];
  /** The left-hand month; the right-hand one follows it. */
  firstMonth: MonthKey;
}

/** Two side-by-side months showing the stay. Display-only, like the reference. */
export function StayCalendar({
  checkIn,
  checkOut,
  unavailable,
  firstMonth,
}: StayCalendarProps) {
  const blocked = useMemo(() => new Set(unavailable), [unavailable]);
  const grid = { blocked, checkIn, checkOut };

  return (
    <div className="relative grid grid-cols-2 gap-x-(--calendar-month-gap)">
      <MonthNav />
      <MonthGrid month={firstMonth} {...grid} />
      <MonthGrid month={addMonths(firstMonth, 1)} {...grid} />
    </div>
  );
}
