import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Every navigation animates through the View Transitions API (root
    // cross-fade + shared project images; styles in styles.css).
    defaultViewTransition: true,
    defaultPreloadStaleTime: 0,
    // Ship the query cache filled by route loaders during SSR to the browser,
    // so the first client render matches the server HTML (real CMS content,
    // not defaults) and nothing is refetched on load. Sent as a JSON string:
    // the cache only holds plain JSON content, which the router's serializer
    // types can't prove about DehydratedState.
    dehydrate: () => ({ queryClientState: JSON.stringify(dehydrate(queryClient)) }),
    hydrate: (dehydrated) => {
      hydrate(queryClient, JSON.parse(dehydrated.queryClientState));
    },
  });

  return router;
};
