// Site-wide metadata. VITE_SITE_URL comes from Netlify's URL at build time
// (vite.config.ts); absolute URLs are required for social previews.

export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || "https://srinivasnelapatla.netlify.app"
).replace(/\/$/, "");
export const SITE_NAME = "Srinivas Nelapatla";
export const SITE_TITLE = "Srinivas Nelapatla — Full Stack Developer";
export const SITE_DESCRIPTION =
  "Portfolio of Srinivas Nelapatla — a Computer Science Engineer building clean, scalable & meaningful digital solutions with Django, Vue and React.";
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

/** Title, description, canonical URL and social-preview tags for one page. */
export function pageMeta({
  title,
  description,
  path,
  image = OG_IMAGE,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}) {
  const url = `${SITE_URL}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
