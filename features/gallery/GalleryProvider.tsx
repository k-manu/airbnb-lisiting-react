"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  galleryReducer,
  initialGalleryState,
  stepIndex,
  type GalleryState,
} from "./state";
import type { GalleryPhoto, GalleryRoom } from "./types";
import { Lightbox } from "./Lightbox";
import { PhotoTour } from "./PhotoTour";

/** The Photo Tour is deep-linkable: /?modal=PHOTO_TOUR_SCROLLABLE. */
const TOUR_MODAL = "PHOTO_TOUR_SCROLLABLE";
/**
 * A photo open in the Lightbox adds &modalItem=<id>. The reference numbers its
 * photos from 1000 in tour order (first 1000, last 1042 of 43), so the id of
 * the photo at index i is FIRST_ITEM_ID + i.
 */
const ITEM_PARAM = "modalItem";
const FIRST_ITEM_ID = 1000;

const tourInUrl = () =>
  new URLSearchParams(window.location.search).get("modal") === TOUR_MODAL;

/** The photo index named by the URL, if any and if it is a real photo. */
function itemInUrl(count: number): number | null {
  const raw = new URLSearchParams(window.location.search).get(ITEM_PARAM);
  if (raw === null || !/^\d+$/.test(raw)) return null;
  const index = Number(raw) - FIRST_ITEM_ID;
  return index >= 0 && index < count ? index : null;
}

export interface GalleryApi extends GalleryState {
  /** Every photo, in Photo Tour order (this is the Lightbox order). */
  photos: GalleryPhoto[];
  rooms: GalleryRoom[];
  /** The photos shown in the hero grid. */
  featured: GalleryPhoto[];
  indexOfPhoto: (id: string) => number;
  openTour: (roomId?: string) => void;
  closeTour: () => void;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  stepLightbox: (delta: number) => void;
}

const GalleryContext = createContext<GalleryApi | null>(null);

/**
 * Public API of the gallery module. Wrap the page once; any section can then
 * call `useGallery().openTour(roomId)` (e.g. a hero photo opening the tour at
 * its room). The overlays render here, after the page, so sections never need
 * to know about them.
 *
 * Both overlays live in the address, as on the reference: opening one pushes a
 * history entry, stepping through photos rewrites the current one, closing
 * goes back, and the browser's Back button peels the layers off one at a time.
 */
export function GalleryProvider({
  photos,
  rooms = [],
  featuredIds,
  children,
}: {
  photos: GalleryPhoto[];
  rooms?: GalleryRoom[];
  featuredIds?: string[];
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(galleryReducer, initialGalleryState);
  const count = photos.length;
  const pushedTour = useRef(false);
  const pushedItem = useRef(false);

  // Deep link on load, and the browser Back/Forward buttons.
  useEffect(() => {
    const sync = () => {
      const item = itemInUrl(count);
      if (item !== null || tourInUrl()) dispatch({ type: "openTour" });
      else dispatch({ type: "closeTour" });
      if (item !== null) dispatch({ type: "openLightbox", index: item });
      else dispatch({ type: "closeLightbox" });
    };
    if (tourInUrl() || itemInUrl(count) !== null) sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [count]);

  const openTour = useCallback((roomId?: string) => {
    if (!tourInUrl()) {
      const url = new URL(window.location.href);
      url.searchParams.set("modal", TOUR_MODAL);
      window.history.pushState({}, "", url);
      pushedTour.current = true;
    }
    dispatch({ type: "openTour", roomId });
  }, []);

  const closeTour = useCallback(() => {
    if (tourInUrl()) {
      if (pushedTour.current) {
        // Undo our own history entry; popstate then closes the tour.
        pushedTour.current = false;
        window.history.back();
      } else {
        const url = new URL(window.location.href);
        url.searchParams.delete("modal");
        window.history.replaceState({}, "", url);
      }
    }
    dispatch({ type: "closeTour" });
  }, []);

  const showItem = useCallback((index: number, mode: "push" | "replace") => {
    const url = new URL(window.location.href);
    url.searchParams.set(ITEM_PARAM, String(FIRST_ITEM_ID + index));
    if (mode === "push") {
      window.history.pushState({}, "", url);
      pushedItem.current = true;
    } else {
      window.history.replaceState({}, "", url);
    }
  }, []);

  const openLightbox = useCallback(
    (index: number) => {
      showItem(index, itemInUrl(count) === null ? "push" : "replace");
      dispatch({ type: "openLightbox", index });
    },
    [count, showItem],
  );

  const closeLightbox = useCallback(() => {
    if (itemInUrl(count) !== null) {
      if (pushedItem.current) {
        pushedItem.current = false;
        window.history.back();
      } else {
        const url = new URL(window.location.href);
        url.searchParams.delete(ITEM_PARAM);
        window.history.replaceState({}, "", url);
      }
    }
    dispatch({ type: "closeLightbox" });
  }, [count]);

  const api = useMemo<GalleryApi>(() => {
    const byId = new Map(photos.map((p, i) => [p.id, i]));
    const featured = (featuredIds ?? photos.slice(0, 5).map((p) => p.id))
      .map((id) => photos[byId.get(id) ?? -1])
      .filter((p): p is GalleryPhoto => Boolean(p));
    return {
      ...state,
      photos,
      rooms,
      featured,
      indexOfPhoto: (id) => byId.get(id) ?? 0,
      openTour,
      closeTour,
      openLightbox,
      closeLightbox,
      stepLightbox: (delta) => {
        if (state.lightboxIndex === null || count === 0) return;
        const next = stepIndex(state.lightboxIndex, delta, count);
        if (next === state.lightboxIndex) return;
        showItem(next, "replace");
        dispatch({ type: "openLightbox", index: next });
      },
    };
  }, [
    state,
    photos,
    rooms,
    featuredIds,
    count,
    openTour,
    closeTour,
    openLightbox,
    closeLightbox,
    showItem,
  ]);

  return (
    <GalleryContext value={api}>
      {children}
      <PhotoTour />
      <Lightbox />
    </GalleryContext>
  );
}

export function useGallery(): GalleryApi {
  const api = useContext(GalleryContext);
  if (!api) throw new Error("useGallery must be used inside <GalleryProvider>");
  return api;
}
