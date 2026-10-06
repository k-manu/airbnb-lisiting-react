import { useId } from "react";
import type { Host } from "@/data/types";
import { CoHostList } from "./CoHostList";
import { HostCard } from "./HostCard";
import { HostDetails } from "./HostDetails";
import { HostFacts } from "./HostFacts";

interface MeetYourHostSectionProps {
  /** Anchor id, if a link needs to target this section. */
  id?: string;
  host: Host;
}

/** Host card with facts, then co-hosts, response details and a message button. Owns its top divider. */
export function MeetYourHostSection({ id, host }: MeetYourHostSectionProps) {
  const headingId = useId();

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="border-t border-line pt-(--host-pad-top) pb-(--host-pad-bottom)"
    >
      <h2
        id={headingId}
        className="mb-(--place-title-gap) text-place-title font-medium text-ink"
      >
        Meet your host
      </h2>
      <div className="grid grid-cols-(--host-columns) items-start gap-x-(--host-column-gap)">
        <div>
          <HostCard host={host} />
          <HostFacts facts={host.facts} />
        </div>
        <div>
          <CoHostList coHosts={host.coHosts} />
          <HostDetails host={host} />
        </div>
      </div>
    </section>
  );
}
