import { motion, useScroll, useTransform } from "motion/react";
import { Leaf } from "lucide-react";
import { useParallax } from "@/lib/pointer";

type LeafConfig = {
  className: string;
  size: number;
  rotate: number;
  /** Cursor parallax depth in px (negative = moves against the cursor). */
  depth: number;
  /** Total scroll parallax travel in px over the whole page. */
  scroll: number;
  /** Duration of the ambient drift loop, in seconds. */
  drift: number;
  opacity: number;
};

const LEAVES: LeafConfig[] = [
  {
    className: "left-0 top-1/3",
    size: 96,
    rotate: -45,
    depth: 28,
    scroll: -120,
    drift: 11,
    opacity: 0.5,
  },
  {
    className: "right-2 bottom-10",
    size: 80,
    rotate: 45,
    depth: -16,
    scroll: -120,
    drift: 13,
    opacity: 0.5,
  },
  {
    className: "right-[8%] top-24",
    size: 44,
    rotate: 120,
    depth: 40,
    scroll: -260,
    drift: 9,
    opacity: 0.35,
  },
  {
    className: "left-[12%] bottom-1/4",
    size: 36,
    rotate: -110,
    depth: -34,
    scroll: -320,
    drift: 14,
    opacity: 0.3,
  },
  {
    className: "left-1/2 top-[60%]",
    size: 28,
    rotate: 200,
    depth: 52,
    scroll: -420,
    drift: 10,
    opacity: 0.25,
  },
];

export function DecorLeaves() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden md:block"
    >
      {LEAVES.map((leaf, i) => (
        <DriftingLeaf key={i} leaf={leaf} index={i} />
      ))}
    </div>
  );
}

function DriftingLeaf({ leaf, index }: { leaf: LeafConfig; index: number }) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, leaf.scroll]);
  const pointer = useParallax(leaf.depth);

  // Three layers so the transforms don't fight: scroll parallax, cursor
  // parallax, then a CSS drift loop.
  return (
    <motion.div style={{ y, opacity: leaf.opacity }} className={`absolute ${leaf.className}`}>
      <motion.div style={{ x: pointer.x, y: pointer.y }}>
        <div
          className="animate-leaf-drift"
          style={{ animationDuration: `${leaf.drift}s`, animationDelay: `${-index * 2.3}s` }}
        >
          <Leaf
            className="text-primary/15"
            style={{ width: leaf.size, height: leaf.size, rotate: `${leaf.rotate}deg` }}
            strokeWidth={1}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
