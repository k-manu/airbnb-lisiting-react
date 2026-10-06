import type { ComponentType, SVGProps } from "react";
import type { Highlight } from "@/data/listing";
import { DoorIcon, FanIcon, FirePitIcon } from "./top/icons";

const ICONS: Record<
  Highlight["icon"],
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  outdoor: FirePitIcon,
  cool: FanIcon,
  "self-check-in": DoorIcon,
};

/** The three "what stands out" rows; closes with the section divider. */
export function HighlightList({ items }: { items: Highlight[] }) {
  return (
    <ul className="space-y-6 border-t border-line pt-8 pb-8 leading-body">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        return (
          <li key={item.icon} className="flex items-start gap-6">
            <Icon className="-mt-px size-6 shrink-0 text-ink" />
            <div>
              <p className="text-body leading-5 font-medium text-ink">
                {item.title}
              </p>
              <p className="mt-0.5 text-body leading-detail text-ink-muted">
                {item.text}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
