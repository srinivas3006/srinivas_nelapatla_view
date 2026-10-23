import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import plutoRun from "@/assets/pluto-run.webp";
import plutoSit from "@/assets/pluto-sit.webp";
import { SECTION_IDS } from "@/components/sections/nav-links";
import { SPRING } from "@/lib/motion";
import { pointer, useFinePointer } from "@/lib/pointer";
import { useIsDark } from "@/lib/theme";

type Point = { x: number; y: number };
type Geometry = { width: number; height: number; d: string };
type Lookup = { ys: number[]; ls: number[]; total: number };

const CONTENT_MAX_WIDTH = 1280; // max-w-7xl
/** The drawn tip of the path tracks this fraction of the viewport height. */
const TIP_VIEWPORT_RATIO = 0.6;

/**
 * Lay a path through the page: it starts beside the hero portrait
 * ([data-path-start]), runs down the side gutters, swoops across the empty gap
 * between each pair of sections, and ends beside [data-path-end].
 */
function measureGeometry(container: HTMLElement): Geometry | null {
  const base = container.getBoundingClientRect();
  const rel = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { top: r.top - base.top, bottom: r.bottom - base.top, right: r.right - base.left };
  };

  const start = container.querySelector("[data-path-start]");
  const end = container.querySelector("[data-path-end]");
  // Content box of each section (border box minus padding). Measuring the
  // section itself rather than its children keeps sticky/pinned content from
  // shifting the result with the current scroll position.
  const blocks = SECTION_IDS.flatMap((id) => {
    const section = document.getElementById(id);
    if (!section) return [];
    const box = rel(section);
    const style = getComputedStyle(section);
    return [
      {
        top: box.top + parseFloat(style.paddingTop),
        bottom: box.bottom - parseFloat(style.paddingBottom),
      },
    ];
  });
  if (!start || !end || blocks.length < 2) return null;

  const gutter = Math.max(16, (base.width - CONTENT_MAX_WIDTH) / 2 - 12);
  const sideX = (right: boolean) => (right ? base.width - gutter : gutter);

  const s = rel(start);
  const points: Point[] = [{ x: s.right - 24, y: s.bottom - 24 }];
  let onRight = true;
  for (let i = 0; i < blocks.length - 1; i++) {
    const top = blocks[i].bottom;
    const gap = blocks[i + 1].top - top;
    if (gap <= 0) continue;
    points.push({ x: sideX(onRight), y: top + gap * 0.25 });
    onRight = !onRight;
    points.push({ x: sideX(onRight), y: top + gap * 0.75 });
  }
  const e = rel(end);
  const last = points[points.length - 1];
  points.push({
    x: Math.min(sideX(true), e.right + 72),
    y: Math.max(last.y + 40, e.top + 80),
  });

  // Cubic segments with vertical tangents: straight runs down the gutters,
  // smooth S-curves across the gaps, and y never decreases along the path.
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const midY = (a.y + b.y) / 2;
    d += ` C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`;
  }
  return { width: base.width, height: base.height, d };
}

/** Path length at which the path reaches page height `y` (binary search). */
function lengthAtY({ ys, ls }: Lookup, y: number) {
  if (!ys.length) return 0;
  if (y <= ys[0]) return ls[0];
  if (y >= ys[ys.length - 1]) return ls[ls.length - 1];
  let lo = 0;
  let hi = ys.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (ys[mid] <= y) lo = mid;
    else hi = mid;
  }
  const t = (y - ys[lo]) / (ys[hi] - ys[lo]);
  return ls[lo] + t * (ls[hi] - ls[lo]);
}

