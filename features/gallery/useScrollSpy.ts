"use client";

import { useEffect, useState, type RefObject } from "react";

/** Fraction of the scroll container's height, from the top, that is the "reading line". */
const READING_LINE = 0.3;

/**
 * Layer 2 helper — reports which of `ids` is currently "active" while
 * `rootRef` scrolls. Targets are found by `data-spy-id`.
 *
 * The answer is *computed from geometry*, never from which observer callback
 * happened to fire last (that ordering is not something to depend on — an
 * earlier version did, and lost a race when the container was scrolled
 * immediately on open). IntersectionObservers are used only as cheap
 * "something crossed the line" triggers, so there are no scroll listeners.
 *
 * Rules:
 *  - active = the last target whose top has reached the reading line;
 *    before the first one does, the first target is active;
 *  - an element marked `data-spy-end` at the very end of the content makes
 *    the last target active once it scrolls into view, so a short final
 *    target that can never reach the line still gets its turn.
 */
export function useScrollSpy(
  rootRef: RefObject<HTMLElement | null>,
  ids: string[],
  enabled: boolean,
): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);
  const key = ids.join("|");

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;
    const list = key.split("|");
    const targets = list.map((id) =>
      root.querySelector<HTMLElement>(`[data-spy-id="${id}"]`),
    );
    const end = root.querySelector<HTMLElement>("[data-spy-end]");

    const compute = () => {
      const rootRect = root.getBoundingClientRect();
      const line = rootRect.top + rootRect.height * READING_LINE;
      if (end && end.getBoundingClientRect().top <= rootRect.bottom) {
        return list[list.length - 1];
      }
      let current = list[0];
      targets.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) current = list[i];
      });
      return current;
    };

    const update = () => setActiveId(compute());
    // Trigger on crossings of the reading line (band) and of the end marker.
    const bandObserver = new IntersectionObserver(update, {
      root,
      rootMargin: `0px 0px -${(1 - READING_LINE) * 100}% 0px`,
      threshold: 0,
    });
    const endObserver = new IntersectionObserver(update, {
      root,
      threshold: 0,
    });
    targets.forEach((el) => el && bandObserver.observe(el));
    if (end) endObserver.observe(end);

    return () => {
      bandObserver.disconnect();
      endObserver.disconnect();
    };
  }, [rootRef, key, enabled]);

  return activeId;
}
