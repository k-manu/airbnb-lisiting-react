import type { ComponentType, SVGProps } from "react";
import { ArtIcon, type ArtName } from "@/components/ArtIcon";
import type { RatingCategory } from "@/data/types";

type IconProps = SVGProps<SVGSVGElement>;

const icon = (name: ArtName) =>
  function Icon(props: IconProps) {
    return <ArtIcon {...props} name={name} />;
  };

export const CATEGORY_ICONS: Record<
  RatingCategory["id"],
  ComponentType<IconProps>
> = {
  cleanliness: icon("category-cleanliness"),
  accuracy: icon("category-accuracy"),
  "check-in": icon("category-check-in"),
  communication: icon("category-communication"),
  location: icon("category-location"),
  value: icon("category-value"),
};

/** Small filled star used in each review's rating row. */
export const StarIcon = icon("star");
