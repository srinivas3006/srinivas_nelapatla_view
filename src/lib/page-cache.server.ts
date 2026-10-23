import { purgeCache } from "@netlify/functions";
import { PAGES_TAG } from "./page-cache";

/** Drop CDN-cached pages so admin edits show up immediately. No-op off Netlify. */
export async function purgePages() {
  try {
    await purgeCache({ tags: [PAGES_TAG] });
  } catch (e) {
    // Local dev/other hosts have no purge token; cached copies expire anyway.
    console.warn("Page cache purge skipped:", (e as Error).message);
  }
}
