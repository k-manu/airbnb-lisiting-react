"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { ChevronRightIcon } from "@/components/icons";

interface ExpandableTextProps {
  text: string;
  /** Lines visible while collapsed. */
  collapsedLines: number;
  /** Line height in px (must match the text's leading). */
  lineHeight: number;
  className?: string;
}

/**
 * Clamps text to N lines behind a "Show more" toggle. The last visible line
 * fades out while collapsed. The toggle is hidden when the text already fits.
 */
export function ExpandableText({
  text,
  collapsedLines,
  lineHeight,
  className,
}: ExpandableTextProps) {
  const id = useId();
  const ref = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  const [overflowing, setOverflowing] = useState(true);
  const collapsedHeight = collapsedLines * lineHeight;

  useLayoutEffect(() => {
    const el = ref.current;
    if (el) setOverflowing(el.scrollHeight > collapsedHeight + 1);
  }, [collapsedHeight, text]);

  const collapsed = !open && overflowing;

  return (
    <div>
      <p
        ref={ref}
        id={id}
        className={className}
        style={
          collapsed
            ? {
                maxHeight: collapsedHeight,
                overflow: "hidden",
                maskImage: `linear-gradient(to bottom, #000 ${collapsedHeight - lineHeight}px, rgba(0,0,0,0.3) ${collapsedHeight}px)`,
              }
            : undefined
        }
      >
        {text}
      </p>
      {overflowing && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="mt-3 flex items-center gap-1 text-body-lg font-medium underline"
        >
          {open ? "Show less" : "Show more"}
          <ChevronRightIcon width={16} height={16} />
        </button>
      )}
    </div>
  );
}
