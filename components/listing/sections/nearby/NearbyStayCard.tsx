import Image from "next/image";
import type { NearbyStay } from "@/data/listing";
import { StarIcon } from "./icons";
import { formatRating, formatRupees } from "./formatPrice";

/**
 * One stay in the carousel: photo, two-line title, price and rating. Like the reference, a card is
 * display-only: not a link, no pointer cursor, nothing happens when it is clicked.
 */
export function NearbyStayCard({ stay }: { stay: NearbyStay }) {
  return (
    <li className="nearby-card-size">
      <div className="text-ink">
        <span className="relative block aspect-square overflow-hidden rounded-(--nearby-image-radius)">
          {stay.imageSrc && (
            <Image
              src={stay.imageSrc}
              alt=""
              fill
              sizes="191px"
              unoptimized
              loading="lazy"
              className="object-cover"
            />
          )}
        </span>
        <span className="mt-(--nearby-title-margin-top) line-clamp-2 block text-body leading-(--nearby-title-line-height) font-medium">
          {stay.title}
        </span>
        <span className="mt-(--nearby-meta-margin-top) flex items-center gap-x-(--nearby-meta-gap) text-nearby-meta leading-(--nearby-meta-line-height)">
          <span>{formatRupees(stay.price)}</span>
          <span className="flex items-center gap-x-(--nearby-star-gap)">
            <StarIcon className="size-(--nearby-star-size)" />
            <span>
              <span className="sr-only">Rated </span>
              {formatRating(stay.rating)}
            </span>
          </span>
        </span>
      </div>
    </li>
  );
}
