import type { SVGProps } from "react";
import { ArtIcon } from "@/components/ArtIcon";

/** Month-paging chevron; `direction` is where it points. */
export function ChevronIcon({
  direction,
  ...props
}: SVGProps<SVGSVGElement> & { direction: "left" | "right" }) {
  return (
    <ArtIcon {...props} name={direction === "left" ? "chevron-small-left" : "chevron-small-right"} />
  );
}

/** A keyboard: rounded body with the space bar along the bottom. */
export function KeyboardIcon(props: SVGProps<SVGSVGElement>) {
  return <ArtIcon {...props} name="keyboard" />;
}
