const FALLBACK_OFFSET = 80;

/** How far above a section its top edge lands: the token `--sticky-nav-scroll-offset`. */
function scrollOffset(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    "--sticky-nav-scroll-offset",
  );
  const value = parseFloat(raw);
  return Number.isFinite(value) ? value : FALLBACK_OFFSET;
}

/**
 * Smooth-scrolls so the section with this DOM id ends up just below the top of the viewport.
 * The address is left alone. Motion is skipped for visitors who ask for reduced motion.
 */
export function scrollToSection(id: string): void {
  const target = document.getElementById(id);
  if (!target) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY - scrollOffset(),
    behavior: reduced ? "auto" : "smooth",
  });
}
