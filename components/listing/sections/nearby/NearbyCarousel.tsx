"use client";

import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ChevronIcon } from "./icons";

/** Cards visible at once; the CSS card width is derived from the same number. */
export const CARDS_PER_PAGE = 5;

type Direction = "prev" | "next";

const pagerButtonClass =
  "flex size-(--nearby-pager-button-size) items-center justify-center rounded-full border border-pager-border bg-white text-ink disabled:opacity-(--nearby-pager-disabled-opacity)";

/**
 * Heading row (title + pager) and the scrolling track of cards. The track is a
 * plain scroll container, so touch, trackpad and Tab-to-focus scrolling work
 * natively; the pager buttons and the "n / m" label follow its position.
 * Page 2 ends flush with the last card, so with 8 stays it shows stays 4-8.
 */
export function NearbyCarousel({
  heading,
  label,
  children,
}: {
  heading: ReactNode;
  label: string;
  children: ReactNode;
}) {
  const cardCount = Children.count(children);
  const pageCount = Math.max(1, Math.ceil(cardCount / CARDS_PER_PAGE));
  const [page, setPage] = useState(0);
  const trackRef = useRef<HTMLUListElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const focusAfterRender = useRef<Direction | null>(null);

  /** Scroll position of the start of each page, measured from the layout. */
  const pageOffsets = useCallback(() => {
    const track = trackRef.current;
    const cards = track?.children;
    if (!track || !cards || cards.length < 2) return [0];
    const pitch =
      (cards[1] as HTMLElement).offsetLeft -
      (cards[0] as HTMLElement).offsetLeft;
    const maxScroll = track.scrollWidth - track.clientWidth;
    return Array.from({ length: pageCount }, (_, index) =>
      Math.min(index * CARDS_PER_PAGE * pitch, maxScroll),
    );
  }, [pageCount]);

  const syncPage = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const offsets = pageOffsets();
    const nearest = offsets.reduce(
      (best, offset, index) =>
        Math.abs(offset - track.scrollLeft) <
        Math.abs(offsets[best] - track.scrollLeft)
          ? index
          : best,
      0,
    );
    setPage(nearest);
  }, [pageOffsets]);

  const goTo = (direction: Direction) => {
    const target = Math.min(
      pageCount - 1,
      Math.max(0, page + (direction === "next" ? 1 : -1)),
    );
    // The pressed button is about to be disabled: hand focus to its partner.
    if (target === 0) focusAfterRender.current = "next";
    if (target === pageCount - 1) focusAfterRender.current = "prev";
    trackRef.current?.scrollTo({ left: pageOffsets()[target] });
  };

  useEffect(() => {
    const wanted = focusAfterRender.current;
    if (!wanted) return;
    const partner = wanted === "next" ? nextRef.current : prevRef.current;
    if (partner && !partner.disabled) {
      partner.focus();
      focusAfterRender.current = null;
    }
  }, [page]);

  return (
    <div role="group" aria-roledescription="carousel" aria-label={label}>
      <div className="mb-(--nearby-header-margin-bottom) flex items-center justify-between">
        {heading}
        <div className="flex items-center gap-x-(--nearby-pager-gap)">
          <span className="mr-(--nearby-pager-label-gap) text-body leading-body text-ink-muted">
            <span aria-hidden="true">
              {page + 1} / {pageCount}
            </span>
            <span className="sr-only" role="status">
              Page {page + 1} of {pageCount}
            </span>
          </span>
          <button
            ref={prevRef}
            type="button"
            className={pagerButtonClass}
            aria-label="Previous stays"
            disabled={page === 0}
            onClick={() => goTo("prev")}
          >
            <ChevronIcon
              direction="left"
              className="size-(--nearby-pager-icon-size)"
            />
          </button>
          <button
            ref={nextRef}
            type="button"
            className={pagerButtonClass}
            aria-label="Next stays"
            disabled={page === pageCount - 1}
            onClick={() => goTo("next")}
          >
            <ChevronIcon
              direction="right"
              className="size-(--nearby-pager-icon-size)"
            />
          </button>
        </div>
      </div>
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label={label}
        onScroll={syncPage}
        style={{ "--nearby-per-page": CARDS_PER_PAGE } as CSSProperties}
        className="relative -mx-(--nearby-track-bleed) -mt-(--nearby-track-bleed) flex list-none gap-x-(--nearby-track-gap) overflow-x-auto scroll-smooth px-(--nearby-track-bleed) pt-(--nearby-track-bleed) pb-(--nearby-track-bleed) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus:outline-none"
      >
        {children}
      </ul>
    </div>
  );
}
