// Layer 0 — pure state for the gallery overlays. No React, no DOM.
//
// Two independent flags rather than one "current view": the Lightbox can sit
// on top of the Photo Tour, so closing the Lightbox must leave the tour open.

export interface GalleryState {
  tourOpen: boolean;
  /** Room the tour should scroll to when it opens (null = top). */
  tourRoomId: string | null;
  lightboxIndex: number | null;
}

export type GalleryAction =
  | { type: "openTour"; roomId?: string }
  | { type: "closeTour" }
  | { type: "openLightbox"; index: number }
  | { type: "closeLightbox" };

export const initialGalleryState: GalleryState = {
  tourOpen: false,
  tourRoomId: null,
  lightboxIndex: null,
};

export function galleryReducer(
  state: GalleryState,
  action: GalleryAction,
): GalleryState {
  switch (action.type) {
    case "openTour":
      return { ...state, tourOpen: true, tourRoomId: action.roomId ?? null };
    case "closeTour":
      return { ...state, tourOpen: false };
    case "openLightbox":
      return { ...state, lightboxIndex: action.index };
    case "closeLightbox":
      return { ...state, lightboxIndex: null };
  }
}

/**
 * Stepping is clamped, not wrapped: the reference disables the arrows at the
 * ends. Returns the index to show after moving `delta` places from `index`.
 */
export function stepIndex(index: number, delta: number, count: number) {
  return Math.min(Math.max(index + delta, 0), count - 1);
}
