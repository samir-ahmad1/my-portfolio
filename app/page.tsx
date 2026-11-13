"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Hero from "./hero/page";
import ThemeToggle from "./components/ThemeToggle";
import About from "./components/About";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Header from "./components/Header";

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({
  ignoreMobileResize: true,
});

export default function Page() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".page-progress", {
        scaleX: 0,
        transformOrigin: "left center",
      });

      gsap.to(".page-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          start: 0,
          end: "max",
          scrub: 0.3,
        },
      });
    });

    return () => ctx.revert();
  }, []);

  // Refresh scroll animations after fonts and images load.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();

    document.fonts?.ready.then(refresh);

    window.addEventListener("load", refresh);

    const timer = setTimeout(refresh, 800);

    return () => {
      window.removeEventListener("load", refresh);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {/* Page scroll progress */}
      <div className="pointer-events-none fixed left-0 top-0 z-50 h-[2px] w-full">
        <div className="page-progress h-full bg-blue-500" />
      </div>

      {/* Theme switcher */}
      <ThemeToggle />

      {/* Main sections */}
     <Header/>
      <Hero />
      <About />
      <Projects />
      <Contact />
    </>
  );
}
