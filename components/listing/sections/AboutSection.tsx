import type { Listing } from "@/data/listing";
import { Description } from "./top/Description";

/** Auto-translation notice + the collapsible description. */
export function AboutSection({
  description,
}: {
  description: Listing["description"];
}) {
  return (
    <section
      aria-labelledby="about-heading"
      className="border-t border-line pt-about-top pb-(--about-gap-below) leading-body"
    >
      <h2 id="about-heading" className="sr-only">
        About this place
      </h2>
      {description.translated && (
        <p className="mb-notice-gap rounded-notice bg-grey-100 px-notice-x py-4 text-body text-ink">
          Some info has been automatically translated.{" "}
          <button type="button" className="font-medium underline">
            Show original
          </button>
        </p>
      )}
      <Description
        text={description.text}
        collapsedLines={description.collapsedLines}
      />
    </section>
  );
}
