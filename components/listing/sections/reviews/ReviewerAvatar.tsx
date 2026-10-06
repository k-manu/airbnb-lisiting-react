import Image from "next/image";
import type { Person } from "@/data/types";

const TINTS = [
  "bg-avatar-warm text-avatar-warm-ink",
  "bg-avatar-lavender text-avatar-lavender-ink",
] as const;

// Deterministic tint per initial, so a reviewer keeps their colour on re-render.
const FIRST_LETTER_CODE = "A".charCodeAt(0);
function tintFor(initial: string) {
  const index = initial.toUpperCase().charCodeAt(0) - FIRST_LETTER_CODE;
  return TINTS[Math.abs(index) % TINTS.length];
}

/** Photo when the reviewer has one, otherwise their initial on a tinted circle. */
export function ReviewerAvatar({ author }: { author: Person }) {
  const box = "size-(--reviews-avatar-size) shrink-0 rounded-full";
  if (author.avatarSrc) {
    return (
      <Image
        src={author.avatarSrc}
        alt=""
        width={42}
        height={42}
        unoptimized
        className={`${box} object-cover`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${box} flex items-center justify-center text-review-initial font-medium ${tintFor(author.initial)}`}
    >
      {author.initial}
    </span>
  );
}
