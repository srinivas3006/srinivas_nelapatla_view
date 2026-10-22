import { motion, type Variants } from "motion/react";
import { DURATION, EASE_OUT } from "@/lib/motion";
import type { ReactNode } from "react";

// The delay travels through `custom`: a transition defined on the variant
// overrides a `transition` prop, so a prop-level delay would be ignored.
const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE_OUT, delay },
  }),
};

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={variants}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
