import { KeyboardIcon } from "./icons";

/**
 * Bottom row under the months: a keyboard glyph on the left and "Clear
 * dates" on the right. In the reference the glyph is decoration (not
 * focusable) and "Clear dates" does nothing, so neither is wired.
 */
export function CalendarFooter({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div
        aria-hidden
        className="inline-flex h-(--calendar-kbd-height) w-(--calendar-kbd-width) items-center justify-center rounded-(--calendar-kbd-radius) border border-calendar-kbd-border text-ink"
      >
        <KeyboardIcon className="h-(--calendar-kbd-glyph-height) w-(--calendar-kbd-glyph-width)" />
      </div>
      <button
        type="button"
        className="px-(--calendar-clear-pad-x) py-(--calendar-clear-pad-y) text-body leading-[normal] font-medium text-ink underline"
      >
        Clear dates
      </button>
    </div>
  );
}
