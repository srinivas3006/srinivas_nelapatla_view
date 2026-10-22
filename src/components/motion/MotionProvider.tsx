import { useEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { MotionConfig, cancelFrame, frame, useReducedMotion, type FrameData } from "motion/react";
import Lenis from "lenis";
import { startPointerTracking, useFinePointer } from "@/lib/pointer";
import { Cursor } from "./Cursor";
import { setLenis } from "@/lib/smooth-scroll";

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const finePointer = useFinePointer();
  const isAdmin = useRouterState({
    select: (s) => s.location.pathname.startsWith("/admin"),
  });

  useEffect(() => startPointerTracking(), []);

  // Smooth scrolling, driven by motion's frame loop so scroll-linked
  // animations and Lenis update in the same frame. Skipped for reduced motion
  // and in the admin panel, where native scrolling is more predictable.
  useEffect(() => {
    if (reduceMotion || isAdmin) return;

    const instance = new Lenis({ autoRaf: false, anchors: true, lerp: 0.1 });
    setLenis(instance);
    const update = (data: FrameData) => instance.raf(data.timestamp);
    frame.update(update, true);

    return () => {
      cancelFrame(update);
      instance.destroy();
      setLenis(null);
    };
  }, [reduceMotion, isAdmin]);

  // reducedMotion="user": motion disables transform/layout animations for
  // visitors who ask the OS for less motion (opacity fades still run).
  return (
    <MotionConfig reducedMotion="user">
      {children}
      {finePointer && !reduceMotion && !isAdmin && <Cursor />}
    </MotionConfig>
  );
}
