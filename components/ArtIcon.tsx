import type { SVGProps } from "react";
import { ICON_ALIASES, ICON_ART } from "./icon-art.generated";

export type ArtName = keyof typeof ICON_ART | keyof typeof ICON_ALIASES;

type Props = Omit<SVGProps<SVGSVGElement>, "name"> & { name: ArtName };

function resolve(name: ArtName) {
  return ICON_ART[(ICON_ALIASES as Record<string, string>)[name] as keyof typeof ICON_ART ?? name as keyof typeof ICON_ART];
}

/** True when the registry has artwork under this name (aliases included). */
export function hasArt(name: string): name is ArtName {
  return name in ICON_ART || name in ICON_ALIASES;
}

/**
 * Renders one registered icon artwork inline, so it inherits the text colour and any
 * size the caller sets. Props given by the caller win over the artwork's own paint
 * (a saved heart passes `fill`, for example).
 */
export function ArtIcon({ name, ...props }: Props) {
  const art = resolve(name);
  return (
    <svg
      viewBox={art.viewBox}
      {...art.paint}
      aria-hidden="true"
      focusable="false"
      {...props}
      dangerouslySetInnerHTML={{ __html: art.body }}
    />
  );
}
