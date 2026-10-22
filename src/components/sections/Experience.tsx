import { useRef } from "react";
import { motion, useInView, useScroll, useSpring } from "motion/react";
import { Reveal } from "@/components/Reveal";
import { getIcon } from "@/lib/icon-map";
import type { JourneyItem, PortfolioContent } from "@/lib/portfolio-content";

// "Present"/"Always" sort first, otherwise by the latest year mentioned.
function parseYear(str: string) {
  const s = str.toLowerCase();
  if (s.includes("always") || s.includes("present")) return 9999;
  const matches = str.match(/\d{4}/g);
  return matches ? Math.max(...matches.map(Number)) : 0;
}

/** Fill line and lit nodes both track this point of the viewport. */
const FILL_LINE = 0.6;

export function Experience({ journey }: { journey: PortfolioContent["journey"] }) {
  const sortedJourney = [...journey].sort((a, b) => parseYear(b.year) - parseYear(a.year));
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: [`start ${FILL_LINE}`, `end ${FILL_LINE}`],
  });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });

  return (
    <section id="experience" className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">✦ My Journey</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
            Experience &amp; <em className="italic text-primary">Education</em>
          </h2>
        </Reveal>

        <div ref={listRef} className="relative mt-16 flex flex-col">
          {/* Track + scroll-driven fill, centred on the 56px nodes. */}
          <div className="absolute bottom-12 left-7 top-7 w-px -translate-x-1/2 bg-primary/15" />
          <motion.div
            style={{ scaleY: fill }}
            className="absolute bottom-12 left-7 top-7 w-[2px] origin-top -translate-x-1/2 rounded-full bg-gradient-to-b from-primary to-accent"
          />
          {sortedJourney.map((j, i) => (
            <TimelineItem key={j.title + i} item={j} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ item, delay }: { item: JourneyItem; delay: number }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const lit = useInView(nodeRef, { margin: `0px 0px -${(1 - FILL_LINE) * 100}% 0px` });
  const Icon = getIcon(item.icon);

  return (
    <Reveal delay={delay}>
      <div className="group relative flex gap-6 md:gap-8">
        <motion.div
          ref={nodeRef}
          animate={lit ? "lit" : "dim"}
          variants={{
            dim: { scale: 1, backgroundColor: "var(--card)", color: "var(--primary)" },
            lit: {
              scale: 1.08,
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            },
          }}
          whileHover={{ scale: 1.14 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-soft ring-2 ring-primary/30 group-hover:shadow-lift"
        >
          <Icon className="h-6 w-6" />
        </motion.div>
        <div className="flex-1 pb-12 pt-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
            {item.year}
          </p>
          <h3 className="font-display text-2xl">{item.title}</h3>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{item.body}</p>
        </div>
      </div>
    </Reveal>
  );
}
