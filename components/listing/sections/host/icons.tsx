import type { SVGProps } from "react";
import { ArtIcon, type ArtName } from "@/components/ArtIcon";

type IconProps = SVGProps<SVGSVGElement>;

const icon = (name: ArtName) =>
  function Icon(props: IconProps) {
    return <ArtIcon {...props} name={name} />;
  };

/** Tick shown inside the verified badge. */
export const TickIcon = icon("verified");
/** Balloon, for the "born in" fact. */
export const BalloonIcon = icon("born");
/** Mortarboard, for the school fact. */
export const MortarboardIcon = icon("school");
/** Shield, for the payment-safety notice. */
export const ShieldIcon = icon("shield");
