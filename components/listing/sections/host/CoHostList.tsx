import type { Person } from "@/data/types";
import { CoHostAvatar } from "./CoHostAvatar";

/** "Co-Hosts": everyone who helps run the listing, three to a row. */
export function CoHostList({ coHosts }: { coHosts: Person[] }) {
  return (
    <div>
      <h3 className="mb-(--host-heading-gap) text-place-subtitle font-medium text-ink">
        Co-Hosts
      </h3>
      <ul className="mb-(--host-cohost-grid-bottom) grid grid-cols-3 gap-(--host-cohost-grid-gap)">
        {coHosts.map((person, position) => (
          <li
            key={person.name}
            className="flex items-center gap-(--host-cohost-gap) text-host-cohost text-ink"
          >
            <CoHostAvatar person={person} position={position} />
            <span>{person.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
