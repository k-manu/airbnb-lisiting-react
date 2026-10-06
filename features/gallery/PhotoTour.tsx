"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { IconButton } from "@/components/ui/IconButton";
import { HeartIcon, ShareIcon } from "@/components/icons";
import { ArrowLeftIcon } from "@/components/section-icons";
import { useGallery } from "./GalleryProvider";
import type { GalleryPhoto, GalleryRoom } from "./types";

interface RoomGroup {
  room: GalleryRoom;
  photos: { photo: GalleryPhoto; index: number }[];
}

function groupByRoom(
  photos: GalleryPhoto[],
  rooms: GalleryRoom[],
): RoomGroup[] {
  const groups: RoomGroup[] = rooms.map((room) => ({ room, photos: [] }));
  photos.forEach((photo, index) => {
    groups
      .find((g) => g.room.id === photo.roomId)
      ?.photos.push({ photo, index });
  });
  return groups.filter((g) => g.photos.length > 0);
}

/**
 * How a room's photos are laid out: rows alternate one wide photo and a pair,
 * starting with a wide one; when exactly two are left they form a pair.
 */
export function rowPattern(count: number): number[] {
  const rows: number[] = [];
  let left = count;
  let wide = true;
  while (left > 0) {
    const size = left === 2 ? 2 : wide ? 1 : 2;
    rows.push(size);
    left -= size;
    wide = !wide;
  }
  return rows;
}

function chunk<T>(items: T[], pattern: number[]): T[][] {
  let at = 0;
  return pattern.map((n) => items.slice(at, (at += n)));
}

const thumb =
  "relative block aspect-[3/2] w-full overflow-hidden rounded-thumb bg-[#eeeeee] after:absolute after:inset-0 after:bg-transparent after:transition-[background] after:duration-200 hover:after:bg-black/[0.08]";
const thumbImage =
  "object-cover transition-transform duration-[400ms] ease-thumb group-hover:scale-[1.04] group-active:scale-100";

/**
 * Layer 2 — full-screen Photo Tour: a category strip, then one section per
 * room (sticky title on the left, photos on the right). Any photo opens the
 * Lightbox on top; closing it returns here.
 */
export function PhotoTour() {
  const { photos, rooms, tourOpen, tourRoomId, closeTour, openLightbox } =
    useGallery();
  const scrollRef = useRef<HTMLDivElement>(null);
  const groups = useMemo(() => groupByRoom(photos, rooms), [photos, rooms]);

  const scrollToRoom = (id: string, behavior: ScrollBehavior = "smooth") =>
    scrollRef.current
      ?.querySelector(`[data-room="${id}"]`)
      ?.scrollIntoView({ behavior, block: "start" });

  // Opening "at" a room (e.g. from a "Where you'll sleep" card).
  useEffect(() => {
    if (tourOpen && tourRoomId) scrollToRoom(tourRoomId, "auto");
  }, [tourOpen, tourRoomId]);

  return (
    <ModalDialog
      open={tourOpen}
      label="Photo tour"
      onClose={closeTour}
      fade
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none translate-y-[28px] flex-col overflow-hidden bg-white p-0 text-ink opacity-0 transition-[opacity,transform] duration-300 ease-thumb backdrop:bg-transparent open:flex data-[open=true]:translate-y-0 data-[open=true]:opacity-100"
    >
      <header className="relative z-[5] flex h-[88px] shrink-0 items-center bg-white px-8">
        <IconButton aria-label="Back" onClick={closeTour} className="-ml-2">
          <ArrowLeftIcon width={18} height={18} />
        </IconButton>
        <h2 className="absolute left-1/2 -translate-x-1/2 text-body-lg font-medium">
          Photo tour
        </h2>
        <div className="ml-auto flex gap-0.5">
          {/* Like the reference, these two only carry their hover look: no toast, no saved state. */}
          <IconButton aria-label="Share">
            <ShareIcon width={18} height={18} />
          </IconButton>
          <IconButton aria-label="Save">
            <HeartIcon width={18} height={18} />
          </IconButton>
        </div>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1024px] px-6 pb-24">
          <nav
            aria-label="Photo categories"
            className="mb-10 grid grid-cols-8 gap-3"
          >
            {groups.map(({ room, photos: roomPhotos }) => (
              <button
                key={room.id}
                type="button"
                onClick={() => scrollToRoom(room.id)}
                className="group flex flex-col gap-2 text-left"
              >
                <Image
                  src={roomPhotos[0].photo.src}
                  alt=""
                  width={106}
                  height={100}
                  unoptimized
                  className="aspect-[106/100] w-full rounded-thumb object-cover transition-thumb group-hover:scale-(--thumb-hover-scale) group-hover:brightness-(--thumb-hover-brightness) group-active:scale-[0.99]"
                />
                <span className="text-body leading-[normal] font-normal text-ink-muted">
                  {room.name}
                </span>
              </button>
            ))}
          </nav>

          <div>
            {groups.map(({ room, photos: roomPhotos }) => (
              <section
                key={room.id}
                data-room={room.id}
                aria-labelledby={`tour-${room.id}`}
                className="grid grid-cols-2 items-start gap-x-[60px] gap-y-5 pt-4 pb-1"
              >
                <div className="sticky top-5">
                  <h3
                    id={`tour-${room.id}`}
                    className="text-[32px] leading-[1.1] font-medium tracking-[-0.02em]"
                  >
                    {room.name}
                  </h3>
                  {room.details && room.details.length > 0 && (
                    <p className="mt-2 text-body-lg leading-[1.4] text-ink-muted">
                      {room.details.join(" · ")}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {chunk(roomPhotos, rowPattern(roomPhotos.length)).map(
                    (row) => (
                      <div
                        key={row[0].photo.id}
                        className={`grid gap-3 ${row.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}
                      >
                        {row.map(({ photo, index }) => (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={() => openLightbox(index)}
                            aria-label={`Open photo ${index + 1} of ${photos.length}: ${photo.alt}`}
                            className={`group ${thumb}`}
                          >
                            <Image
                              src={photo.src}
                              alt=""
                              fill
                              unoptimized
                              className={thumbImage}
                            />
                          </button>
                        ))}
                      </div>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </ModalDialog>
  );
}
