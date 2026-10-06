"use client";

import { useRef } from "react";
import { ReserveButton } from "@/features/listing-actions";
import { StarIcon } from "./icons";
import { scrollToSection } from "./scrollToSection";
import { useActiveSection } from "./useActiveSection";
import { usePastElement } from "./usePastElement";
import type { StickyNavProps } from "./types";

const tab =
  "relative block px-(--sticky-nav-tab-pad-x) py-(--sticky-nav-tab-pad-y) text-body leading-(--sticky-nav-tab-line-height) font-medium text-ink hover:text-black";

/**
 * Fixed bar that slides in once the element `observeId` has scrolled away:
 * section tabs on the left, price / rating / Reserve on the right.
 */
export function StickyNav({
  sections,
  observeId,
  price,
  rating,
  reserve,
}: StickyNavProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const visible = usePastElement(observeId);
  const barHeight = () => barRef.current?.offsetHeight ?? 0;
  const activeId = useActiveSection(
    sections.map((s) => s.id),
    barHeight,
  );

  const total = `${price.currency}${price.total.toLocaleString("en-IN")}`;
  const reviews = `${rating.count} ${rating.count === 1 ? "review" : "reviews"}`;

  return (
    <div
      ref={barRef}
      // Off-screen means unreachable too. `visibility` (which transitions
      // discretely: it stays "visible" for the whole slide) removes the hidden
      // bar from the tab order and accessibility tree once it has left;
      // `inert` covers the slide-out itself.
      inert={!visible}
      data-visible={visible}
      className="pointer-events-none invisible fixed inset-x-0 top-0 z-(--sticky-nav-z) -translate-y-full border-b border-line bg-white opacity-0 transition-[translate,opacity,visibility] duration-(--dur-sticky-nav) ease-(--ease-standard) data-[visible=true]:pointer-events-auto data-[visible=true]:visible data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100"
    >
      <div className="mx-auto flex h-(--sticky-nav-height) max-w-(--sticky-nav-max-width) items-center justify-between px-(--layout-page-gutter)">
        <nav aria-label="Listing sections">
          <ul className="flex gap-(--sticky-nav-tab-gap)">
            {sections.map(({ id, label }) => {
              const active = id === activeId;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={active ? "location" : undefined}
                    // The link keeps its href for semantics; the jump is a smooth scroll that leaves the address alone.
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToSection(id);
                    }}
                    className={tab}
                  >
                    {label}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-(--sticky-nav-tab-pad-x) bottom-(--sticky-nav-underline-offset) h-(--sticky-nav-underline-height) bg-ink"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-(--sticky-nav-actions-gap)">
          <div className="text-right text-nav-meta text-ink">
            <p>
              <span className="text-nav-price font-medium">{total}</span>{" "}
              <span>
                for {price.nights} {price.nights === 1 ? "night" : "nights"}
              </span>
            </p>
            <p className="mt-(--sticky-nav-meta-gap)">
              <StarIcon className="inline-block size-(--sticky-nav-star-size) align-(--sticky-nav-star-shift)" />{" "}
              {rating.value} · {reviews}
            </p>
          </div>
          <ReserveButton className="inline-flex h-(--sticky-nav-reserve-height) items-center justify-center rounded-pill bg-(image:--gradient-reserve) px-(--sticky-nav-reserve-pad-x) text-body leading-[normal] font-medium text-white transition-reserve hover:bg-(image:--gradient-reserve-hover) active:[transform:scale(var(--sticky-nav-reserve-press-scale))]">
            {reserve.label}
          </ReserveButton>
        </div>
      </div>
    </div>
  );
}
