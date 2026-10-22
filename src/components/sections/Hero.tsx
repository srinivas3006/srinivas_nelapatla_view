import { useRef, type CSSProperties } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "motion/react";
import { ArrowRight, MousePointer2, Rocket } from "lucide-react";
import { Magnetic } from "@/components/motion/Interactive";
import { useParallax } from "@/lib/pointer";
import { PlutoInlineGreeting } from "@/components/pluto/PlutoInlineGreeting";
import defaultSrinivas from "@/assets/srinivas.webp";
import type { PortfolioContent } from "@/lib/portfolio-content";

/** Entrance delay for a `.hero-in` element (see styles.css). */
const enter = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

// Hero entrances are CSS animations, not JS: they start at first paint instead
// of after hydration (fast LCP), and wait for the intro curtain on first visit.
export function Hero({ hero }: { hero: PortfolioContent["hero"] }) {
  const img = hero.imageUrl || defaultSrinivas;
  const backdrop = useParallax(-22);
  const portrait = useParallax(9);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef);

  return (
    <section
      id="home"
      ref={sectionRef}
      data-offscreen={inView ? undefined : ""}
      className="relative pt-28 pb-16 sm:pt-32 sm:pb-20"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative">
          <p
            style={enter(0)}
            className="hero-in hero-rise mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {hero.eyebrow}
          </p>
          <SplitHeadline hero={hero} />
          <p
            style={enter(0.5)}
            className="hero-in hero-rise mt-6 max-w-md text-base text-foreground/70"
          >
            {hero.subhead}
          </p>
          <div
            style={enter(0.6)}
            className="hero-in hero-rise mt-8 flex flex-wrap items-center gap-4"
          >
            <Magnetic strength={0.35}>
              <a
                href={hero.primaryCta.href}
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-soft transition-shadow hover:shadow-lift"
              >
                {hero.primaryCta.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Magnetic>
          </div>
          <PlutoInlineGreeting />
          <div className="mt-16 hidden flex-col items-center gap-2 text-xs text-muted-foreground sm:flex">
            <MousePointer2 className="h-4 w-4 animate-bounce" />
            Scroll to explore
          </div>
        </div>

        <div className="relative">
          <div
            data-path-start
            style={enter(0)}
            className="hero-in hero-pop relative mx-auto aspect-[4/5] w-full max-w-md"
          >
            {/* Depth layers: the backdrop drifts against the cursor, the
                portrait gently with it. */}
            <motion.div
              style={{ x: backdrop.x, y: backdrop.y }}
              className="animate-blob absolute inset-0 rounded-[50%_50%_45%_45%/55%_55%_45%_45%] bg-gradient-to-b from-accent/40 to-primary/20"
            />
            <motion.img
              src={img}
              alt="Srinivas Nelapatla"
              width={863}
              height={1200}
              fetchPriority="high"
              style={{ x: portrait.x, y: portrait.y }}
              className="relative h-full w-full object-contain object-bottom"
            />
          </div>
        </div>
      </div>

      {hero.exploring.length > 0 && <LearningTicker items={hero.exploring} />}
    </section>
  );
}

type Word = { text: string; italic?: boolean };

/** Headline whose words rise out of a mask one after another. */
function SplitHeadline({ hero }: { hero: PortfolioContent["hero"] }) {
  const words = (text: string, italic = false): Word[] =>
    text
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => ({ text: t, italic }));

  const lines: Word[][] = [
    [...words(hero.headlinePrefix), ...words(hero.italicWords[0], true)],
    [...words(hero.italicWords[1], true), { text: "&" }],
    words(hero.italicWords[2], true),
    words(hero.headlineSuffix),
  ];
  const fullText = lines.map((line) => line.map((w) => w.text).join(" ")).join(" ");

  let index = 0;
  return (
    <h1
      aria-label={fullText}
      className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
    >
      {lines.map((line, li) => (
        <span key={li} aria-hidden className="block">
          {line.map((w) => {
            const i = index++;
            return (
              // Padding/negative margin keeps italic overhangs and descenders
              // from being clipped by the mask.
              <span
                key={i}
                className="-mb-[0.15em] mr-[0.14em] inline-block overflow-hidden pb-[0.15em] pr-[0.06em] align-bottom last:mr-0"
              >
                <span
                  style={enter(0.1 + i * 0.06)}
                  className={`hero-in hero-word inline-block ${w.italic ? "italic text-primary" : ""}`}
                >
                  {w.text}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

/** Ticker drifts on its own, speeds up with scroll velocity and leans into it. */
function LearningTicker({ items }: { items: string[] }) {
  // Repeat short lists so one half always overflows the track, then render two
  // identical halves and wrap x within -50%..0 for a seamless loop.
  const half = Array.from({ length: Math.max(2, Math.ceil(8 / items.length)) }, () => items).flat();
  const baseSpeed = 100 / (half.length * 6); // % of the track per second

  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-2000, 0, 2000], [-5, 0, 5], { clamp: false });
  const skewX = useTransform(velocity, [-2000, 2000], [8, -8], { clamp: true });

  const offset = useMotionValue(0);
  const x = useTransform(offset, (v) => `${wrap(-50, 0, v)}%`);
  const direction = useRef(1);
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  useAnimationFrame((_, delta) => {
    // No per-frame work while scrolled away or for reduced motion.
    if (reduceMotion || !inView) return;
    const b = boost.get();
    if (b < -0.05) direction.current = -1;
    else if (b > 0.05) direction.current = 1;
    const speed = baseSpeed * direction.current * (1 + Math.abs(b));
    offset.set(offset.get() - (speed * delta) / 1000);
  });

  return (
    <div
      ref={ref}
      className="mt-20 w-full overflow-hidden border-y border-primary/10 bg-primary/5 py-3 sm:mt-24 sm:py-4"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6">
        <span className="hidden shrink-0 text-xs font-semibold uppercase tracking-widest text-primary sm:block">
          Currently Learning:
        </span>
        <div className="relative flex flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <motion.div style={{ x, skewX }} className="flex shrink-0 items-center">
            {[...half, ...half].map((item, idx) => (
              <div key={idx} className="flex shrink-0 items-center gap-3 pr-12 sm:pr-24">
                <Rocket className="h-4 w-4 text-primary" />
                <span className="font-display text-lg tracking-wide">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
