"use client";

import { useId, useState } from "react";

// A review longer than this is clamped behind "Show more". Length-based (not
// measured) because the reference offers "Show more" on a review that fits
// its four lines exactly, and it keeps server and client markup identical.
const COLLAPSE_ABOVE_CHARS = 200;

/** Review body, clamped to four lines with an inline "Show more" / "Show less". */
export function ReviewText({ text }: { text: string }) {
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const collapsible = text.length > COLLAPSE_ABOVE_CHARS;
  const clamped = collapsible && !expanded;

  return (
    <div>
      <p
        id={id}
        className={`text-review-body whitespace-pre-line text-ink ${clamped ? "line-clamp-(--reviews-text-lines)" : ""}`}
      >
        {text}
      </p>
      {collapsible && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-review-body leading-[normal] font-medium text-ink underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
