import { responsiveImage } from "@/lib/image";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import { DURATION, EASE_OUT, projectMediaTransition } from "@/lib/motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { getLenis } from "@/lib/smooth-scroll";
import { TiltCard } from "@/components/motion/Interactive";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";
import { categoryLabel, type DbProject } from "@/lib/portfolio-content";

/** Below this many cards a pinned horizontal track has nothing to scroll. */
const HORIZONTAL_MIN_PROJECTS = 4;

export function Projects({ projects }: { projects: DbProject[] }) {
  const [filter, setFilter] = useState("all");
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const published = projects.filter((p) => p.is_published);

  // Filters come from the categories actually in use, so anything typed in the
  // admin panel gets its own tab.
  const categories = [...new Set(published.map((p) => p.category.trim().toLowerCase()))];
  const filters = ["all", ...categories];
  const visible = published.filter(
    (p) => filter === "all" || p.category.trim().toLowerCase() === filter,
  );

  const header = (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-primary">✦ Things I've built</p>
        <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
          Featured <em className="italic text-primary">Projects</em>
        </h2>
      </Reveal>
      {categories.length > 1 && (
        <Reveal delay={0.1}>
          <div className="flex flex-wrap gap-2 rounded-full bg-card p-1.5 shadow-soft ring-1 ring-border/60">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`relative rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${filter === f ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {filter === f && (
                  <motion.span
                    layoutId="project-filter-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-primary"
                  />
                )}
                <span className="relative">{f === "all" ? "All" : categoryLabel(f)}</span>
              </button>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );

  if (visible.length === 0) {
    return (
      <ProjectsShell>
        {header}
        <div className="mt-12 rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center">
          <p className="font-display text-lg">No projects yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Check back soon!</p>
        </div>
      </ProjectsShell>
    );
  }

  if (isDesktop && visible.length >= HORIZONTAL_MIN_PROJECTS) {
    return <HorizontalProjects header={header} projects={visible} />;
  }

  return (
    <ProjectsShell>
      {header}
      {/* Phones: swipeable snap carousel. sm and up: grid. */}
      <div className="-mx-6 mt-12 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {visible.map((p, i) => (
          <Reveal
            key={p.id}
            delay={i * 0.06}
            className="w-[80vw] max-w-sm shrink-0 snap-start sm:w-auto sm:max-w-none"
          >
            <ProjectCard project={p} />
          </Reveal>
        ))}
      </div>
    </ProjectsShell>
  );
}

function ProjectsShell({ children }: { children: ReactNode }) {
  return (
    <section id="work" className="py-24">
      <div className="mx-auto max-w-7xl px-6">{children}</div>
    </section>
  );
}

/**
 * The section pins to the viewport while vertical scroll drives the card track
 * sideways; the outer height is exactly the distance the track needs to travel.
 */
function HorizontalProjects({ header, projects }: { header: ReactNode; projects: DbProject[] }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const distanceMV = useMotionValue(0);

  useEffect(() => {
    const track = trackRef.current;
    const row = rowRef.current;
    if (!track || !row) return;
    // offsetWidth is layout width, unaffected by the row's own translateX.
    const measure = () => {
      const d = Math.max(0, row.offsetWidth - track.clientWidth);
      setDistance(d);
      distanceMV.set(d);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(row);
    measure();
    return () => ro.disconnect();
  }, [distanceMV, projects.length]);

  const { scrollYProgress } = useScroll({ target: outerRef, offset: ["start start", "end end"] });
  const x = useTransform(() => -scrollYProgress.get() * distanceMV.get());

  // Drag the row with the mouse: 1px of horizontal drag = 1px of page scroll,
  // since the section's extra height equals the track's travel distance.
  const drag = useRef<{ x: number; moved: number } | null>(null);
  const suppressClick = useRef(false);
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { x: e.clientX, moved: 0 };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    drag.current.x = e.clientX;
    drag.current.moved += Math.abs(dx);
    if (drag.current.moved < 5) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(window.scrollY - dx, { immediate: true });
    else window.scrollBy(0, -dx);
  };
  const endDrag = () => {
    // A real drag shouldn't also open the project under the pointer.
    suppressClick.current = (drag.current?.moved ?? 0) >= 5;
    drag.current = null;
  };

  return (
    <section
      id="work"
      ref={outerRef}
      className="relative"
      style={{ height: `calc(100vh + ${distance}px)` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden py-16">
        <div className="mx-auto w-full max-w-7xl px-6">{header}</div>
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onDragStart={(e) => e.preventDefault()}
          onClickCapture={(e) => {
            if (!suppressClick.current) return;
            suppressClick.current = false;
            e.preventDefault();
            e.stopPropagation();
          }}
          className="mt-12 cursor-grab select-none overflow-hidden active:cursor-grabbing"
        >
          <motion.div
            ref={rowRef}
            style={{ x }}
            className="flex w-max gap-6 px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
          >
            {projects.map((p) => (
              <div key={p.id} className="w-[22rem] shrink-0">
                <ProjectCard project={p} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project: p }: { project: DbProject }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const playPreview = (play: boolean) => {
    const v = videoRef.current;
    if (!v || reduceMotion) return;
    if (play) v.play().catch(() => {});
    else {
      v.pause();
      v.currentTime = 0;
    }
  };
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: p.slug }}
      preload="intent"
      viewTransition
      data-cursor="view"
      className="block h-full"
    >
      <TiltCard className="h-full rounded-2xl" max={5}>
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: DURATION.fast }}
          onMouseEnter={() => playPreview(true)}
          onMouseLeave={() => playPreview(false)}
          className="group h-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft hover:shadow-lift"
        >
          <div
            style={{ viewTransitionName: projectMediaTransition(p.slug) }}
            className="relative aspect-[4/3] overflow-hidden bg-secondary"
          >
            {p.image ? (
              <motion.img
                {...responsiveImage(
                  p.image,
                  [400, 640, 960],
                  "(min-width: 1024px) 22rem, (min-width: 640px) 50vw, 100vw",
                )}
                alt={p.title}
                loading="lazy"
                whileHover={{ scale: 1.06 }}
                transition={{ duration: DURATION.slow, ease: EASE_OUT }}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary/10 to-accent/20" />
            )}
            {/* Optional short clip that plays while the card is hovered. */}
            {p.video && (
              <video
                ref={videoRef}
                src={p.video}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            )}
          </div>
          <div className="p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-base">{p.title}</h3>
              <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-secondary-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
              View project <ArrowRight className="h-3 w-3" />
            </p>
          </div>
        </motion.div>
      </TiltCard>
    </Link>
  );
}
