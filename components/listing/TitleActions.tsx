"use client";

import { useListingActions } from "@/features/listing-actions";
import { SaveHeartIcon, ShareArrowIcon } from "./sections/top/icons";

const action =
  "flex items-center gap-2 rounded-button px-2.5 py-2 text-body leading-[normal] font-medium text-ink press-button transition-press hover:bg-grey-200";

/** Share and Save buttons at the right of the title. */
export function TitleActions() {
  const { saved, toggleSaved, share } = useListingActions();

  return (
    <div className="flex shrink-0 gap-0.5">
      <button type="button" className={action} onClick={share}>
        <ShareArrowIcon className="size-4" />
        <span className="underline underline-offset-2">Share</span>
      </button>
      {/* Saved fills the heart brand red and the label reads "Saved" (observed on the reference). */}
      <button
        type="button"
        className={action}
        aria-pressed={saved}
        onClick={toggleSaved}
      >
        <SaveHeartIcon
          fill={saved ? "currentColor" : "none"}
          className={`size-4 ${saved ? "text-brand" : ""}`}
        />
        <span className="underline underline-offset-2">
          {saved ? "Saved" : "Save"}
        </span>
      </button>
    </div>
  );
}
