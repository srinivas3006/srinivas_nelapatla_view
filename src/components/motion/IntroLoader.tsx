import plutoRun from "@/assets/pluto-run.webp";
import { INTRO_DONE_MS, INTRO_KEY } from "@/lib/intro";

// Runs during HTML parsing, before first paint: marks <html data-intro> so CSS
// shows the loader (and delays hero entrances) only on a fresh first visit —
// not on repeat visits in the session, nor for reduced motion.
const decideIntro = `try{var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches||sessionStorage.getItem("${INTRO_KEY}")){d.dataset.intro="skip"}else{sessionStorage.setItem("${INTRO_KEY}","1");d.dataset.intro="playing";setTimeout(function(){d.dataset.intro="done"},${INTRO_DONE_MS})}}catch(e){document.documentElement.dataset.intro="skip"}`;

/** First-visit intro: Pluto runs across and the name is revealed behind him. */
export function IntroLoader({ name }: { name: string }) {
  const [first, ...rest] = name.split(" ");
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: decideIntro }} />
      <div
        aria-hidden
        className="intro fixed inset-0 z-[200] flex items-center justify-center bg-background"
      >
        <div className="relative px-6">
          <p className="intro-name font-display text-4xl tracking-tight sm:text-6xl">
            {first} <em className="italic text-primary">{rest.join(" ")}</em>
          </p>
          {/* Track spans the name; it slides by its own width (transform only). */}
          <div className="intro-runner absolute inset-x-6 -top-16 h-16 sm:-top-20 sm:h-20">
            <img
              src={plutoRun}
              alt=""
              width={60}
              height={80}
              className="animate-hop absolute left-0 top-0 h-16 w-auto -translate-x-1/2 sm:h-20"
            />
          </div>
          <div className="intro-line mt-4 h-[2px] origin-left rounded-full bg-primary" />
        </div>
      </div>
    </>
  );
}
