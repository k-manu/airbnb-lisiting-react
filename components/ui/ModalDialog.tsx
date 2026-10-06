"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

interface ModalDialogProps {
  open: boolean;
  label: string;
  onClose: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDialogElement>) => void;
  /** Fade the overlay in and out (duration comes from `--dur-lightbox-fade`). */
  fade?: boolean;
  className?: string;
  children: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Full-screen modal primitive shared by every overlay in the app.
 *
 * Built on the native <dialog>: showModal() makes the rest of the page inert
 * and routes Escape to the `cancel` event, which we forward to `onClose`.
 * Three things are done explicitly because the platform is unreliable at
 * them: Tab wrapping (native dialogs let Tab escape to browser chrome), focus
 * return to the trigger, and the exit fade (the element must stay mounted
 * until the transition ends).
 *
 * The parent owns `open`; this component owns mounting and animation timing.
 */
export function ModalDialog({
  open,
  label,
  onClose,
  onKeyDown,
  fade = false,
  className,
  children,
}: ModalDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(open);

  // Mount on open. (Setting state during render is the documented way to
  // derive state from a prop change without an extra effect pass.)
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !mounted) return;

    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      if (!dialog.open) dialog.showModal();
      // Next frame so the browser has a "closed" style to transition from.
      const raf = requestAnimationFrame(() => {
        dialog.dataset.open = "true";
      });
      return () => cancelAnimationFrame(raf);
    }

    // Closing: fade out, then close and unmount.
    dialog.dataset.open = "false";
    const seconds =
      parseFloat(getComputedStyle(dialog).transitionDuration) || 0;
    const finish = () => {
      if (dialog.open) dialog.close();
      setMounted(false);
      const trigger = triggerRef.current;
      if (trigger?.isConnected) trigger.focus();
    };
    if (!fade || seconds === 0) {
      finish();
      return;
    }
    const timer = window.setTimeout(finish, seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [open, mounted, fade]);

  if (!mounted) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== "Tab") return;

    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <dialog
      ref={ref}
      aria-label={label}
      data-open="false"
      className={className}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      {children}
    </dialog>
  );
}
