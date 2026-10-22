import { motion } from "motion/react";
import { Reveal } from "@/components/Reveal";
import { TiltCard } from "@/components/motion/Interactive";
import { getIcon } from "@/lib/icon-map";
import type { PortfolioContent } from "@/lib/portfolio-content";

export function Stories({ stories }: { stories: PortfolioContent["stories"] }) {
  return (
    <section id="stories" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">✦ Exploring</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
            What I'm <em className="italic text-primary">learning</em> next.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {stories.map((e, i) => {
            const Icon = getIcon(e.icon);
            return (
              <Reveal key={e.title + i} delay={i * 0.08}>
                <TiltCard className="h-full rounded-2xl">
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="h-full rounded-2xl border border-border bg-gradient-to-br from-card to-accent/10 p-7 shadow-soft"
                  >
                    <Icon className="mb-4 h-6 w-6 text-primary" />
                    <h3 className="font-display text-xl">{e.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.desc}</p>
                  </motion.div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
