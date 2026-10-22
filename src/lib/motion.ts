// Shared motion tokens so every animation on the site feels like one system.

/** Signature ease: fast start, long soft landing. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  fast: 0.3,
  base: 0.6,
  slow: 0.8,
  hero: 1.2,
} as const;

/** Shared view-transition name linking a project card image to its detail page. */
export function projectMediaTransition(slug: string) {
  return `project-media-${slug.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

export const SPRING = {
  /** Lazy follow — parallax layers, Pluto's gaze. */
  soft: { stiffness: 120, damping: 20, mass: 0.6 },
  /** Responsive follow — magnetic buttons, tilt cards. */
  snappy: { stiffness: 300, damping: 26, mass: 0.5 },
  /** Near-instant follow — cursor dot. */
  cursor: { stiffness: 700, damping: 45, mass: 0.25 },
} as const;
