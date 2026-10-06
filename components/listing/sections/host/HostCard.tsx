import Image from "next/image";
import type { ReactNode } from "react";
import type { Host } from "@/data/types";
import { StarIcon } from "@/components/icons";
import { TickIcon } from "./icons";

// Intrinsic size handed to next/image; the drawn size comes from the token.
const AVATAR_PX = 88;

function VerifiedBadge() {
  return (
    <span className="absolute right-0 bottom-(--host-badge-inset-bottom) flex size-(--host-badge-size) items-center justify-center rounded-full border-(length:--host-badge-ring) border-white bg-brand text-white">
      <TickIcon className="size-(--host-badge-check-size)" />
      <span className="sr-only">Verified host</span>
    </span>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="border-line py-(--host-stat-pad-y) not-first:border-t">
      <p className="text-host-stat font-medium text-ink">{children}</p>
      <p className="text-host-label text-ink">{label}</p>
    </li>
  );
}

/** Elevated card: photo, name and role on the left, three key numbers on the right. */
export function HostCard({ host }: { host: Host }) {
  return (
    <div className="grid grid-cols-(--host-card-columns) items-center rounded-host-card border border-line-card p-(--host-card-pad) shadow-host-card">
      <div className="text-center">
        {host.avatarSrc && (
          <div className="relative mx-auto mb-(--host-avatar-gap) size-(--host-avatar-size)">
            <Image
              src={host.avatarSrc}
              alt=""
              width={AVATAR_PX}
              height={AVATAR_PX}
              unoptimized
              className="size-full rounded-full object-cover"
            />
            {host.verified && <VerifiedBadge />}
          </div>
        )}
        <p className="text-host-name font-medium text-ink">{host.name}</p>
        <p className="mt-(--host-role-gap) text-host-role text-ink">Host</p>
      </div>
      <ul className="border-l border-line pl-(--host-stats-pad-x)">
        <Stat label="Reviews">{host.reviewCount.toLocaleString("en-US")}</Stat>
        <Stat label="Rating">
          <span className="inline-flex items-center">
            {host.rating}
            <StarIcon className="size-(--host-rating-star-size)" />
          </span>
        </Stat>
        <Stat label="Years hosting">{host.yearsHosting}</Stat>
      </ul>
    </div>
  );
}
