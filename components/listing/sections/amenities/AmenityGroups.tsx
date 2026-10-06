import { AmenityRow } from "./AmenityRow";

/** The modal body: every amenity under its category heading. */
export function AmenityGroups({
  groups,
  unavailable,
}: {
  groups: { category: string; items: string[] }[];
  /** Labels shown struck through, as on the page list. */
  unavailable: ReadonlySet<string>;
}) {
  return (
    <>
      {groups.map((group) => (
        <section
          key={group.category}
          className="mb-(--amenity-modal-group-gap)"
        >
          <h3 className="mb-(--amenity-modal-group-title-gap) text-(length:--amenity-modal-group-title-size) font-medium text-ink">
            {group.category}
          </h3>
          <ul>
            {group.items.map((label) => (
              <AmenityRow
                key={label}
                label={label}
                unavailable={unavailable.has(label)}
                className="border-b border-line py-(--amenity-modal-row-pad-y)"
              />
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
