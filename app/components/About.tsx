"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { display, prefersReduced, useIso } from "./shared";

gsap.registerPlugin(ScrollTrigger);

// Placeholder copy: rewrite in your own words
const STATEMENT =
  "More than just code. I bring ideas to life by combining beautiful interfaces, intelligent systems, and seamless functionality into digital products built to make an impact.";

// const SKILLS = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Three.js", "GSAP"];
const ROLES = [
  "Building for the web.",
  "Turning ideas into reality.",
  "Creating digital experiences.",
  "Always learning, always building.",
];

function Half() {
  return (
    <div className="flex shrink-0 items-center">
      {[...ROLES, ...ROLES].map((s, i) => (
        <span key={i} className="flex items-center">
          <span
            className={`${display.className} px-8 md:px-12 text-[clamp(4rem,11vw,10rem)] font-extrabold leading-none text-transparent [-webkit-text-stroke:1px_rgba(10,15,28,0.4)] dark:[-webkit-text-stroke:1px_rgba(255,255,255,0.35)]`}
          >
            {s}
          </span>
          <span className="h-3 w-3 rounded-full bg-blue-500" />
        </span>
      ))}
    </div>
  );
}

export default function About() {
  const root = useRef<HTMLElement>(null);

  useIso(() => {
    const el = root.current;
    if (!el) return;

    if (prefersReduced()) {
      gsap.set(el.querySelectorAll(".word"), { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      // Words light up as you scroll through the paragraph
      gsap.set(".word", { y: 10 });
      gsap.to(".word", {
        opacity: 1,
        y: 0,
        stagger: 0.12,
        ease: "none",
        scrollTrigger: {
          trigger: ".statement",
          start: "top 80%",
          end: "bottom 45%",
          scrub: true,
        },
      });

      // Marquee: runs on its own, but scroll speed boosts it and scroll direction flips it
      const tween = gsap.to(".marquee-track", {
        xPercent: -50,
        ease: "none",
        duration: 40,
        repeat: -1,
      });
      tween.totalTime(tween.duration() * 1000); // start deep in the loop so it can run backwards

      ScrollTrigger.create({
        onUpdate(self) {
          const dir = self.direction === 1 ? 1 : -1;
          const boost = Math.min(Math.abs(self.getVelocity()) / 250, 6);
          gsap
            .timeline()
            .to(tween, { timeScale: dir * (1 + boost), duration: 0.15, overwrite: true })
            .to(tween, { timeScale: dir, duration: 1.2 });
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={root} className="relative transition-colors duration-500 bg-[#eef2f9] dark:bg-[#05070d] py-40 text-[#0a0f1c] dark:text-white">
      <div className="px-8 md:px-12">
        <p
          className={`statement ${display.className} max-w-[1200px] text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl md:ml-[10%] md:text-6xl lg:text-7xl`}
        >
          {STATEMENT.split(" ").map((w, i) => (
            <span key={i} className="word mr-[0.25em] inline-block opacity-[0.14]">
              {w}
            </span>
          ))}
        </p>
      </div>

      <div className="mt-40 overflow-hidden">
        <div className="marquee-track flex w-max">
          <Half />
          <Half />
        </div>
      </div>
    </section>
  );
}
