'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useScene } from '@/store/useScene';

// Module-level handle so UI (e.g. the navbar) can request smooth jumps
// without prop-drilling the Lenis instance everywhere.
let lenisInstance: Lenis | null = null;

/** Smoothly scroll to a section element by id (used by the nav + CTAs). */
export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  if (lenisInstance) lenisInstance.scrollTo(target, { offset: 0, duration: 1.4 });
  else target.scrollIntoView({ behavior: 'smooth' });
}

/** Pause/resume inertia scrolling — used to lock the page behind modals. */
export function setScrollEnabled(enabled: boolean) {
  if (!lenisInstance) return;
  if (enabled) lenisInstance.start();
  else lenisInstance.stop();
}

/**
 * Lenis smooth scrolling, hooked into GSAP's ticker so ScrollTrigger and the
 * inertia scroll share one clock (no double RAF, no jitter). Also publishes
 * whole-page progress into the scene store for parallax/grid speed.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const setProgress = useScene((s) => s.setProgress);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reduce,
      touchMultiplier: 1.4,
    });
    lenisInstance = lenis;

    lenis.on('scroll', (e: { progress: number }) => {
      ScrollTrigger.update();
      setProgress(e.progress ?? 0);
    });

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // ScrollTrigger needs to recompute once layout/fonts settle.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const settle = window.setTimeout(refresh, 600);

    return () => {
      gsap.ticker.remove(raf);
      window.removeEventListener('load', refresh);
      window.clearTimeout(settle);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [setProgress]);

  return <>{children}</>;
}
