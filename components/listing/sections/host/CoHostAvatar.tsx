import Image from "next/image";
import type { Person } from "@/data/types";

const TINTS = [
  "bg-cohost-rose text-cohost-rose-ink",
  "bg-cohost-sky text-cohost-sky-ink",
] as const;

// Intrinsic size handed to next/image; the drawn size comes from the token.
const AVATAR_PX = 34;

/**
 * Co-host photo, or their initial on a tinted circle when there is none. The
 * tint alternates with the co-host's position so neighbours differ.
 */
export function CoHostAvatar({
  person,
  position,
}: {
  person: Person;
  position: number;
}) {
  const box = "size-(--host-cohost-avatar-size) shrink-0 rounded-full";
  if (person.avatarSrc) {
    return (
      <Image
        src={person.avatarSrc}
        alt=""
        width={AVATAR_PX}
        height={AVATAR_PX}
        unoptimized
        className={`${box} object-cover`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${box} flex items-center justify-center text-host-initial font-medium ${TINTS[position % TINTS.length]}`}
    >
      {person.initial}
    </span>
  );
}
