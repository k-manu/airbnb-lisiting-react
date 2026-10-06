import { useId } from "react";
import { ChevronRightIcon } from "@/components/icons";

/**
 * Neighbourhood blurb with a "Show more" button. The reference offers the
 * button even though the blurb is a single line, and pressing it changes
 * nothing, so it is not wired.
 */
export function NeighbourhoodHighlights({ text }: { text: string }) {
  const headingId = useId();

  return (
    <div role="group" aria-labelledby={headingId}>
      <h3
        id={headingId}
        className="mt-(--place-highlights-gap-top) mb-(--place-highlights-gap-bottom) text-place-subtitle font-medium text-ink"
      >
        Neighbourhood highlights
      </h3>
      <p className="line-clamp-1 text-place-blurb text-ink">{text}</p>
      <button
        type="button"
        className="mt-(--place-more-gap) inline-flex items-center gap-(--place-more-icon-gap) text-body-lg leading-[normal] font-medium text-ink underline underline-offset-(--place-more-underline-offset)"
      >
        Show more
        <ChevronRightIcon
          aria-hidden="true"
          className="size-(--place-more-icon-size)"
        />
      </button>
    </div>
  );
}
