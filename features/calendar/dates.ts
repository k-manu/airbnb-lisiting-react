// Pure calendar arithmetic and formatting. No React, no Date.now(), no locale
// or time-zone dependence: everything runs on UTC so server and client agree.

import type { ISODate, MonthKey } from "./types";

export const DAYS_PER_WEEK = 7;

const MS_PER_DAY = 86_400_000;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Sunday first, matching the reference's S M T W T F S header. */
export const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const pad = (n: number, width = 2) => String(n).padStart(width, "0");

function toUtc(iso: ISODate): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function fromUtc(date: Date): ISODate {
  return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export const monthOf = (iso: ISODate): MonthKey => iso.slice(0, 7);

export const firstDayOf = (month: MonthKey): ISODate => `${month}-01`;

export function addDays(iso: ISODate, days: number): ISODate {
  return fromUtc(new Date(toUtc(iso).getTime() + days * MS_PER_DAY));
}

export function addMonths(month: MonthKey, months: number): MonthKey {
  const [year, index] = month.split("-").map(Number);
  const total = year * 12 + (index - 1) + months;
  return `${pad(Math.floor(total / 12), 4)}-${pad((total % 12) + 1)}`;
}

/** Same day-of-month in another month, clamped (31 Jan + 1 month -> 28 Feb). */
export function shiftMonths(iso: ISODate, months: number): ISODate {
  const target = addMonths(monthOf(iso), months);
  const day = Math.min(Number(iso.slice(8, 10)), daysInMonth(target));
  return `${target}-${pad(day)}`;
}

export function daysInMonth(month: MonthKey): number {
  return toUtc(addDays(firstDayOf(addMonths(month, 1)), -1)).getUTCDate();
}

export const lastDayOf = (month: MonthKey): ISODate =>
  `${month}-${pad(daysInMonth(month))}`;

/** 0 = Sunday ... 6 = Saturday. */
export const weekdayOf = (iso: ISODate): number => toUtc(iso).getUTCDay();

export const nightsBetween = (from: ISODate, to: ISODate): number =>
  Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / MS_PER_DAY);

/**
 * The weeks of a month as rows of seven. Days outside the month are null so
 * the first and last week stay aligned to the weekday header.
 */
export function monthWeeks(month: MonthKey): (ISODate | null)[][] {
  const leading = weekdayOf(firstDayOf(month));
  const cells: (ISODate | null)[] = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth(month); day++) {
    cells.push(`${month}-${pad(day)}`);
  }
  while (cells.length % DAYS_PER_WEEK !== 0) cells.push(null);

  const weeks: (ISODate | null)[][] = [];
  for (let i = 0; i < cells.length; i += DAYS_PER_WEEK) {
    weeks.push(cells.slice(i, i + DAYS_PER_WEEK));
  }
  return weeks;
}

const monthName = (month: MonthKey) =>
  MONTH_NAMES[Number(month.slice(5, 7)) - 1];

/** "October 2026". */
export const formatMonthTitle = (month: MonthKey): string =>
  `${monthName(month)} ${month.slice(0, 4)}`;

/** "18 Oct 2026", as in the range subtitle. */
export const formatShortDate = (iso: ISODate): string =>
  `${Number(iso.slice(8, 10))} ${monthName(monthOf(iso)).slice(0, 3)} ${iso.slice(0, 4)}`;

/** "Sunday, 18 October 2026", for screen readers. */
export const formatLongDate = (iso: ISODate): string =>
  `${WEEKDAY_NAMES[weekdayOf(iso)]}, ${Number(iso.slice(8, 10))} ${monthName(monthOf(iso))} ${iso.slice(0, 4)}`;
