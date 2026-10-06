// Public surface of the calendar module. Import from "@/features/calendar" only.
//
//   dates.ts        pure date math and formatting (no React)
//   StayCalendar    two-month, display-only view of the stay (the reference does not pick dates)
//   CalendarFooter  keyboard glyph + inert "Clear dates"
export { StayCalendar } from "./StayCalendar";
export type { StayCalendarProps } from "./StayCalendar";
export { CalendarFooter } from "./CalendarFooter";
export { formatShortDate, nightsBetween } from "./dates";
export type { ISODate, MonthKey } from "./types";
