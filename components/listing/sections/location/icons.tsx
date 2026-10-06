import type { SVGProps } from "react";
import { ArtIcon, type ArtName } from "@/components/ArtIcon";

type IconProps = SVGProps<SVGSVGElement>;

const icon = (name: ArtName) =>
  function Icon(props: IconProps) {
    return <ArtIcon {...props} name={name} />;
  };

export const MagnifierIcon = icon("search");
export const PlusIcon = icon("plus");
export const MinusIcon = icon("minus");
/** Home glyph for the map pin. */
export const HomePinIcon = icon("home-pin");
