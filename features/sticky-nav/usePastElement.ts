"use client";

import { useEffect, useState } from "react";

/**
 * True once the element with `id` has scrolled out of view off the *top* of
 * the viewport. (Below the fold it is "not yet reached", not "passed".)
 * Starts false so server and first client render agree; the observer reports
 * the real state immediately, which also covers restored scroll positions.
 */
export function usePastElement(id: string): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Entries are ordered by time; the last one is the current state.
        const { isIntersecting, boundingClientRect } =
          entries[entries.length - 1];
        setPast(!isIntersecting && boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [id]);

  return past;
}
