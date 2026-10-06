import Image from "next/image";
import type { ReviewTag } from "@/data/types";

/**
 * Topic chips with mention counts. The row scrolls sideways (scrollbar
 * hidden, no arrow buttons). The reference chips do not filter the reviews,
 * so they are plain buttons; being real buttons they are reachable with Tab
 * and the browser scrolls a focused chip into view.
 */
export function ReviewTagRow({ tags }: { tags: ReviewTag[] }) {
  return (
    <ul
      aria-label="Topics guests mention"
      className="flex gap-(--reviews-chip-gap) overflow-x-auto pt-(--reviews-chips-pad-top) pb-(--reviews-chips-pad-bottom) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tags.map((tag) => (
        <li key={tag.label} className="shrink-0">
          <button
            type="button"
            aria-label={`${tag.label}, mentioned in ${tag.count} reviews`}
            className="flex items-center gap-2 rounded-2xl border border-reviews-rule bg-white p-(--reviews-chip-pad) text-body leading-[normal] font-medium text-ink"
          >
            {tag.iconSrc && (
              <Image
                src={tag.iconSrc}
                alt=""
                width={20}
                height={20}
                unoptimized
                className="size-(--reviews-chip-icon-size) shrink-0 object-contain"
              />
            )}
            {tag.label}{" "}
            <span className="font-normal text-ink-muted">{tag.count}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
