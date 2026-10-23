import { useSyncExternalStore } from "react";

// Light/dark theme: the .dark class on <html>, set before first paint by
// THEME_SCRIPT (from localStorage, else the OS preference) and toggled here.

const STORAGE_KEY = "theme";

/** Inline <head> script: applies the saved/OS theme before the page paints. */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}})()`;

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");

/** True while the dark theme is active (false during SSR). */
export function useIsDark() {
  return useSyncExternalStore(subscribe, isDark, () => false);
}

export function toggleTheme() {
  const dark = !isDark();
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    // Private mode etc.: the choice just won't persist.
  }
}
