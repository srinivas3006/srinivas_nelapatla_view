import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { usePluto } from "../../lib/use-pluto";
import { PlutoChatFlow } from "./PlutoChatFlow";
import plutoSit from "@/assets/pluto-sit.webp";

const IDLE_NUDGE_MS = 30_000;
const NUDGE_VISIBLE_MS = 12_000;

export function PlutoWidget() {
  const { isOpen, setIsOpen, nudge, setNudge } = usePluto();
  const idleNudgeShown = useRef(false);

  // Nudge once if the visitor goes quiet (no scroll, pointer or keys) for a while.
  useEffect(() => {
    if (isOpen) return;
    let timer = 0;
    const reset = () => {
      window.clearTimeout(timer);
      if (idleNudgeShown.current) return;
      timer = window.setTimeout(() => {
        idleNudgeShown.current = true;
        setNudge("Need a hand? I can point you to the good stuff 🐾");
      }, IDLE_NUDGE_MS);
    };
    const events = ["scroll", "pointermove", "keydown", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [isOpen, setNudge]);

  // Bubbles fade on their own; opening the chat dismisses them.
  useEffect(() => {
    if (!nudge) return;
    if (isOpen) {
      setNudge(null);
      return;
    }
    const t = window.setTimeout(() => setNudge(null), NUDGE_VISIBLE_MS);
    return () => window.clearTimeout(t);
  }, [nudge, isOpen, setNudge]);

  const openFromNudge = () => {
    const message = nudge;
    setIsOpen(true);
    // Let the chat mount before it picks up the nudge as a message.
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("pluto:nudge", { detail: { message } }));
    }, 300);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="h-[450px] w-[350px] max-w-[calc(100vw-3rem)] origin-bottom-right"
          >
            <PlutoChatFlow onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && nudge && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="relative max-w-[250px] origin-bottom-right rounded-2xl bg-card py-3 pl-4 pr-8 shadow-lift ring-1 ring-border/60"
          >
            <button
              onClick={openFromNudge}
              className="text-left font-display text-[13px] leading-snug text-foreground"
            >
              {nudge}
            </button>
            <button
              onClick={() => setNudge(null)}
              aria-label="Dismiss"
              className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
            <span className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 bg-card" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.06, rotate: -4 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat with Pluto" : "Chat with Pluto"}
        className="relative flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lift ring-4 ring-background"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="pluto"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              className="block h-14 w-14 overflow-hidden rounded-full bg-card"
            >
              {/* Idle life: a slow breathe on the avatar. */}
              <img
                src={plutoSit}
                width={56}
                height={56}
                alt=""
                className="animate-breathe h-full w-full scale-[1.35] object-cover object-[50%_20%]"
              />
            </motion.span>
          )}
        </AnimatePresence>

        {!isOpen && (
          <span className="absolute right-0.5 top-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary ring-2 ring-background" />
          </span>
        )}
      </motion.button>
    </div>
  );
}
