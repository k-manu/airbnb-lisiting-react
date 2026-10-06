import type { ComponentType, SVGProps } from "react";
import type { Listing } from "@/data/listing";
import { CalendarCancelIcon, KeyIcon, ShieldIcon } from "./icons";

interface Column {
  id: string;
  title: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  lines: string[];
  /** Names the otherwise identical "Learn more" links for screen readers. */
  learnMoreLabel: string;
}

function InfoColumn({ title, Icon, lines, learnMoreLabel, id }: Column) {
  return (
    <div role="group" aria-labelledby={id}>
      <Icon className="mb-(--know-icon-margin-bottom) size-(--know-icon-size) text-ink" />
      <h3
        id={id}
        className="mb-(--know-title-margin-bottom) text-body-lg leading-(--know-title-line-height) font-medium text-ink"
      >
        {title}
      </h3>
      {lines.map((line) => (
        <p
          key={line}
          className="mb-(--know-text-margin-bottom) text-body leading-(--know-text-line-height) text-ink"
        >
          {line}
        </p>
      ))}
      <a
        href="#"
        aria-label={learnMoreLabel}
        className="text-body leading-(--know-link-line-height) font-medium text-ink underline"
      >
        Learn more
      </a>
    </div>
  );
}

/** Cancellation policy, house rules and safety notes in three columns. */
export function ThingsToKnowSection({
  data,
}: {
  data: Listing["thingsToKnow"];
}) {
  const columns: Column[] = [
    {
      id: "know-cancellation",
      title: "Cancellation policy",
      Icon: CalendarCancelIcon,
      lines: data.cancellation.lines,
      learnMoreLabel: "Learn more about the cancellation policy",
    },
    {
      id: "know-house-rules",
      title: "House rules",
      Icon: KeyIcon,
      lines: data.houseRules,
      learnMoreLabel: "Learn more about the house rules",
    },
    {
      id: "know-safety",
      title: "Safety & property",
      Icon: ShieldIcon,
      lines: data.safety,
      learnMoreLabel: "Learn more about safety and property",
    },
  ];

  return (
    <section
      aria-labelledby="know-heading"
      className="border-t border-line py-(--know-section-padding-y) pt-[calc(var(--know-section-padding-y)+var(--know-things-nudge-y))]"
    >
      <h2
        id="know-heading"
        className="mb-[calc(var(--know-heading-margin-bottom)-var(--know-things-nudge-y))] text-title-sm leading-(--know-heading-line-height) font-medium text-ink"
      >
        Things to know
      </h2>
      <div className="grid grid-cols-3 gap-x-(--know-column-gap)">
        {columns.map((column) => (
          <InfoColumn key={column.id} {...column} />
        ))}
      </div>
    </section>
  );
}
