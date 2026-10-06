import type { Host } from "@/data/types";
import { BalloonIcon, MortarboardIcon } from "./icons";

const FACT_ICONS = {
  born: BalloonIcon,
  school: MortarboardIcon,
} as const;

/** Short personal facts under the host card, each with its icon. */
export function HostFacts({ facts }: { facts: Host["facts"] }) {
  return (
    <ul className="mt-(--host-facts-gap-top) flex flex-col gap-(--host-facts-gap)">
      {facts.map((fact) => {
        const Icon = FACT_ICONS[fact.icon];
        return (
          <li
            key={fact.text}
            className="flex items-center gap-(--host-fact-icon-gap) text-host-fact text-ink"
          >
            <Icon className="size-(--host-fact-icon-size) shrink-0" />
            {fact.text}
          </li>
        );
      })}
    </ul>
  );
}
