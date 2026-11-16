"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Replace with your own copy.
const ABOUT_TEXT =
  "I build modern web experiences where motion, depth and performance work together. I care about the details most people never consciously notice, but always feel.";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const glow = glowRef.current;
    if (!section || !glow) return;

    const words = section.querySelectorAll<HTMLElement>("[data-word]");
    const mm = gsap.matchMedia();

    // Full motion only. With reduced motion, nothing is pinned or animated and
    // the text is shown at full opacity through the motion-reduce: classes.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // 1) Background: starts as the previous section's black, then a soft
      //    light blooms in while About slides up and stacks over it.
      gsap.fromTo(
        glow,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        }
      );

      // 2) Pinned word-by-word reveal across 300vh of scrolling.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=300%",
          pin: true,
          pinSpacing: true,
          scrub: 1, // smooths the scroll-to-animation link
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(
        words,
        { opacity: 0.08, y: 28, filter: "blur(12px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          ease: "power2.out",
          duration: 0.6,
          // Spreads the words across the timeline so the last word
          // lands exactly when the pin ends.
          stagger: { amount: 1.4, ease: "none" },
        }
      );
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative z-10 flex h-screen w-full items-center justify-center overflow-hidden bg-white px-6 sm:px-10 dark:bg-black"
    >
      {/* Soft cinematic light (dark) / soft shade (light) that fades in as the section arrives */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_50%,rgba(0,0,0,0.06),transparent_70%)] motion-reduce:opacity-100 dark:bg-[radial-gradient(ellipse_70%_55%_at_50%_50%,rgba(255,255,255,0.09),transparent_70%)]"
      />

      <p
        className="relative mx-auto max-w-5xl text-center text-[clamp(1.5rem,4.2vw,3.5rem)] font-medium leading-[1.2] tracking-tight text-neutral-950 dark:text-white"
        aria-label={ABOUT_TEXT}
      >
        {ABOUT_TEXT.split(" ").map((word, i) => (
          <span key={i} aria-hidden>
            <span
              data-word
              className="inline-block opacity-[0.08] blur-[12px] will-change-[transform,opacity,filter] motion-reduce:opacity-100 motion-reduce:blur-none"
            >
              {word}
            </span>{" "}
          </span>
        ))}
      </p>
    </section>
  );
}
