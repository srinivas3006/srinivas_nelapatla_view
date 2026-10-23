import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import { Toaster } from "sonner";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { pageMeta, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/site";
import { THEME_SCRIPT } from "@/lib/theme";
import { analyticsScripts, useAnalyticsPageviews } from "@/lib/analytics";

const FONTS_CSS =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Inter:wght@300;400;500;600;700&display=swap";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: SITE_NAME },
      { name: "theme-color", content: "#457641" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      // Defaults; routes override them with their own pageMeta (lib/site.ts).
      ...pageMeta({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/" }).meta,
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preload", as: "style", href: FONTS_CSS },
    ],
    scripts: [
      ...analyticsScripts,
      // Apply the saved/OS colour theme before first paint (no light flash).
      { children: THEME_SCRIPT },
      // Netlify inserts an HTML comment (wrapped in newlines) into <head> on
      // free-tier sites. The stray whitespace text nodes make React's hydration
      // of the document fail (#418) and re-render the whole page. Drop comment
      // and whitespace-only nodes from <head> before React hydrates; the served
      // HTML is untouched.
      {
        children: `(function(){var h=document.head,n=h.firstChild;while(n){var x=n.nextSibling;if(n.nodeType===8||(n.nodeType===3&&!n.nodeValue.trim()))h.removeChild(n);n=x}})()`,
      },
      // Attach the font stylesheet without blocking first paint: text renders in
      // the fallback font and swaps in (display=swap), instead of waiting ~1s on
      // slow mobile connections.
      {
        children: `(function(){var l=document.createElement("link");l.rel="stylesheet";l.href=${JSON.stringify(FONTS_CSS)};document.head.appendChild(l)})()`,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: inline scripts set data-intro (IntroLoader) and the
    // .dark class (THEME_SCRIPT) on <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useAnalyticsPageviews();

  return (
    <QueryClientProvider client={queryClient}>
      <MotionProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </MotionProvider>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
