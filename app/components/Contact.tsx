"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { display, prefersReduced, useIso } from "./shared";

gsap.registerPlugin(ScrollTrigger);

const EMAIL = "hello@yourdomain.com"; // TODO: your real email

export default function Contact() {
  const root = useRef<HTMLElement>(null);

  useIso(() => {
    const el = root.current;
    if (!el || prefersReduced()) return;

    const ctx = gsap.context(() => {
      gsap.set(".c-line", { yPercent: 110 });
      gsap.to(".c-line", {
        yPercent: 0,
        stagger: 0.25,
        ease: "none",
        scrollTrigger: { trigger: ".c-title", start: "top 85%", end: "top 35%", scrub: true },
      });

      gsap.fromTo(
        ".contact-glow",
        { opacity: 0.2, scale: 0.7 },
        {
          opacity: 1,
          scale: 1.1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="contact"
      ref={root}
      className="relative flex min-h-screen flex-col justify-between overflow-hidden transition-colors duration-500 transition-colors duration-500 bg-[#eef2f9] dark:bg-[#05070d] text-[#0a0f1c] dark:text-white px-8 pb-10 pt-40 md:px-12"
    >
      <div className="contact-glow pointer-events-none absolute inset-x-0 bottom-0 mx-auto h-[60vh] w-[90vw] bg-[radial-gradient(ellipse_at_50%_100%,rgba(37,99,235,0.35),transparent_65%)]" />

      <div className="relative">
        <h2
          className={`c-title ${display.className} text-6xl font-extrabold leading-[0.95] tracking-tight md:text-[9vw]`}
        >
          {["Let’s build", "something worth", "scrolling to."].map((line) => (
            <span key={line} className="block overflow-hidden pb-[0.08em]">
              <span className="c-line inline-block">{line}</span>
            </span>
          ))}
        </h2>

        <a
          href={`mailto:${EMAIL}`}
          className="mt-14 inline-block pb-1 text-xl text-[#0a0f1c] dark:text-white transition-[background-size] duration-500 [background-image:linear-gradient(currentColor,currentColor)] [background-position:0_100%] [background-repeat:no-repeat] [background-size:0%_2px] hover:[background-size:100%_2px] md:text-3xl"
        >
          {EMAIL}
        </a>
      </div>

      <footer className="relative mt-24 flex items-center justify-between text-sm text-slate-500 dark:text-gray-500">
        <span>© 2026 Samir Ahmad</span>
        <div className="flex gap-6">
          <a href="#" className="transition-colors hover:text-slate-900 dark:hover:text-white">GitHub</a>
          <a href="#" className="transition-colors hover:text-slate-900 dark:hover:text-white">LinkedIn</a>
        </div>
      </footer>
    </section>
  );
}
