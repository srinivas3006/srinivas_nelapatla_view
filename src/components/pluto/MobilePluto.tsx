import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import plutoSit from "@/assets/pluto-sit.webp";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";
import { usePluto } from "@/lib/use-pluto";
import type { SectionHints } from "@/lib/portfolio-content";

const HINT_MS = 4200;

/**
 * Phones/tablets don't get the scroll path, so Pluto peeks in from the
 * bottom-left instead: each time a new section comes into view he slides out
 * with that section's hint (editable in /admin → Pluto Hints). Tap to chat.
 */
export function MobilePluto({ active, hints }: { active: string; hints: SectionHints }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { isOpen, setIsOpen } = usePluto();
  const [hint, setHint] = useState<string | null>(null);
  const seen = useRef(new Set<string>());

  useEffect(() => {
    if (isDesktop || isOpen) return;
    // Each section's hint shows once per visit; the hero waits for the intro.
    if (seen.current.has(active)) return;
    const text = hints[active as keyof SectionHints];
    if (!text) return;
    const delay = active === "home" ? 2600 : 350;
    const show = window.setTimeout(() => {
      seen.current.add(active);
      setHint(text);
    }, delay);
    const hide = window.setTimeout(() => setHint(null), delay + HINT_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [active, hints, isDesktop, isOpen]);

  if (isDesktop) return null;

  const out = Boolean(hint) && !isOpen;

  return (
    <div className="pointer-events-none fixed bottom-5 left-0 z-40 flex items-end lg:hidden">
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Chat with Pluto"
        animate={{ x: out ? 12 : -30, rotate: out ? 0 : 18 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="pointer-events-auto relative h-16 w-14"
      >
        <img src={plutoSit} alt="" width={54} height={84} className="h-16 w-auto drop-shadow-md" />
      </motion.button>
      <AnimatePresence>
        {out && (
          <motion.p
            key={hint}
            role="status"
            initial={{ opacity: 0, x: -8, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8, scale: 0.9 }}
            className="mb-10 ml-4 max-w-[220px] rounded-2xl rounded-bl-sm bg-card px-3 py-2 font-display text-[13px] leading-snug text-foreground shadow-lift ring-1 ring-border/60"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
