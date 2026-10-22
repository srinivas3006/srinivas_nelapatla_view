import { Leaf } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { Spotlight, TiltCard } from "@/components/motion/Interactive";
import { getIcon } from "@/lib/icon-map";
import type { PortfolioContent } from "@/lib/portfolio-content";

export function About({ about }: { about: PortfolioContent["about"] }) {
  return (
    <section id="about" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Spotlight className="grid gap-10 rounded-[2rem] bg-card/70 p-8 shadow-soft ring-1 ring-border/50 lg:grid-cols-[1fr_1.2fr_1fr] lg:p-12">
          <div className="space-y-4">
            {about.cards.map((c, i) => {
              const Icon = getIcon(c.icon);
              return (
                <Reveal key={c.title + i} delay={i * 0.08}>
                  <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-background/70 p-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-display text-base">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.sub}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="relative">
            <Reveal>
              <h2 className="font-display text-4xl tracking-tight sm:text-5xl">
                {about.heading} <em className="italic text-primary">{about.italicWord}</em> me.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-foreground/80">
                {about.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <TiltCard className="rounded-3xl">
              <div className="relative overflow-hidden rounded-3xl bg-primary p-7 text-primary-foreground shadow-lift">
                <div className="grid grid-cols-3 gap-3 text-center">
                  {about.stats.map((s) => (
                    <div key={s.l}>
                      <p className="font-display text-3xl tabular-nums">
                        <CountUp value={s.n} />
                      </p>
                      <p className="mt-2 text-[10px] uppercase tracking-wider opacity-80">{s.l}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 border-t border-primary-foreground/20 pt-5">
                  <p className="whitespace-pre-line font-display text-lg italic leading-snug">
                    "{about.quote}"
                  </p>
                  <p className="mt-3 text-right font-display text-sm italic opacity-80">
                    — {about.quoteAuthor}
                  </p>
                </div>
                <Leaf className="absolute -right-2 -bottom-2 h-24 w-24 rotate-12 text-primary-foreground/10" />
              </div>
            </TiltCard>
          </Reveal>
        </Spotlight>
      </div>
    </section>
  );
}
