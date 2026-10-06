import type { Listing } from "@/data/types";

/** One tab. `id` is the DOM id of the page section it scrolls to. */
export interface StickyNavSection {
  id: string;
  label: string;
}

export interface StickyNavProps {
  /** Tabs, in page order (top to bottom). */
  sections: StickyNavSection[];
  /** DOM id of the element (the hero photo grid) whose departure reveals the bar. */
  observeId: string;
  /** Price summary shown on the right. */
  price: Pick<Listing["pricing"], "currency" | "total"> &
    Pick<Listing["stay"], "nights">;
  rating: Pick<Listing["rating"], "value" | "count">;
  /** The Reserve pill (announces that nothing is charged yet). */
  reserve: { label: string };
}
