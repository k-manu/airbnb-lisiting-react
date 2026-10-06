import { AmenityIcon } from "./AmenityIcon";

/**
 * Icon + label list item shared by the page list and the modal; the caller
 * supplies the spacing. Unavailable amenities are muted and struck through.
 */
export function AmenityRow({
  label,
  unavailable = false,
  className = "",
}: {
  label: string;
  unavailable?: boolean;
  className?: string;
}) {
  return (
    <li
      className={`flex items-center gap-(--amenity-row-gap) text-body-lg ${
        unavailable ? "text-ink-muted" : "text-ink"
      } ${className}`}
    >
      <AmenityIcon label={label} unavailable={unavailable} />
      <span className={unavailable ? "line-through" : undefined}>
        {unavailable && <span className="sr-only">Unavailable: </span>}
        {label}
      </span>
    </li>
  );
}
