"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import type { PointerEvent } from "react";

const navItems = [
  { label: "Home", href: "#home", number: "01" },
  { label: "About", href: "#about", number: "02" },
  { label: "Projects", href: "#projects", number: "03" },
  { label: "Contact", href: "#contact", number: "04" },
];

function MenuIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="relative flex h-5 w-5 flex-col items-center justify-center">
      <motion.span
        animate={{
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 0 : -4,
        }}
        className="absolute h-[1.5px] w-5 rounded-full bg-current"
      />

      <motion.span
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? 0 : 4,
        }}
        className="absolute h-[1.5px] w-5 rounded-full bg-current"
      />
    </div>
  );
}

function MagneticButton() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, {
    stiffness: 150,
    damping: 15,
  });

  const springY = useSpring(y, {
    stiffness: 150,
    damping: 15,
  });

  const rotateX = useTransform(springY, [-15, 15], [6, -6]);
  const rotateY = useTransform(springX, [-15, 15], [-6, 6]);

  const handleMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse") return;

    const rect = e.currentTarget.getBoundingClientRect();

    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.2);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.2);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        x: springX,
        y: springY,
        rotateX,
        rotateY,
        transformPerspective: 800,
      }}
    >
      <Link
        href="#contact"
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-blue-300/30 bg-gradient-to-br from-blue-500 to-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-[0_8px_30px_rgba(37,99,235,0.3)] transition-shadow duration-300 hover:shadow-[0_10px_40px_rgba(37,99,235,0.5)]"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        <span className="relative z-10">Let's talk</span>

        <span className="relative z-10 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
          ↗
        </span>
      </Link>
    </motion.div>
  );
}

function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);
const [currentYear, setCurrentYear] = useState<number | null>(null);

