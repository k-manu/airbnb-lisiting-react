"use client";

import { useEffect, useRef, useState } from "react";

/** Where, below the bar, the "reading line" sits, as a fraction of the free viewport height. */
const READING_LINE = 0.25;

/**
 * Which of `ids` (DOM ids, in page order) is the current section.
 *
 * The answer is computed from geometry on every update, never from which
 * observer callback fired last. IntersectionObservers are only cheap
 * "something crossed the line" triggers, so there are no scroll listeners.
 *
 *  - current = the last section whose top has reached the reading line, which
 *    sits a fixed fraction of the way down the space below the bar;
 *  - before any has, the first section is current;
 *  - a last section too short to ever reach the line still becomes current
 *    once it is wholly on screen.
 */
export function useActiveSection(
  ids: string[],
  getInset: () => number,
): string {
  const [activeId, setActiveId] = useState(ids[0] ?? "");
  const key = ids.join("|");
  const getInsetRef = useRef(getInset);

  useEffect(() => {
    getInsetRef.current = getInset;
  });

  useEffect(() => {
    const list = key.split("|");
    const targets = list.map((id) => document.getElementById(id));
    const last = targets[targets.length - 1];
    let observers: IntersectionObserver[] = [];

    const compute = () => {
      const inset = getInsetRef.current();
      const height = window.innerHeight;
      const line = inset + (height - inset) * READING_LINE;
      if (last) {
        const rect = last.getBoundingClientRect();
        if (rect.top >= inset && rect.bottom <= height)
          return list[list.length - 1];
      }
      let current = list[0];
      targets.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= line) current = list[i];
      });
      return current;
    };

    const update = () => setActiveId(compute());

    const connect = () => {
      observers.forEach((o) => o.disconnect());
      const inset = getInsetRef.current();
      const height = window.innerHeight;
      const line = inset + (height - inset) * READING_LINE;
      // Band from the top of the viewport to the reading line: a target's
      // intersection flips exactly when its top edge crosses the line.
      const band = new IntersectionObserver(update, {
        rootMargin: `0px 0px -${Math.max(0, height - line)}px 0px`,
        threshold: 0,
      });
      const whole = new IntersectionObserver(update, { threshold: [0, 1] });
      targets.forEach((el) => el && band.observe(el));
      if (last) whole.observe(last);
      observers = [band, whole];
      update();
    };

    connect();
    window.addEventListener("resize", connect);
    return () => {
      window.removeEventListener("resize", connect);
      observers.forEach((o) => o.disconnect());
    };
  }, [key]);

  return activeId;
}
