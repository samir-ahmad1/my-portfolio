"use client";

import { useEffect, useRef, useState } from "react";
import { InkTransition } from "./ink-transition/inkTransition";
import { applyTheme, getTheme, otherTheme } from "./ink-transition/theme";
// import { applyTheme, getTheme, otherTheme } from "@/lib/ink-transition/theme";
// import type { InkTransition } from "@/lib/ink-transition/inkTransition";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inkRef = useRef<InkTransition | null>(null);

  // use the saved choice, otherwise follow the system setting (unchanged)
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("theme");
    } catch {}
    const wantsDark = saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", wantsDark);
    setDark(wantsDark);
  }, []);

  // set up the ink overlay (client only, loaded lazily so SSR never touches `window`)
  useEffect(() => {
    let cancelled = false;
    let canvas: HTMLCanvasElement | null = null;

    void import("./ink-transition/inkTransition").then(({ InkTransition }) => {
      if (cancelled) return;
      canvas = document.createElement("canvas");
      // z-40 sits below your toggle (z-50). Raise it above any other fixed UI you have
      // only if you want that UI covered by the ink too.
      canvas.className = "pointer-events-none invisible fixed inset-0 z-40 h-full w-full";
      canvas.setAttribute("aria-hidden", "true");
      canvas.setAttribute("data-html2canvas-ignore", "");
      document.body.append(canvas);
      inkRef.current = new InkTransition(canvas, buttonRef.current);
    });

    return () => {
      cancelled = true;
      inkRef.current?.destroy();
      inkRef.current = null;
      canvas?.remove();
    };
  }, []);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const ink = inkRef.current;
    if (ink) {
      // detail === 0 means keyboard activation: spread from the button itself
      ink.toggle(e.detail === 0 ? undefined : { x: e.clientX, y: e.clientY });
    } else {
      applyTheme(otherTheme(getTheme())); // ink not ready yet: plain instant switch
    }
    setDark(getTheme() === "dark");
  };

  return (
    <button
      ref={buttonRef}
      data-ink-live
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="fixed bottom-4 right-8 md:bottom-6 md:right-12 z-50 grid h-11 w-11 place-items-center rounded-full border border-slate-900/15 bg-white/70 text-[#0a0f1c] backdrop-blur transition-transform hover:scale-110 dark:border-white/20 dark:bg-[#05070d]/70 dark:text-white"
    >
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}
