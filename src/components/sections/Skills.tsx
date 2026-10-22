import { motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";
import { Reveal } from "@/components/Reveal";
import { TiltCard } from "@/components/motion/Interactive";
import { getIcon } from "@/lib/icon-map";
import type { PortfolioContent } from "@/lib/portfolio-content";

export function Skills({ skills }: { skills: PortfolioContent["skills"] }) {
  return (
    <section id="skills" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">✦ What I do best</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
            My <em className="italic text-primary">Skills</em>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {skills.map((s, i) => {
            const Icon = getIcon(s.icon);
            return (
              <Reveal key={s.title + i} delay={i * 0.06}>
                <TiltCard className="h-full rounded-2xl">
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="h-full rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <h3 className="font-display text-base">{s.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {s.items.map((it) => (
                        <li key={it.name}>
                          <div className="flex items-center justify-between text-xs text-foreground/75">
                            <span>{it.name}</span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${it.level}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, ease: EASE_OUT }}
                              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
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
