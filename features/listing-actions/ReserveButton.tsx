"use client";

import type { ReactNode } from "react";
import { useListingActions } from "./ListingActionsProvider";

/**
 * A "Reserve" button. There is no checkout: pressing it announces that nothing
 * is charged yet. Styling is up to the caller (the booking card and the sticky
 * bar draw it differently).
 */
export function ReserveButton({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const { reserve } = useListingActions();
  return (
    <button type="button" onClick={reserve} className={className}>
      {children}
    </button>
  );
}
