import type { ISODate } from "./types";

/** Where a day sits in the highlighted stay. */
export type Band = "full" | "start" | "end";

interface DayCellProps {
  date: ISODate;
  /** Full spoken date and its status, e.g. "Sunday, 18 October 2026, selected check-in date". */
  label: string;
  /** Filled dark circle: the check-in or check-out day. */
  edge: boolean;
  band: Band | null;
  blocked: boolean;
}

// The band is a separate layer so it can stop at the centre of an end circle.
const BAND_SHAPE: Record<Band, string> = {
  full: "inset-x-0",
  start: "right-0 w-1/2",
  end: "left-0 w-1/2",
};

/** One day. The reference calendar is display-only, so this is not a control. */
export function DayCell({ date, label, edge, band, blocked }: DayCellProps) {
  const tone = blocked
    ? "text-calendar-blocked line-through"
    : edge
      ? "bg-ink text-white"
      : "text-ink";

  return (
    <div role="cell" aria-label={label} className="relative aspect-square">
      {band && (
        <span
          aria-hidden
          className={`absolute inset-y-0 bg-grey-200 ${BAND_SHAPE[band]}`}
        />
      )}
      <div
        aria-disabled={blocked || undefined}
        className={`relative flex size-full items-center justify-center rounded-full text-body leading-body ${tone}`}
      >
        {Number(date.slice(8, 10))}
      </div>
    </div>
  );
}
