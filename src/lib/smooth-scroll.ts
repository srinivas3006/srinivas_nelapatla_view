import type Lenis from "lenis";

// The active Lenis instance, if smooth scrolling is on (see MotionProvider).
let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

/** Scroll to a section by id, through Lenis when it's running. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: "smooth" });
}
