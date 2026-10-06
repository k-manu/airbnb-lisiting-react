/** The gallery module's own view of a photo; structurally compatible with the listing data. */
export interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Which room the photo belongs to (used by the Photo Tour). */
  roomId?: string;
}

export interface GalleryRoom {
  id: string;
  name: string;
  /** Short lines shown under the room name in the Photo Tour text panel. */
  details?: string[];
}
