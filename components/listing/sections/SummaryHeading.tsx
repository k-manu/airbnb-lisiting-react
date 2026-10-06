import type { Summary } from "@/data/listing";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** "Entire serviced apartment in Candolim, India" + the guest/bed/bath counts. */
export function SummaryHeading({ summary }: { summary: Summary }) {
  return (
    <section aria-labelledby="summary-heading">
      <h2
        id="summary-heading"
        className="text-title-sm leading-[26px] font-medium text-ink"
      >
        {summary.propertyType} in {summary.location}
      </h2>
      <p className="mt-summary-line text-body-lg leading-body text-ink">
        {[
          plural(summary.guests, "guest"),
          plural(summary.bedrooms, "bedroom"),
          plural(summary.beds, "bed"),
          plural(summary.bathrooms, "bathroom"),
        ].join(" · ")}
      </p>
    </section>
  );
}
