import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * Counts the leading number in `value` up from 0 the first time it scrolls
 * into view, keeping any prefix/suffix ("10+" -> 0+ ... 10+). Values without a
 * number render as-is.
 */
export function CountUp({ value, duration = 1.6 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();
  const match = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);

  useEffect(() => {
    const el = ref.current;
    if (!el || !match || !inView || reduceMotion) return;
    const [, prefix, num, suffix] = match;
    const decimals = num.split(".")[1]?.length ?? 0;
    const controls = animate(0, Number(num), {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduceMotion, value, duration]);

  // SSR and no-JS render the final value; the effect rewinds it to 0 on entry.
  return <span ref={ref}>{value}</span>;
}
