import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Module-scoped reference so non-React code can stop/start the smooth
// scroller — e.g. the About modal pauses it while open so the page
// underneath doesn't drift when the user scrolls inside the modal.
let lenisInstance: Lenis | null = null;
export const pageScroll = {
  stop() {
    lenisInstance?.stop();
  },
  start() {
    lenisInstance?.start();
  },
};

// Mounts Lenis once at app boot and wires its frame to GSAP's ticker so
// ScrollTrigger and the smooth scroller share a single update loop —
// otherwise pinned sections jitter against Lenis' interpolated position.
export function useSmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.4,
    });

    lenisInstance = lenis;
    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    document.documentElement.classList.add('lenis', 'lenis-smooth');

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisInstance = null;
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, []);
}
