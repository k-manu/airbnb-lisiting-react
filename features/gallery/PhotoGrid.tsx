"use client";

import Image from "next/image";
import { ArtIcon } from "@/components/ArtIcon";
import { useGallery } from "./GalleryProvider";

/**
 * Layer 1 — the five-photo hero grid. Every photo, like "Show all photos",
 * opens the Photo Tour; a photo opens it at the start of its own room.
 */
export function PhotoGrid() {
  const { featured, openTour } = useGallery();

  return (
    <section
      aria-label="Photos"
      className="relative grid aspect-(--layout-grid-aspect) grid-cols-(--layout-grid-cols) grid-rows-2 gap-(--layout-grid-gap) overflow-hidden rounded-grid"
    >
      {featured.slice(0, 5).map((photo, i) => (
        <button
          key={photo.id}
          type="button"
          onClick={() => openTour(photo.roomId)}
          className={`relative block overflow-hidden bg-[#eee] after:absolute after:inset-0 after:bg-transparent after:transition-[background] after:duration-200 hover:after:bg-black/10 active:scale-[0.997] ${i === 0 ? "row-span-2" : ""}`}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            unoptimized
            priority={i < 2}
            className="object-cover transition-[filter] duration-200"
          />
        </button>
      ))}

      <button
        type="button"
        onClick={() => openTour()}
        className="transition-showall absolute right-(--photo-grid-button-inset) bottom-(--photo-grid-button-inset) flex items-center gap-2 rounded-button border border-ink bg-white px-[15px] py-[7px] text-caption font-medium text-ink shadow-show-all press-button hover:bg-grey-100"
      >
        <ArtIcon name="dots-grid" className="size-[15px]" />
        Show all photos
      </button>
    </section>
  );
}
