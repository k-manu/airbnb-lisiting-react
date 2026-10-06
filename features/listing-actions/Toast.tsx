"use client";

import { useEffect, useRef } from "react";

interface ToastProps {
  message: string;
  visible: boolean;
}

/**
 * The bottom-centre confirmation pill ("Link copied", "Saved to wishlist").
 *
 * Two elements on purpose:
 * - a visually hidden polite live region that always exists, so screen readers
 *   announce every message (a `display: none` element is never announced);
 * - the visible pill, hidden from assistive tech, promoted to the browser's top
 *   layer with the Popover API so it shows above native modal dialogs such as
 *   the Photo Tour (a plain fixed element would sit underneath them).
 */
export function Toast({ message, visible }: ToastProps) {
  const pill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pill.current;
    if (!el) return;

    if (visible) {
      if (!el.matches(":popover-open")) el.showPopover();
      // Next frame, so the browser has the hidden style to transition from.
      const raf = requestAnimationFrame(() => {
        el.dataset.visible = "true";
      });
      return () => cancelAnimationFrame(raf);
    }

    el.dataset.visible = "false";
    // Take it out of the top layer only once the fade-out has finished.
    const seconds = parseFloat(getComputedStyle(el).transitionDuration) || 0;
    const timer = window.setTimeout(() => {
      if (el.matches(":popover-open")) el.hidePopover();
    }, seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [visible]);

  return (
    <>
      <p role="status" className="sr-only">
        {visible ? message : ""}
      </p>
      <div
        ref={pill}
        popover="manual"
        data-toast=""
        aria-hidden
        data-visible="false"
        className="pointer-events-none fixed inset-auto bottom-(--toast-bottom) left-1/2 m-0 w-max max-w-[calc(100vw-3rem)] -translate-x-1/2 translate-y-(--toast-rise) overflow-visible rounded-button border-0 bg-ink px-(--toast-pad-x) py-(--toast-pad-y) text-body font-medium text-white opacity-0 transition-[opacity,transform] duration-(--dur-toast) ease-standard data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100"
      >
        {message}
      </div>
    </>
  );
}
