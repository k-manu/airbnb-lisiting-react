import { notFound } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Development-only sandbox routes (one page per section, see
 * HANDOFF.md). They exist so a section can be built and
 * pixel-diffed in isolation, and are not part of the product: in a production
 * build every /dev/* route is a 404.
 */
export default function DevLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return children;
}
