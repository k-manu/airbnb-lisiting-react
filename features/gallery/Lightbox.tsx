"use client";

import type { KeyboardEvent } from "react";
import Image from "next/image";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { IconButton } from "@/components/ui/IconButton";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  GridIcon,
} from "@/components/icons";
import { useGallery } from "./GalleryProvider";

const arrow =
  "transition-icon absolute top-1/2 z-[3] flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink bg-white text-ink hover:bg-grey-100 active:-translate-y-1/2 active:scale-[0.92] disabled:cursor-default disabled:border-[#cccccc] disabled:opacity-[0.28] disabled:hover:bg-white";

/** Layer 1 — single-photo viewer: prev/next, ←/→, Escape, focus trap. */
export function Lightbox() {
  const {
    photos,
    rooms,
    tourOpen,
    lightboxIndex,
    closeLightbox,
    stepLightbox,
    openTour,
  } = useGallery();
  const open = lightboxIndex !== null;
  // Keep the last photo on screen while the exit fade plays.
  const index = lightboxIndex ?? 0;
  const photo = photos[index];
  const roomName = rooms.find((r) => r.id === photo?.roomId)?.name;

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      stepLightbox(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      stepLightbox(1);
    }
  };

  // The grid button goes back to the Photo Tour the viewer opened over.
  const showAllPhotos = () => {
    if (!tourOpen) openTour();
    closeLightbox();
  };

  return (
    <ModalDialog
      open={open}
      label="Photo viewer"
      onClose={closeLightbox}
      onKeyDown={handleKeyDown}
      fade
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-center justify-center bg-white p-0 text-ink opacity-0 transition-opacity duration-(--dur-lightbox-fade) ease-standard backdrop:bg-transparent open:flex data-[open=true]:opacity-100"
    >
      <header className="absolute inset-x-0 top-0 z-[3] flex h-[72px] items-center px-6">
        <IconButton
          aria-label="Show all photos"
          onClick={showAllPhotos}
          className="-ml-2"
        >
          <GridIcon width={18} height={18} />
        </IconButton>
        <p className="absolute left-1/2 -translate-x-1/2 text-body-lg font-medium">
          {roomName}
        </p>
        <div className="ml-auto flex items-center gap-3">
          <span aria-live="polite" className="text-body">
            {index + 1} of {photos.length}
          </span>
          <IconButton aria-label="Close" onClick={closeLightbox}>
            <CloseIcon width={18} height={18} />
          </IconButton>
        </div>
      </header>

      <button
        type="button"
        onClick={() => stepLightbox(-1)}
        disabled={index === 0}
        aria-label="Previous photo"
        className={`${arrow} left-5`}
      >
        <ChevronLeftIcon width={18} height={18} />
      </button>

      <div className="flex size-full items-center justify-center px-24 py-[88px]">
        {photo && (
          <Image
            key={photo.id}
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            unoptimized
            className="h-auto max-h-full w-auto max-w-[min(1100px,100%)] animate-[lb-fade_0.3s_ease] object-contain"
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => stepLightbox(1)}
        disabled={index === photos.length - 1}
        aria-label="Next photo"
        className={`${arrow} right-5`}
      >
        <ChevronRightIcon width={18} height={18} />
      </button>
    </ModalDialog>
  );
}
