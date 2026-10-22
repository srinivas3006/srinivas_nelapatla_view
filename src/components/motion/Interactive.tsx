import type { PointerEvent, ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useFinePointer } from "@/lib/pointer";

// Cursor-reactive wrappers. All of them do nothing for touch input and for
// visitors who prefer reduced motion.

function useMouseEffects() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  return fine && !reduce;
}

/** Pointer position inside an element as 0..1 fractions. */
function localPoint(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  return { px: (e.clientX - r.left) / r.width, py: (e.clientY - r.top) / r.height };
}

/** Pulls its child toward the cursor while hovered, springs back on leave. */
export function Magnetic({
  children,
  strength = 0.3,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const enabled = useMouseEffects();
  const x = useSpring(0, SPRING.snappy);
  const y = useSpring(0, SPRING.snappy);

  return (
    <motion.span
      style={{ x, y }}
      onPointerMove={(e) => {
        if (!enabled || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.span>
  );
}

/** 3D tilt toward the cursor with a soft light glare that follows it. */
export function TiltCard({
  children,
  className = "",
  max = 7,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const enabled = useMouseEffects();
  const rotateX = useSpring(0, SPRING.snappy);
  const rotateY = useSpring(0, SPRING.snappy);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glareOpacity = useSpring(0, SPRING.snappy);
  const background = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.45), transparent 55%)`;

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (!enabled || e.pointerType !== "mouse") return;
        const { px, py } = localPoint(e);
        rotateY.set((px - 0.5) * 2 * max);
        rotateX.set(-(py - 0.5) * 2 * max);
        gx.set(px * 100);
        gy.set(py * 100);
        glareOpacity.set(1);
      }}
      onPointerLeave={() => {
        rotateX.set(0);
        rotateY.set(0);
        glareOpacity.set(0);
      }}
      className={`relative ${className}`}
    >
      {children}
      {glare && enabled && (
        <motion.div
          aria-hidden
          style={{ background, opacity: glareOpacity }}
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] mix-blend-soft-light"
        />
      )}
    </motion.div>
  );
}

/** A soft glow that trails the cursor across a panel. */
export function Spotlight({
  children,
  className = "",
  color = "color-mix(in oklab, var(--primary) 14%, transparent)",
  size = 420,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  size?: number;
}) {
  const enabled = useMouseEffects();
  const mx = useSpring(0, SPRING.soft);
  const my = useSpring(0, SPRING.soft);
  const opacity = useSpring(0, SPRING.soft);
  const background = useMotionTemplate`radial-gradient(${size}px circle at ${mx}px ${my}px, ${color}, transparent 70%)`;

  return (
    <div
      onPointerMove={(e) => {
        if (!enabled || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
        opacity.set(1);
      }}
      onPointerLeave={() => opacity.set(0)}
      className={`relative ${className}`}
    >
      {enabled && (
        <motion.div
          aria-hidden
          style={{ background, opacity }}
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
        />
      )}
      {children}
    </div>
  );
}
