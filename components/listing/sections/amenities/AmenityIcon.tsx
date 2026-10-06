import { ArtIcon, hasArt, type ArtName } from "@/components/ArtIcon";

const slug = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * The icon for one amenity, looked up by its label in the artwork registry
 * (a neutral check-circle for a label with no artwork). An unavailable amenity
 * has its own crossed-out artwork, so `unavailable` only matters for labels
 * whose artwork does not carry the slash already.
 */
export function AmenityIcon({ label }: { label: string; unavailable?: boolean }) {
  const key = `amenity-${slug(label)}`;
  const name: ArtName = hasArt(key) ? key : "verified";
  return <ArtIcon name={name} className="size-(--amenity-icon-size) shrink-0" />;
}
