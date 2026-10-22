import { motionValue, springValue, useReducedMotion, useTransform } from "motion/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SPRING } from "./motion";

// One global pointer listener feeding motion values. Components read these
// directly (style={{ x }}) so cursor-driven effects never re-render React.
export const pointer = {
  /** Viewport position in px. */
  x: motionValue(0),
  y: motionValue(0),
  /** Position relative to viewport centre, -1 (left/top) .. 1 (right/bottom). */
  nx: motionValue(0),
  ny: motionValue(0),
};

/** Spring-smoothed normalized pointer, shared by all parallax consumers. */
export const smoothPointer = {
  nx: springValue(pointer.nx, SPRING.soft),
  ny: springValue(pointer.ny, SPRING.soft),
};

export function startPointerTracking() {
  const onMove = (e: PointerEvent) => {
    pointer.x.set(e.clientX);
    pointer.y.set(e.clientY);
    pointer.nx.set((e.clientX / window.innerWidth) * 2 - 1);
    pointer.ny.set((e.clientY / window.innerHeight) * 2 - 1);
  };
  // Drift back to centre when the pointer leaves the window.
  const onLeave = () => {
    pointer.nx.set(0);
    pointer.ny.set(0);
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  return () => {
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
  };
}

/**
 * Offset that follows the smoothed pointer: `depth` px at the viewport edge,
 * 0 at the centre. Negative depth moves against the pointer (background layers).
 * Static on touch devices and for reduced motion.
 */
export function useParallax(depth: number) {
  const finePointer = useFinePointer();
  const reduceMotion = useReducedMotion();
  const enabled = finePointer && !reduceMotion;
  const x = useTransform(smoothPointer.nx, (v) => (enabled ? v * depth : 0));
  const y = useTransform(smoothPointer.ny, (v) => (enabled ? v * depth : 0));
  return { x, y };
}

/** True on mouse/trackpad devices — gate cursor-only effects with this. */
export function useFinePointer() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
