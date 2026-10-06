"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { ArtIcon } from "@/components/ArtIcon";

// Collapsed height is N lines plus a sliver of the next one, all inside the
// fade, so the last visible line dissolves instead of being cut off.
const LINE_HEIGHT_EM = 1.5;
const FADE_PEEK_EM = 0.2;

interface DescriptionProps {
  text: string;
  /** Lines visible while collapsed. */
  collapsedLines: number;
}

/** A small bold right-pointing chevron, sized to sit beside the "Show more" label. */
function MoreChevron() {
  return <ArtIcon name="chevron-more" className="size-3.5" />;
}

/**
 * The listing description, clamped to a few lines with its last visible line
 * fading out. "Show more" only appears when the text does not fit.
 */
export function Description({ text, collapsedLines }: DescriptionProps) {
  const id = useId();
  const paragraph = useRef<HTMLParagraphElement>(null);
  const [open, setOpen] = useState(false);
  // Assume it overflows until measured, so the button is in the server HTML.
  const [overflowing, setOverflowing] = useState(true);

  useLayoutEffect(() => {
    const el = paragraph.current;
    if (!el) return;
    const measure = () => {
      // While clamped, scrollHeight still reports the full text height.
      if (!open) setOverflowing(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, text]);

  const collapsed = !open && overflowing;

  return (
    <div>
      <p
        ref={paragraph}
        id={id}
        style={
          collapsed
            ? {
                maxHeight: `${collapsedLines * LINE_HEIGHT_EM + FADE_PEEK_EM}em`,
              }
            : undefined
        }
        className={`text-body-lg leading-6 text-ink ${
          collapsed
            ? "overflow-hidden mask-[linear-gradient(#000_var(--description-fade-start),transparent)]"
            : ""
        }`}
      >
        {text}
      </p>
      {(overflowing || open) && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="mt-3.5 inline-flex items-center gap-1.5 text-body-lg leading-[normal] font-medium text-ink underline underline-offset-[3px]"
        >
          {open ? "Show less" : "Show more"}
          <MoreChevron />
        </button>
      )}
    </div>
  );
}
