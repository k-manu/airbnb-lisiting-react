// Public surface of the gallery module. Import from "@/features/gallery" only.
//
// Layers (each works without the ones above it):
//   0  state.ts            pure reducer: tour / lightbox open state
//   1  PhotoGrid, Lightbox hero grid + single-photo viewer
//   2  PhotoTour           scrollytelling tour (uses useScrollSpy)
export { GalleryProvider, useGallery } from "./GalleryProvider";
export type { GalleryApi } from "./GalleryProvider";
export { PhotoGrid } from "./PhotoGrid";
export type { GalleryPhoto, GalleryRoom } from "./types";