export function ScrollPath({ containerRef }: { containerRef: RefObject<HTMLElement | null> }) {
  const reduceMotion = useReducedMotion();
  const [geo, setGeo] = useState<Geometry | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const lookup = useRef<Lookup>({ ys: [], ls: [], total: 0 });

  const { scrollY } = useScroll();
  const target = useMotionValue(0);
  const drawn = useSpring(target, {
    stiffness: 70,
    damping: 20,
    mass: 0.6,
    // Stop within half a pixel instead of creeping for seconds.
    restDelta: 0.5,
    restSpeed: 4,
  });
  const progress = useTransform(() =>
    lookup.current.total ? drawn.get() / lookup.current.total : 0,
  );

  // Pluto's position, lean and running/sitting state.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const lean = useSpring(0, { stiffness: 200, damping: 18 });
  const [running, setRunning] = useState(false);
  const runningRef = useRef(false);
  const lastLength = useRef(0);
  const idleTimer = useRef<number | undefined>(undefined);
  const placing = useRef(false);

  const updateTarget = useCallback(() => {
    target.set(lengthAtY(lookup.current, window.scrollY + window.innerHeight * TIP_VIEWPORT_RATIO));
  }, [target]);

  const placePluto = useCallback(
    (l: number) => {
      const path = pathRef.current;
      if (!path) return null;
      const p = path.getPointAtLength(l);
      px.set(p.x);
      py.set(p.y);
      return p;
    },
    [px, py],
  );

  // Re-measure whenever the page's size changes (images, fonts, CMS content).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Debounced: while the page settles (images, fonts, content) resizes come
    // in bursts, and each measure + lookup rebuild forces layout.
    let timer = 0;
    const run = () => {
      const next = measureGeometry(container);
      setGeo((prev) => (prev?.d === next?.d ? prev : next));
    };
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(run, 150);
    };
    const ro = new ResizeObserver(schedule);
    ro.observe(container);
    window.addEventListener("load", schedule);
    document.fonts?.ready.then(schedule);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", schedule);
      window.clearTimeout(timer);
    };
  }, [containerRef]);

  // Rebuild the y -> length lookup for the new path, then snap into place
  // without the spring so a reload mid-page doesn't replay the whole path.
  useEffect(() => {
    const path = pathRef.current;
    if (!geo || !path) return;
    const total = path.getTotalLength();
    const ys: number[] = [];
    const ls: number[] = [];
    for (let l = 0; l <= total + 24; l += 24) {
      const p = path.getPointAtLength(Math.min(l, total));
      if (!ys.length || p.y > ys[ys.length - 1]) {
        ys.push(p.y);
        ls.push(Math.min(l, total));
      }
    }
    lookup.current = { ys, ls, total };
    updateTarget();
    placing.current = true;
    drawn.jump(target.get());
    placing.current = false;
    // jump() doesn't emit when the value is unchanged (e.g. loading at the
    // top), so position Pluto explicitly.
    placePluto(drawn.get());
  }, [geo, drawn, target, updateTarget, placePluto]);

  useMotionValueEvent(scrollY, "change", updateTarget);

  useMotionValueEvent(drawn, "change", (l) => {
    const path = pathRef.current;
    const p = placePluto(l);
    if (!path || !p) return;
    const step = l - lastLength.current;
    const direction = Math.sign(step) || 1;
    lastLength.current = l;
    // Sub-pixel spring tail is not "running".
    if (placing.current || Math.abs(step) < 0.5) return;

    // Lean into the direction of travel, whichever way the visitor scrolls.
    const ahead = path.getPointAtLength(Math.min(l + 6, lookup.current.total));
    lean.set(Math.max(-14, Math.min(14, (ahead.x - p.x) * 3 * direction)));

    if (!runningRef.current) {
      runningRef.current = true;
      setRunning(true);
    }
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      runningRef.current = false;
      setRunning(false);
      lean.set(0);
    }, 260);
  });

  useEffect(() => () => window.clearTimeout(idleTimer.current), []);

  // Pluto watches the cursor: his head tilts toward it, and he perks up and
  // says hi when it comes close. Pluto's feet are at (px, py) in page space.
  const finePointer = useFinePointer();
  const dark = useIsDark();
  const gaze = useSpring(0, SPRING.soft);
  const [near, setNear] = useState(false);
  const nearRef = useRef(false);
  const watchCursor = () => {
    if (!finePointer) return;
    const dx = pointer.x.get() - px.get();
    const dy = pointer.y.get() - (py.get() - window.scrollY - 42);
    gaze.set(Math.max(-12, Math.min(12, dx / 40)));
    const isNear = Math.hypot(dx, dy) < 130;
    if (isNear !== nearRef.current) {
      nearRef.current = isNear;
      setNear(isNear);
    }
  };
  useMotionValueEvent(pointer.x, "change", watchCursor);
  useMotionValueEvent(pointer.y, "change", watchCursor);
  useMotionValueEvent(py, "change", watchCursor);

  if (!geo) return null;

  const dashed = {
    d: geo.d,
    fill: "none",
    stroke: "var(--color-primary)",
    strokeWidth: 2,
    strokeDasharray: "2 10",
    strokeLinecap: "round" as const,
  };

  return (
    <>
      <svg
        aria-hidden
        width={geo.width}
        height={geo.height}
        viewBox={`0 0 ${geo.width} ${geo.height}`}
        className="pointer-events-none absolute left-0 top-0 -z-10"
      >
        <defs>
          <mask id="scroll-path-mask" maskUnits="userSpaceOnUse">
            <motion.path
              d={geo.d}
              fill="none"
              stroke="white"
              strokeWidth={8}
              style={{ pathLength: reduceMotion ? 1 : progress }}
            />
          </mask>
        </defs>
        {/* Faint full route, with the travelled part drawn darker on top. */}
        <path ref={pathRef} {...dashed} strokeOpacity={0.14} />
        <path {...dashed} strokeOpacity={0.6} mask="url(#scroll-path-mask)" />
      </svg>

      {!reduceMotion && (
        <motion.div
          aria-hidden
          style={{ x: px, y: py }}
          className="pointer-events-none absolute left-0 top-0 z-20"
        >
          <motion.div
            style={{ rotate: lean }}
            className="relative -translate-x-1/2 -translate-y-full origin-bottom"
          >
            <div className={`relative ${running ? "animate-hop" : ""}`}>
              <img
                src={plutoRun}
                width={63}
                height={84}
                alt=""
                className={`absolute left-1/2 top-0 h-[84px] w-auto max-w-none -translate-x-1/2 transition-opacity duration-150 ${running ? "opacity-100" : "opacity-0"}`}
              />
              {/* Idle life while sitting: breathing plus an occasional curious
                  head tilt (paused while the cursor is close). */}
              <div className={`origin-bottom ${running ? "" : "animate-breathe"}`}>
                <div
                  className={`origin-bottom ${running || near || dark ? "" : "animate-curious"}`}
                >
                  <motion.img
                    src={plutoSit}
                    width={54}
                    height={84}
                    alt=""
                    style={{ rotate: gaze }}
                    animate={near && !running ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className={`h-[84px] w-auto origin-bottom transition-opacity duration-150 ${running ? "opacity-0" : "opacity-100"}`}
                  />
                </div>
              </div>
            </div>
            <AnimatePresence>
              {near && !running && (
                <motion.span
                  initial={{ opacity: 0, y: 6, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.8 }}
                  className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-card px-3 py-1 font-display text-xs text-foreground shadow-soft ring-1 ring-border/60"
                >
                  Woof! 🐾
                </motion.span>
              )}
              {/* Night mode: Pluto naps while sitting, until the cursor wakes him. */}
              {dark && !running && !near && (
                <motion.span
                  key="zzz"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute -top-8 left-[62%] flex gap-0.5 font-display text-sm font-semibold text-primary"
                >
                  {["z", "z", "Z"].map((z, i) => (
                    <motion.span
                      key={i}
                      animate={{ y: [0, -10, -16], opacity: [0, 1, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6 }}
                      style={{ fontSize: 10 + i * 3 }}
                    >
                      {z}
                    </motion.span>
                  ))}
                </motion.span>
              )}
            </AnimatePresence>
            <div className="mx-auto -mt-1.5 h-2 w-12 rounded-[50%] bg-foreground/15 blur-[2px]" />
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
