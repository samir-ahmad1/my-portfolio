import { useEffect, useLayoutEffect } from "react";
import { Bricolage_Grotesque } from "next/font/google";

// Display face for the section headlines (the hero keeps your current sans)
export const display = Bricolage_Grotesque({ subsets: ["latin"], display: "swap" });

export const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
