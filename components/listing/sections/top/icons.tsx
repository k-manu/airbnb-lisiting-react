import type { SVGProps } from "react";
import { ArtIcon, type ArtName } from "@/components/ArtIcon";

type IconProps = SVGProps<SVGSVGElement>;

const icon = (name: ArtName) =>
  function Icon(props: IconProps) {
    return <ArtIcon {...props} name={name} />;
  };

export const FirePitIcon = icon("fire-pit");
export const FanIcon = icon("fan");
export const DoorIcon = icon("door");
/** One branch of the guest-favourite laurel; the other branch is this mirrored with CSS. */
export const LaurelIcon = icon("laurel");
export const RatingStarIcon = icon("star");
/** The guests select's chevron. */
export const FieldChevronIcon = icon("chevron-down");
export const ReportFlagIcon = icon("flag");
export const ShareArrowIcon = icon("share");
export const SaveHeartIcon = icon("heart");
