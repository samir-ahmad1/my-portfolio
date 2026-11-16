"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import HeroBackground from "./HeroBackground";
import HeroFigure from "./HeroFigure";
import { display } from "../components/shared";

gsap.registerPlugin(ScrollTrigger);

const ROLE = "Software Developer";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Types `final` into `el` by resolving random glyphs left to right. */
function scramble(el: HTMLElement, final: string, duration = 1.2) {
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ{}<>/=+*#";
  const state = { p: 0 };

  return gsap.to(state, {
    p: 1,
    duration,
    ease: "none",
    onUpdate() {
      const done = Math.floor(state.p * final.length);

      el.textContent = final
        .split("")
        .map((c, i) =>
          c === " " || i < done
            ? c
            : glyphs[Math.floor(Math.random() * glyphs.length)]
        )
        .join("");
    },
    onComplete() {
      el.textContent = final;
    },
  });
}

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const figureIntro = useRef({ v: 0 });

  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      figureIntro.current.v = 1;
      return;
    }

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const role = el.querySelector<HTMLElement>(".hero-role")!;

      /* ---------- Initial states ---------- */

      role.textContent = "";

      gsap.set(".hero-line", { yPercent: 115, skewY: 6 });
      gsap.set(".hero-sub", { opacity: 0, y: 24 });
      gsap.set(".hero-cta", { opacity: 0, y: 24 });
      gsap.set(".nav-item", { opacity: 0, y: -16 });
      gsap.set(".cue-inner", { opacity: 0 });
      gsap.set(".bg-canvas", { opacity: 0 });
      gsap.set(".cursor-glow", {
        xPercent: -50,
        yPercent: -50,
        opacity: 0,
      });

      /* ---------- Intro sequence ---------- */

      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .to(
          ".bg-canvas",
          {
            opacity: 1,
            duration: 2.2,
            ease: "power2.out",
          },
          0
        )
        .to(
          ".nav-item",
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
          },
          0.2
        )
        .to(
          ".hero-line",
          {
            yPercent: 0,
            skewY: 0,
            duration: 1.5,
            stagger: 0.18,
            ease: "expo.out",
          },
          0.35
        )
        .to(
          figureIntro.current,
          {
            v: 1,
            duration: 2.4,
            ease: "power2.out",
          },
          0.5
        )
        .add(scramble(role, ROLE, 1.1), 0.9)
        .to(
          ".hero-sub",
          {
            opacity: 1,
            y: 0,
            duration: 1,
          },
          1.0
        )
        .to(
          ".hero-cta",
          {
            opacity: 1,
            y: 0,
            duration: 1,
          },
          1.15
        )
        .to(
          ".cue-inner",
          {
            opacity: 1,
            duration: 1,
          },
          1.7
        );

      /* ---------- Ambient loop ---------- */

      gsap.fromTo(
        ".cue-line",
        {
          scaleY: 0,
          transformOrigin: "top",
        },
        {
          scaleY: 1,
          duration: 1.2,
          ease: "power2.inOut",
          yoyo: true,
          repeat: -1,
          repeatDelay: 0.2,
        }
      );

      /* ---------- Pinned scroll sequence ---------- */

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
              progress.current = self.progress;
            },
          },
        })
        .to(
          ".hero-names",
          {
            yPercent: -14,
            scale: 1.08,
            opacity: 0,
            duration: 0.6,
          },
          0
        )
        .to(
          ".hero-bottom",
          {
            opacity: 0,
            y: 40,
            duration: 0.35,
          },
          0
        )
        .to(
          ".scroll-cue",
          {
            opacity: 0,
            duration: 0.15,
          },
          0
        );

      /* ---------- Pointer effects ---------- */

      if (finePointer) {
        const glowX = gsap.quickTo(".cursor-glow", "x", {
          duration: 0.7,
          ease: "power3",
        });

        const glowY = gsap.quickTo(".cursor-glow", "y", {
          duration: 0.7,
          ease: "power3",
        });

        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();

          glowX(e.clientX - r.left);
          glowY(e.clientY - r.top);

          gsap.to(".cursor-glow", {
            opacity: 1,
            duration: 0.6,
            overwrite: "auto",
          });
        };

        window.addEventListener("pointermove", onMove);

        cleanups.push(() =>
          window.removeEventListener("pointermove", onMove)
        );

        // Magnetic buttons
        el.querySelectorAll<HTMLElement>(".magnetic").forEach((btn) => {
          const bx = gsap.quickTo(btn, "x", {
            duration: 0.5,
            ease: "power3",
          });

          const by = gsap.quickTo(btn, "y", {
            duration: 0.5,
            ease: "power3",
          });

          const move = (e: PointerEvent) => {
            const r = btn.getBoundingClientRect();

            bx((e.clientX - (r.left + r.width / 2)) * 0.3);
            by((e.clientY - (r.top + r.height / 2)) * 0.3);
          };

          const leave = () => {
            bx(0);
            by(0);
          };

          btn.addEventListener("pointermove", move);
          btn.addEventListener("pointerleave", leave);

          cleanups.push(() => {
            btn.removeEventListener("pointermove", move);
            btn.removeEventListener("pointerleave", leave);
          });
        });
      }
    }, el);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  return (
    <main
      ref={root}
      id="home"
      className="relative h-svh min-h-[620px] overflow-hidden transition-colors duration-500 bg-[#eef2f9] dark:bg-[#05070d] text-[#0a0f1c] dark:text-white"
    >
      {/* Layer 1: Flow field and galaxy */}
      <div className="bg-canvas absolute inset-0 z-0">
        <HeroBackground progress={progress} />
      </div>

      {/* Cursor glow */}
      <div className="cursor-glow pointer-events-none absolute left-0 top-0 z-[6] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.16),transparent_65%)]" />

      {/* Navigation is handled by Header.tsx */}

      {/* Big name */}
      <div className="hero-names pointer-events-none absolute inset-x-0 bottom-[36%] z-10 flex justify-center md:bottom-[17%]">
        <h1 className={`${display.className} w-fit tracking-tighter`}>
          <span className="block py-[0.04em] [clip-path:inset(0_-50vw)]">
            <span className="hero-line inline-block text-[min(9vw,14svh)] font-normal leading-none text-blue-600 dark:text-[#6aa8f0] md:-ml-[1.5vw] md:text-[min(6vw,12svh)]">
              Samir
            </span>
          </span>

          <span className="-mt-[0.02em] block overflow-hidden py-[0.04em]">
            <span className="hero-line inline-block text-[min(24vw,34svh)] font-extrabold leading-[0.82] text-slate-900 dark:text-[#f5f5f7] md:text-[min(19vw,36svh)]">
              Ahmad
            </span>
          </span>
        </h1>
      </div>

      {/* Layer 2: Glowing orb and figure */}
      <div className="pointer-events-none absolute inset-0 z-[15]">
        <HeroFigure progress={progress} intro={figureIntro} />
      </div>

      {/* Bottom row: aligned with Header.tsx navigation */}
      <div className="hero-bottom absolute inset-x-0 bottom-0 z-20 px-4 pb-6 sm:px-8 lg:px-12 md:pb-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 sm:px-7 md:flex-row md:items-end md:justify-between">

          {/* Software Developer - Left */}
          <div className="max-w-sm md:max-w-md">
            <p className="hero-role text-sm font-semibold text-slate-700 dark:text-gray-300">
              {ROLE}
            </p>

            <p className="hero-sub mt-3 text-sm leading-6 text-slate-600 dark:text-gray-400 md:text-base md:leading-7">
              I’m a software developer passionate about building modern web
              applications and creating meaningful digital experiences.
            </p>
          </div>

          {/* Buttons - Right */}
          <div className="hero-cta flex flex-wrap gap-3">
            <a
              href="#projects"
              className="magnetic rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              See selected work ↗
            </a>

            <a
              href="#contact"
              className="magnetic rounded-full border border-slate-900/15 px-6 py-3.5 text-sm transition-colors hover:bg-slate-900 hover:text-white dark:border-white/20 dark:hover:bg-white dark:hover:text-black"
            >
              Get in touch ↗
            </a>
          </div>

        </div>
      </div>

      {/* Scroll cue */}
      <div className="scroll-cue absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 md:block">
        <div className="cue-inner flex flex-col items-center gap-3 text-slate-500 dark:text-gray-500">
          <span className="text-[10px] tracking-[0.3em] uppercase">
            Scroll
          </span>

          <div className="cue-line h-8 w-px bg-blue-500" />
        </div>
      </div>
    </main>
  );
}