import { PAGE_CACHE_HEADERS } from "@/lib/page-cache";
import { pageMeta, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site";
import { useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ScrollPath } from "@/components/motion/ScrollPath";
import { IntroLoader } from "@/components/motion/IntroLoader";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";
import { PlutoWidget } from "@/components/pluto/PlutoWidget";
import { MobilePluto } from "@/components/pluto/MobilePluto";
import { DecorLeaves } from "@/components/sections/DecorLeaves";
import { Nav } from "@/components/sections/Nav";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { Stories } from "@/components/sections/Stories";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { SECTION_IDS } from "@/components/sections/nav-links";
import { useActiveSection } from "@/hooks/useActiveSection";
import { portfolioContentQuery, usePortfolioContent, useProjects } from "@/lib/use-portfolio";
import { DEFAULTS, type PortfolioContent } from "@/lib/portfolio-content";

export const Route = createFileRoute("/")({
  head: () => pageMeta({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/" }),
  // Prefetch CMS content so SSR renders it (see dehydrate/hydrate in router.tsx).
  loader: ({ context }) => context.queryClient.ensureQueryData(portfolioContentQuery),
  headers: () => PAGE_CACHE_HEADERS,
  component: Portfolio,
});

function Portfolio() {
  const active = useActiveSection(SECTION_IDS);
  const { data: content } = usePortfolioContent();
  const { data: projects } = useProjects();
  const c: PortfolioContent = content ?? DEFAULTS;
  const rootRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  // `isolate` lets the path sit behind content (z -10) without dropping behind
  // the page background; `overflow-x-clip` (not hidden) keeps sticky working.
  return (
    <div
      ref={rootRef}
      className="grain relative isolate min-h-screen overflow-x-clip bg-background text-foreground"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <IntroLoader name="Srinivas Nelapatla" />
      <DecorLeaves />
      {isDesktop && <ScrollPath containerRef={rootRef} />}
      <Nav active={active} />
      <main id="main">
        <Hero hero={c.hero} />
        <About about={c.about} />
        <Skills skills={c.skills} />
        <Projects projects={projects ?? []} />
        <Experience journey={c.journey} />
        <Stories stories={c.stories} />
        <Contact contact={c.contact} />
      </main>
      <Footer contact={c.contact} />
      <MobilePluto active={active} hints={c.hints} />
      <PlutoWidget />
    </div>
  );
}
