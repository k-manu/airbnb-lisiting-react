"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Toast } from "./Toast";

/** How long a confirmation stays on screen (our choice; the reference toast's text and hold time are not in its static snapshot). */
const TOAST_HOLD_MS = 2500;

export interface ListingActionsApi {
  /** Whether the listing is in the visitor's wishlist (in memory: there is no backend). */
  saved: boolean;
  toggleSaved: () => void;
  /** Share only announces itself: the reference opens no share sheet and copies nothing. */
  share: () => void;
  /** Reserve does not start a booking; it reminds the visitor nothing is charged yet. */
  reserve: () => void;
}

const ListingActionsContext = createContext<ListingActionsApi | null>(null);

/**
 * Owns the Share, Save and Reserve actions so every button that offers them
 * (title row, Photo Tour bar, booking card, sticky bar) stays in step, and
 * renders their confirmation.
 */
export function ListingActionsProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState({ text: "", visible: false });
  const timer = useRef<number | undefined>(undefined);

  const announce = useCallback((text: string) => {
    window.clearTimeout(timer.current);
    setToast({ text, visible: true });
    timer.current = window.setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      TOAST_HOLD_MS,
    );
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const toggleSaved = useCallback(() => {
    const next = !saved;
    setSaved(next);
    announce(next ? "Saved to wishlist" : "Removed from wishlist");
  }, [saved, announce]);

  const share = useCallback(() => announce("Share options"), [announce]);
  const reserve = useCallback(
    () => announce("You won't be charged yet"),
    [announce],
  );

  const api = useMemo(
    () => ({ saved, toggleSaved, share, reserve }),
    [saved, toggleSaved, share, reserve],
  );

  return (
    <ListingActionsContext value={api}>
      {children}
      <Toast message={toast.text} visible={toast.visible} />
    </ListingActionsContext>
  );
}

export function useListingActions(): ListingActionsApi {
  const api = useContext(ListingActionsContext);
  if (!api) {
    throw new Error(
      "useListingActions must be used inside <ListingActionsProvider>",
    );
  }
  return api;
}
