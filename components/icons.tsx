import type { SVGProps } from "react";
import { ArtIcon, type ArtName } from "./ArtIcon";

type IconProps = SVGProps<SVGSVGElement>;

/** Generic 16px icons; the artwork comes from the registry, the size can be overridden. */
const icon = (name: ArtName) =>
  function Icon(props: IconProps) {
    return <ArtIcon width={16} height={16} {...props} name={name} />;
  };

export const ShareIcon = icon("share");
export const HeartIcon = icon("heart");
export const GridIcon = icon("dots-grid");
export const SearchIcon = icon("search");
export const GlobeIcon = icon("globe");
export const MenuIcon = icon("menu");
export const ChevronLeftIcon = icon("chevron-left");
export const ChevronRightIcon = icon("chevron-right");
export const CloseIcon = icon("close");
export const StarIcon = icon("star");
