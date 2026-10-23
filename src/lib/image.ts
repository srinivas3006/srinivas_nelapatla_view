// Responsive images through Netlify Image CDN (/.netlify/images), which resizes
// and serves AVIF/WebP per browser. Enabled only for Netlify builds (see
// VITE_IMAGE_CDN in vite.config.ts); elsewhere the original URL is used.

const CDN_ENABLED = import.meta.env.VITE_IMAGE_CDN === "netlify";

export function cdnImage(src: string, width: number) {
  if (!CDN_ENABLED || !src || src.startsWith("data:")) return src;
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&q=80`;
}

/** `src`, `srcSet` and `sizes` props for an <img>. */
export function responsiveImage(src: string, widths: number[], sizes: string) {
  if (!CDN_ENABLED || !src || src.startsWith("data:")) return { src };
  return {
    src: cdnImage(src, widths[Math.floor(widths.length / 2)]),
    srcSet: widths.map((w) => `${cdnImage(src, w)} ${w}w`).join(", "),
    sizes,
  };
}
