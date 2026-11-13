"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { display, prefersReduced, useIso } from "./shared";

gsap.registerPlugin(ScrollTrigger);

// TODO: replace with your real projects. For screenshots, swap the placeholder
// <div className="proj-art ..."> for <Image src="/projects/x.png" fill className="object-cover" alt="" />
const PROJECTS = [
  {
    name: "Project one",
    blurb: "One line on what it does and who it’s for.",
    stack: "Next.js, TypeScript, Tailwind CSS",
    year: "2026",
    href: "#",
    size: "w-[78vw] md:w-[46vw] aspect-[4/3]",
    shift: "md:-translate-y-10",
    tone: "from-[#0b2a5c] via-[#0a1a38] to-[#05070d]",
  },
  {
    name: "Project two",
    blurb: "One line on what it does and who it’s for.",
    stack: "React, Three.js, GSAP",
    year: "2026",
    href: "#",
    size: "w-[78vw] aspect-[4/3] md:w-[34vw] md:aspect-[3/4]",
    shift: "md:translate-y-12",
    tone: "from-[#123a73] via-[#0b1e3f] to-[#05070d]",
  },
  {
    name: "Project three",
    blurb: "One line on what it does and who it’s for.",
    stack: "Next.js, Node.js",
    year: "2025",
    href: "#",
    size: "w-[78vw] md:w-[52vw] aspect-[16/10]",
    shift: "md:-translate-y-4",
    tone: "from-[#0a2247] via-[#0d2a55] to-[#05070d]",
  },
];

export default function Projects() {
  const root = useRef<HTMLElement>(null);

  useIso(() => {
    const el = root.current;
    if (!el) return;

    if (prefersReduced()) {
      // no pin, no sideways motion: let people scroll the row themselves
      el.querySelector<HTMLElement>(".proj-viewport")!.style.overflowX = "auto";
      return;
    }

    const ctx = gsap.context(() => {
      const track = el.querySelector<HTMLElement>(".proj-track")!;
      const dist = () => track.scrollWidth - window.innerWidth;

      const scrollTween = gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + dist(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      gsap.set(".proj-progress", { scaleX: 0, transformOrigin: "left center" });
      gsap.to(".proj-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: () => "+=" + dist(), scrub: true },
      });

      el.querySelectorAll<HTMLElement>(".proj").forEach((p) => {
        const wrap = p.querySelector(".proj-wrap");
        const media = p.querySelector(".proj-media");
        const title = p.querySelector(".proj-title");
        const base = { trigger: wrap, containerAnimation: scrollTween };

        // image wipes open from the left as the panel arrives
        gsap.fromTo(
          wrap,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            ease: "none",
            scrollTrigger: { ...base, start: "left 95%", end: "left 55%", scrub: true },
          }
        );
        // picture and title drift at different speeds than the panel
        gsap.fromTo(
          media,
          { xPercent: -6 },
          { xPercent: 6, ease: "none", scrollTrigger: { ...base, start: "left right", end: "right left", scrub: true } }
        );
        gsap.fromTo(
          title,
          { x: 80 },
          { x: -40, ease: "none", scrollTrigger: { ...base, start: "left right", end: "right left", scrub: true } }
        );
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section id="projects" ref={root} className="relative transition-colors duration-500 bg-[#e6ebf5] dark:bg-[#070b14] text-[#0a0f1c] dark:text-white">
      <div className="proj-viewport relative flex h-svh items-center overflow-hidden">
        <div className="proj-track flex items-center gap-[8vw] px-8 md:px-12 will-change-transform">
          <div className="w-[70vw] shrink-0 md:w-[30vw]">
            <h2
              className={`${display.className} text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl`}
            >
              Selected work
            </h2>
            <p className="mt-6 max-w-xs leading-7 text-slate-600 dark:text-gray-400">
              A few things I’ve built, and how they came together.
            </p>
          </div>

          {PROJECTS.map((p) => (
            <article key={p.name} className={`proj group shrink-0 ${p.shift}`}>
              <div
                className={`proj-wrap relative overflow-hidden border border-slate-900/15 dark:border-white/20 ${p.size}`}
              >
                <div className="proj-media absolute inset-y-0 -inset-x-[10%]">
                  <div
                    className={`proj-art h-full w-full bg-gradient-to-br ${p.tone} transition-transform duration-700 group-hover:scale-105`}
                  >
                    <span
                      className={`${display.className} absolute bottom-4 left-[12%] text-[clamp(3rem,9vw,8rem)] font-extrabold leading-none`}
                      style={{ WebkitTextStroke: "1px rgba(255,255,255,0.25)", color: "transparent" }}
                    >
                      {p.name.split(" ")[1]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-baseline justify-between gap-6">
                <h3
                  className={`proj-title ${display.className} text-3xl font-bold tracking-tight md:text-5xl`}
                >
                  {p.name}
                </h3>
                <span className="text-sm text-slate-500 dark:text-gray-500">{p.year}</span>
              </div>
              <p className="mt-3 max-w-md text-slate-600 dark:text-gray-400">{p.blurb}</p>
              <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">{p.stack}</p>
              <a
                href={p.href}
                className="mt-4 inline-block border-b border-slate-900/30 dark:border-white/30 pb-0.5 text-sm transition-colors hover:border-blue-700 hover:text-blue-700 dark:hover:border-blue-400 dark:hover:text-blue-400"
              >
                Visit site
              </a>
            </article>
          ))}

          <div className="w-[16vw] shrink-0" />
        </div>

        <div className="absolute inset-x-8 bottom-10 h-px bg-slate-900/15 dark:bg-white/20 md:inset-x-12">
          <div className="proj-progress h-full bg-blue-500" />
        </div>
      </div>
    </section>
  );
}
