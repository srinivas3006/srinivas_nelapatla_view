import { useEffect, useState } from "react";

// Returns the id of the section currently crossing ~45% of the viewport height.
export function useActiveSection(sectionIds: string[]) {
  const [id, setId] = useState(sectionIds[0]);

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      const line = window.innerHeight * 0.45;
      let current = sectionIds[0];
      for (const sid of sectionIds) {
        const el = document.getElementById(sid);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > line * 0.5) current = sid;
      }
      setId((prev) => (prev === current ? prev : current));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sectionIds]);

  return id;
}
