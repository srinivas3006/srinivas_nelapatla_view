import { useEffect, useState } from "react";
import { AnimatePresence, motion, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { SPRING } from "@/lib/motion";
import { pointer } from "@/lib/pointer";

type Mode = "default" | "link" | "view" | "text";

const INTERACTIVE = "a, button, [role='button'], label, summary, select";
const TEXT_INPUT =
  "input:not([type='checkbox']):not([type='radio']), textarea, [contenteditable='true']";

/**
 * Dot that sits exactly on the pointer plus a ring that trails it. The ring
 * grows over links/buttons and turns into a "View" badge over elements marked
 * `data-cursor="view"`. Mounted only for fine pointers (see MotionProvider).
 */
export function Cursor() {
  const [mode, setMode] = useState<Mode>("default");
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const ringX = useSpring(pointer.x, { stiffness: 350, damping: 32, mass: 0.4 });
  const ringY = useSpring(pointer.y, { stiffness: 350, damping: 32, mass: 0.4 });
  const dotX = useSpring(pointer.x, SPRING.cursor);
  const dotY = useSpring(pointer.y, SPRING.cursor);

  useEffect(() => {
    document.documentElement.classList.add("has-custom-cursor");

    const onOver = (e: Event) => {
      const el = e.target as Element | null;
      if (!el?.closest) return;
      if (el.closest("[data-cursor='view']")) setMode("view");
      else if (el.closest(TEXT_INPUT)) setMode("text");
      else if (el.closest(INTERACTIVE)) setMode("link");
      else setMode("default");
    };
    const onMove = () => setVisible(true);
    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    document.addEventListener("pointerover", onOver);
    window.addEventListener("pointermove", onMove, { passive: true, once: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.documentElement.addEventListener("pointerenter", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.removeEventListener("pointerenter", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const ringSize = mode === "view" ? 84 : mode === "link" ? 52 : 34;
  const show = visible && mode !== "text";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <motion.div style={{ x: ringX, y: ringY }} className="absolute left-0 top-0">
        <motion.div
          animate={{
            width: ringSize,
            height: ringSize,
            opacity: show ? 1 : 0,
            scale: pressed ? 0.85 : 1,
            backgroundColor:
              mode === "view"
                ? "var(--primary)"
                : mode === "link"
                  ? "color-mix(in oklab, var(--primary) 12%, transparent)"
                  : "color-mix(in oklab, var(--primary) 0%, transparent)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/60"
        >
          <AnimatePresence>
            {mode === "view" && (
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="flex items-center gap-0.5 text-[11px] font-medium text-primary-foreground"
              >
                View <ArrowUpRight className="h-3 w-3" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <motion.div style={{ x: dotX, y: dotY }} className="absolute left-0 top-0">
        <motion.div
          animate={{ opacity: show && mode === "default" ? 1 : 0, scale: pressed ? 0.6 : 1 }}
          transition={{ duration: 0.15 }}
          className="h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
        />
      </motion.div>
    </div>
  );
}
