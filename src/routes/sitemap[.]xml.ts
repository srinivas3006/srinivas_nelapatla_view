import { createFileRoute } from "@tanstack/react-router";
import { loadPortfolioContent } from "@/lib/use-portfolio";
import { SITE_URL } from "@/lib/site";
import { PAGE_CACHE_HEADERS } from "@/lib/page-cache";

// /sitemap.xml: the home page plus every published project, from CMS content.
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const content = await loadPortfolioContent();
        const paths = [
          "/",
          ...content.projects.filter((p) => p.is_published).map((p) => `/projects/${p.slug}`),
        ];
        const urls = paths
          .map((path) => `  <url><loc>${SITE_URL}${encodeURI(path)}</loc></url>`)
          .join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
        return new Response(xml, {
          headers: { ...PAGE_CACHE_HEADERS, "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
