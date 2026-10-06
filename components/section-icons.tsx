import type { SVGProps } from "react";
import { ArtIcon, type ArtName } from "./ArtIcon";

type IconProps = SVGProps<SVGSVGElement>;

const icon = (name: ArtName) =>
  function Icon(props: IconProps) {
    return <ArtIcon {...props} name={name} />;
  };

export const ChevronDownIcon = icon("chevron-down");
export const FlagIcon = icon("flag");
export const OutdoorIcon = icon("fire-pit");
export const FanIcon = icon("fan");
export const DoorIcon = icon("door");
export const ArrowLeftIcon = icon("arrow-left");
