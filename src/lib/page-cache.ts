// Shared with route files (client-safe: no server imports). Purging lives in
// page-cache.server.ts.

/** Cache tag shared by every public, CMS-driven page. */
export const PAGES_TAG = "pages";

/**
 * Response headers for public pages: browsers always revalidate, Netlify's CDN
 * keeps the rendered HTML for 5 minutes and serves a stale copy while it
 * re-renders in the background. Saving in /admin purges it.
 */
export const PAGE_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Netlify-CDN-Cache-Control": "public, durable, s-maxage=300, stale-while-revalidate=604800",
  "Netlify-Cache-Tag": PAGES_TAG,
};
