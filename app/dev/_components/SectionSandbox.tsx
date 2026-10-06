import type { ReactNode } from "react";

/**
 * Places one section on the page at the same coordinates it has in the
 * reference, so `scripts/pixel-diff.mjs` can compare a region directly.
 *
 * - `top`: css px from the top of the page to the section's top edge.
 * - `layout="left"`: inside the 561px content column (left of the booking
 *   column), as the sections under the description are.
 * - `layout="full"`: the full 1032px content width (reviews, host, ...).
 */
export function SectionSandbox({
  top,
  layout,
  children,
}: {
  top: number;
  layout: "left" | "full";
  children: ReactNode;
}) {
  return (
    <main
      className="px-(--layout-page-gutter)"
      style={{ minHeight: top + 3200 }}
    >
      <div aria-hidden style={{ height: top }} />
      {layout === "left" ? (
        <div className="grid grid-cols-[1fr_var(--layout-booking-card-width)] gap-x-(--layout-content-card-gap)">
          <div>{children}</div>
        </div>
      ) : (
        children
      )}
    </main>
  );
}
