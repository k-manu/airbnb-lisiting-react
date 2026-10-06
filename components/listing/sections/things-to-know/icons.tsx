import type { SVGProps } from "react";
import { ArtIcon, type ArtName } from "@/components/ArtIcon";

type IconProps = SVGProps<SVGSVGElement>;

const icon = (name: ArtName) =>
  function Icon(props: IconProps) {
    return <ArtIcon {...props} name={name} />;
  };

export const CalendarCancelIcon = icon("rules-cancellation");
export const KeyIcon = icon("rules-house");
export const ShieldIcon = icon("rules-safety");
