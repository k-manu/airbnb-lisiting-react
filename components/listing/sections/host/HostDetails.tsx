import type { Host } from "@/data/types";
import { ShieldIcon } from "./icons";

/** Response stats, the message button and the payment-safety reminder. */
export function HostDetails({ host }: { host: Host }) {
  return (
    <div>
      <h3 className="mb-(--host-heading-gap) text-place-subtitle font-medium text-ink">
        Host details
      </h3>
      <p className="text-host-detail text-ink">
        <span className="block">Response rate: {host.responseRate}</span>
        <span className="block">Responds {host.responseTime}</span>
      </p>
      <button
        type="button"
        className="mt-(--host-message-gap-top) rounded-button bg-host-message p-(--host-message-pad) text-host-detail leading-[normal] font-medium text-ink hover:bg-host-message-hover"
      >
        Message host
      </button>
      <p className="mt-(--host-notice-gap-top) flex items-start gap-(--host-notice-gap) text-host-notice text-ink-muted">
        <ShieldIcon className="size-(--host-notice-icon-size) shrink-0" />
        To help protect your payment, always use Airbnb to send money and
        communicate with hosts.
      </p>
    </div>
  );
}
