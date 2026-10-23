import { queryOptions, useQuery } from "@tanstack/react-query";
import { DEFAULTS, type PortfolioContent } from "./portfolio-content";
import { getSiteContent } from "./api/content.server";

/** Merge `site_content` rows (keyed by section) over the bundled defaults. */
function mergeContent(rows: { key: string; value: unknown }[]): PortfolioContent {
  const merged: Record<string, unknown> = { ...DEFAULTS };
  for (const row of rows) {
    if (!row.key || !row.value || !merged[row.key]) continue;
    const isObject = typeof row.value === "object" && !Array.isArray(row.value);
    merged[row.key] = isObject
      ? { ...(merged[row.key] as object), ...(row.value as object) }
      : row.value;
  }
  return merged as PortfolioContent;
}

/** CMS content merged over defaults; falls back to defaults if the DB fails. */
export async function loadPortfolioContent(): Promise<PortfolioContent> {
  try {
    const rows = await getSiteContent();
    return Array.isArray(rows) ? mergeContent(rows) : DEFAULTS;
  } catch (e) {
    console.error("Failed to load portfolio content from DB, using defaults", e);
    return DEFAULTS;
  }
}

// Shared by useQuery and the route loaders that prefetch it during SSR.
export const portfolioContentQuery = queryOptions({
  queryKey: ["site_content", "v2"],
  queryFn: loadPortfolioContent,
  staleTime: 1000 * 60 * 5, // 5 minutes
});

export function usePortfolioContent() {
  return useQuery(portfolioContentQuery);
}

export function useProjects() {
  const query = usePortfolioContent();
  return {
    ...query,
    data: query.data?.projects
      ? [...query.data.projects].sort((a, b) => a.sort_order - b.sort_order)
      : [],
  };
}

export function useProject(slug: string) {
  const query = usePortfolioContent();
  return {
    ...query,
    data: query.data?.projects?.find((p) => p.slug === slug) ?? null,
  };
}
