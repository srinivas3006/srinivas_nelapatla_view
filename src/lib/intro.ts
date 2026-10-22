// First-visit intro timing (IntroLoader + .intro / .hero-in rules in styles.css).

export const INTRO_KEY = "intro-seen";
/**
 * When <html data-intro> flips from "playing" to "done". Must outlast the
 * curtain (2.1s) and the hero entrances it delays (last word ends ~3.4s),
 * since the flip removes their extra delay.
 */
export const INTRO_DONE_MS = 4000;
