import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { DURATION, EASE_OUT } from "@/lib/motion";
import { ArrowUpRight, Leaf, Menu, Moon, Sun, X } from "lucide-react";
import { toggleTheme, useIsDark } from "@/lib/theme";
import { Magnetic } from "@/components/motion/Interactive";
import { NAV_LINKS } from "./nav-links";

export function Nav({ active }: { active: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  // Tuck the bar away while reading downwards, bring it back on any upward scroll.
  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - lastY.current;
    lastY.current = y;
    if (Math.abs(delta) < 4) return;
    setHidden(delta > 0 && y > 120);
  });

  // Close the mobile menu when the viewport grows past the breakpoint.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setMenuOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="fixed left-0 right-0 top-0 z-50 h-[2px] origin-left bg-primary"
      />
      <motion.header
        animate={{ y: hidden && !menuOpen ? "-100%" : "0%" }}
        transition={{ duration: DURATION.fast, ease: EASE_OUT }}
        className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md transition-colors ${menuOpen ? "bg-background/95" : "bg-background/60"}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <a href="#home" className="flex items-center gap-2 font-display text-base">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <Leaf className="h-4 w-4 text-primary" />
            </span>
            <span>Srinivas Nelapatla</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                className={`relative transition-colors hover:text-foreground ${active === l.id ? "text-foreground" : ""}`}
              >
                {l.label}
                {active === l.id && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 right-0 mx-auto h-[2px] w-5 rounded-full bg-primary"
                  />
                )}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Magnetic className="hidden sm:inline-block">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                Let's Connect <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </Magnetic>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/70 text-foreground lg:hidden"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: DURATION.fast, ease: EASE_OUT }}
              className="overflow-hidden border-t border-border/60 lg:hidden"
            >
              <ul className="mx-auto flex max-w-7xl flex-col px-6 py-3">
                {NAV_LINKS.map((l, i) => (
                  <motion.li
                    key={l.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * i }}
                  >
                    <a
                      href={`#${l.id}`}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between py-3 font-display text-lg ${active === l.id ? "text-primary" : "text-foreground/80"}`}
                    >
                      {l.label}
                      {active === l.id && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}

function ThemeToggle() {
  const dark = useIsDark();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-card/70 text-foreground transition-colors hover:text-primary"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? "moon" : "sun"}
          initial={{ y: 14, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -14, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
