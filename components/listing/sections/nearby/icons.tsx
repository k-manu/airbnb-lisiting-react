import type { SVGProps } from "react";
import { ArtIcon } from "@/components/ArtIcon";

/** Chevron used by the pager buttons; `direction` picks which way it points. */
export function ChevronIcon({
  direction,
  ...props
}: SVGProps<SVGSVGElement> & { direction: "left" | "right" }) {
  return (
    <ArtIcon {...props} name={direction === "right" ? "chevron-small-right" : "chevron-small-left"} />
  );
}

/** Five-point rating star, filled. */
export function StarIcon(props: SVGProps<SVGSVGElement>) {
  return <ArtIcon {...props} name="star" />;
}