useEffect(() => {
  setCurrentYear(new Date().getFullYear());
}, []);
  return (
  <div className="pointer-events-none fixed inset-0 z-[60]">
    {/* Background overlay */}
    <motion.button
      type="button"
      aria-label="Close navigation menu"
      animate={{
        opacity: isOpen ? 1 : 0,
      }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
      tabIndex={isOpen ? 0 : -1}
      style={{
        pointerEvents: isOpen ? "auto" : "none",
      }}
      className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-md"
    />

    {/* Side navigation */}
    <motion.aside
      initial={false}
      animate={{
        x: isOpen ? 0 : "100%",
        opacity: isOpen ? 1 : 0.7,
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 0.9,
      }}
      aria-hidden={!isOpen}
      style={{
        pointerEvents: isOpen ? "auto" : "none",
      }}
      className="fixed right-0 top-0 z-[70] flex h-[100dvh] w-[min(88vw,420px)] flex-col overflow-hidden border-l border-white/15 bg-[#080d1b]/90 shadow-[-30px_0_100px_rgba(0,0,0,0.35)] backdrop-blur-3xl"
    >
      {/* Ambient lighting */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-[100px]" />

      <div className="pointer-events-none absolute -bottom-20 -left-24 h-72 w-72 rounded-full bg-violet-500/15 blur-[100px]" />

      {/* Top section */}
      <div className="relative flex items-center justify-between border-b border-white/10 px-7 py-6">
        <Link
          href="#home"
          onClick={onClose}
          tabIndex={isOpen ? 0 : -1}
          className="text-xl font-semibold tracking-[0.18em] text-white"
        >
          SAMIR<span className="text-blue-400">.</span>
        </Link>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          tabIndex={isOpen ? 0 : -1}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition-all duration-300 hover:rotate-90 hover:border-white/30 hover:bg-white/10"
        >
          <MenuIcon isOpen />
        </button>
      </div>

      {/* Navigation links */}
      <nav className="relative flex flex-1 flex-col justify-center px-7">
        <motion.p
          animate={{
            opacity: isOpen ? 1 : 0,
            y: isOpen ? 0 : 15,
          }}
          transition={{ delay: isOpen ? 0.15 : 0 }}
          className="mb-8 text-[10px] font-semibold uppercase tracking-[0.35em] text-blue-400"
        >
          Navigation
        </motion.p>

        <div className="flex flex-col">
          {navItems.map((item, index) => (
            <motion.div
              key={item.label}
              animate={{
                opacity: isOpen ? 1 : 0,
                x: isOpen ? 0 : 35,
              }}
              transition={{
                duration: 0.45,
                delay: isOpen ? 0.12 + index * 0.09 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                tabIndex={isOpen ? 0 : -1}
                className="group flex items-center justify-between border-b border-white/[0.08] py-5"
              >
                <div className="flex items-center gap-5">
                  <span className="text-[10px] tracking-widest text-white/30 transition-colors duration-300 group-hover:text-blue-400">
                    {item.number}
                  </span>

                  <span className="text-3xl font-light tracking-tight text-white/75 transition-all duration-300 group-hover:translate-x-2 group-hover:text-white sm:text-4xl">
                    {item.label}
                  </span>
                </div>

                <span className="text-xl text-white/20 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-blue-400">
                  ↗
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <motion.div
        animate={{
          opacity: isOpen ? 1 : 0,
          y: isOpen ? 0 : 20,
        }}
        transition={{ delay: isOpen ? 0.55 : 0 }}
        className="relative border-t border-white/10 px-7 py-7"
      >
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-white/40">
          Have a project in mind?
        </p>

        <Link
          href="#contact"
          onClick={onClose}
          tabIndex={isOpen ? 0 : -1}
          className="inline-flex items-center gap-3 text-lg font-medium text-white transition-colors hover:text-blue-400"
        >
          Let's create something
          <span className="text-blue-400">↗</span>
        </Link>

        <div className="mt-8 flex items-center justify-between text-[10px] tracking-widest text-white/30">
          <span>© {currentYear ?? "2026"} SAMIR</span>
          <span>DESIGNED WITH INTENTION</span>
        </div>
      </motion.div>
    </motion.aside>
  </div>
);
}

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const lastScrollY = useRef(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, {
    stiffness: 120,
    damping: 20,
  });

  const springY = useSpring(mouseY, {
    stiffness: 120,
    damping: 20,
  });

  const rotateX = useTransform(springY, [-200, 200], [1.5, -1.5]);
  const rotateY = useTransform(springX, [-300, 300], [-1.5, 1.5]);

  // Show header when scrolling up and hide when scrolling down.
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const previousScrollY = lastScrollY.current;

      if (menuOpen) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY < 80) {
        setIsVisible(true);
      } else {
        const difference = currentScrollY - previousScrollY;

        if (difference > 5) {
          setIsVisible(false);
        } else if (difference < -5) {
          setIsVisible(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpen]);

  // Prevent background scrolling while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;

    const rect = e.currentTarget.getBoundingClientRect();

    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <>
      {/* Main responsive header */}
      <motion.header
        initial={false}
        animate={{
          y: isVisible || menuOpen ? 0 : "-120%",
          opacity: isVisible || menuOpen ? 1 : 0,
        }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="fixed left-0 right-0 top-0 z-50 px-4 pt-5 sm:px-8 lg:px-12"
        style={{
          pointerEvents: isVisible || menuOpen ? "auto" : "none",
        }}
      >
        <motion.nav
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{
            rotateX,
            rotateY,
            transformPerspective: 1200,
          }}
          className="relative mx-auto flex max-w-7xl items-center justify-between overflow-hidden rounded-2xl border border-white/25 bg-white/[0.12] px-5 py-3 shadow-[0_8px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-950/[0.28] sm:px-7"
        >
          {/* Glass reflections */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-blue-400/[0.08]" />

          <div className="pointer-events-none absolute -right-10 -top-16 h-32 w-32 rounded-full bg-blue-400/20 blur-3xl" />

          {/* Logo */}
          <Link
            href="#home"
            className="relative z-10 text-xl font-semibold tracking-[0.18em] text-slate-900 dark:text-white"
          >
            SAMIR<span className="text-blue-500">.</span>
          </Link>

          {/* Desktop navigation */}
          <div className="relative z-10 hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group relative rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-300 hover:text-blue-600 dark:text-slate-200 dark:hover:text-white"
              >
                <span className="absolute inset-0 scale-75 rounded-full bg-white/0 transition-all duration-300 group-hover:scale-100 group-hover:bg-white/40 dark:group-hover:bg-white/10" />

                <span className="relative z-10">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="relative z-10 hidden md:block">
            <MagneticButton />
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((previous) => !previous)}
            className="relative z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/[0.12] text-slate-800 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-blue-400/50 hover:bg-white/20 dark:text-white md:hidden"
          >
            <MenuIcon isOpen={menuOpen} />
          </button>
        </motion.nav>
      </motion.header>

      {/* Mobile side navigation */}
      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}