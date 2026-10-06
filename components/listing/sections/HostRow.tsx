import Image from "next/image";
import type { Host } from "@/data/listing";

/** "Hosted by …" row with the avatar; closes with the section divider. */
export function HostRow({ host }: { host: Host }) {
  return (
    <section
      aria-label="Host"
      className="flex items-center gap-4 py-host-bottom leading-body"
    >
      {host.avatarSrc && (
        <Image
          src={host.avatarSrc}
          alt=""
          width={46}
          height={46}
          unoptimized
          className="size-(--layout-avatar-size) shrink-0 rounded-full object-cover"
        />
      )}
      <div>
        <h2 className="text-body-lg font-medium text-ink">
          Hosted by {host.name}
        </h2>
        <p className="mt-0.5 text-body text-ink-muted">
          {host.yearsHosting} years hosting
        </p>
      </div>
    </section>
  );
}
