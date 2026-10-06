"use client";

import { useEffect, useState } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { IconButton } from "@/components/ui/IconButton";
import { CloseIcon } from "@/components/icons";
import { AmenityGroups } from "./AmenityGroups";

const TITLE = "What this place offers";

/**
 * "Show all N amenities" button plus the dialog it opens. The only client
 * code in the section: everything else is server-rendered.
 */
export function AmenitiesModal({
  total,
  groups,
  unavailable,
}: {
  total: number;
  groups: { category: string; items: string[] }[];
  unavailable: ReadonlySet<string>;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // The page behind must not scroll while the dialog is up.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="transition-press rounded-outline-button border border-ink bg-white p-(--amenity-button-pad) text-body-lg leading-[normal] font-medium text-ink hover:bg-grey-100 active:scale-[0.98]"
      >
        Show all {total} amenities
      </button>

      <ModalDialog
        open={open}
        label={TITLE}
        onClose={close}
        fade
        className="group fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-center justify-center bg-scrim p-0 text-ink opacity-0 transition-opacity duration-(--dur-amenity-modal-fade) ease-standard backdrop:bg-transparent open:flex data-[open=true]:opacity-100"
      >
        {/* Clicking the dim area outside the panel dismisses; Escape and the
            close button are the keyboard routes. */}
        <div
          className="flex size-full items-center justify-center"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div className="flex max-h-[calc(100vh-var(--amenity-modal-margin-y))] w-(--amenity-modal-width) max-w-[calc(100vw-var(--amenity-modal-margin-x))] translate-y-(--amenity-modal-slide) flex-col overflow-hidden rounded-modal bg-white transition-transform duration-(--dur-amenity-modal-slide) ease-thumb group-data-[open=true]:translate-y-0">
            <div className="flex h-(--amenity-modal-header-height) shrink-0 items-center px-6">
              <IconButton aria-label="Close" onClick={close} className="-ml-2">
                <CloseIcon width={18} height={18} />
              </IconButton>
            </div>
            {/* Focusable so keyboard users can scroll the list with the arrow keys. */}
            <div
              tabIndex={0}
              className="overflow-y-auto px-(--amenity-modal-pad-x) pb-(--amenity-modal-pad-x)"
            >
              <h2 className="mt-(--amenity-modal-title-gap-top) mb-(--amenities-heading-gap) text-title-sm leading-body font-medium text-ink">
                {TITLE}
              </h2>
              <AmenityGroups groups={groups} unavailable={unavailable} />
            </div>
          </div>
        </div>
      </ModalDialog>
    </>
  );
}
