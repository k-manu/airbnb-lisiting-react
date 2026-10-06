import Image from "next/image";
import type { Listing } from "@/data/listing";

/**
 * "Where you'll sleep": one photo card per sleeping area. The cards are plain
 * content in the reference (not links or buttons), so they are not focusable.
 */
export function SleepingSection({ areas }: { areas: Listing["sleeping"] }) {
  return (
    <section
      aria-labelledby="sleeping-heading"
      className="border-t border-line pt-(--amenities-section-pad-y) pb-(--sleeping-pad-bottom) leading-(--amenities-leading)"
    >
      <h2
        id="sleeping-heading"
        className="mb-(--amenities-heading-gap) text-title-sm leading-(--amenities-heading-leading) font-medium text-ink"
      >
        Where you&apos;ll sleep
      </h2>
      <ul className="grid grid-cols-2 gap-(--sleeping-grid-gap)">
        {areas.map((area) => (
          <li key={area.id}>
            <div className="relative aspect-(--sleeping-photo-ratio) overflow-hidden rounded-thumb border border-line-card">
              <Image
                src={area.imageSrc}
                alt={area.imageAlt}
                fill
                sizes="273px"
                unoptimized
                className="object-cover"
              />
            </div>
            <h3 className="mt-(--sleeping-name-gap) text-(length:--sleeping-name-size) font-medium text-ink">
              {area.name}
            </h3>
            <p className="mt-(--sleeping-detail-gap) text-body text-ink-muted">
              {area.detail}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
