import { useEffect, useRef } from 'react';
import gsap from 'gsap';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { CarScene } from './scene/CarScene';
import { Brand } from './ui/Brand';
import { Toolbar } from './ui/Toolbar';
import { ConfiguratorPanel } from './ui/ConfiguratorPanel';
import { ViewBar } from './ui/ViewBar';
import { Footer } from './ui/Footer';
import { IntroOverlay } from './ui/IntroOverlay';

export function CarConfigurator() {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Staggered entrance for every overlay element, timed to land just after the
  // intro wipe clears.
  useEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 1.15 });
      tl.from('[data-ui-enter="brand"]', {
        y: -16,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      })
        .from(
          '[data-ui-enter="toolbar"]',
          { y: -16, opacity: 0, duration: 0.6, ease: 'power3.out' },
          '<0.08',
        )
        .from(
          '[data-ui-enter="panel"]',
          { x: 40, opacity: 0, duration: 0.7, ease: 'power3.out' },
          '<0.05',
        )
        .from(
          '[data-ui-enter="viewbar"]',
          { y: 24, opacity: 0, duration: 0.6, ease: 'power3.out' },
          '<0.1',
        )
        .from(
          '[data-ui-enter="footer"]',
          { opacity: 0, duration: 0.6, ease: 'power2.out' },
          '<0.1',
        );
    }, root);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden">
      <CarScene />

      {/* Top vignette to seat the header controls */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />

      {/* Overlay UI — children opt back into pointer events */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-5 top-5">
          <Brand />
        </div>
        <div className="pointer-events-auto absolute right-5 top-5">
          <Toolbar />
        </div>

        <div
          className="absolute left-1/2 top-20 -translate-x-1/2 lg:top-auto lg:bottom-6"
        >
          <ViewBar />
        </div>

        <div className="pointer-events-auto absolute inset-x-3 bottom-3 max-h-[42vh] lg:inset-x-auto lg:bottom-6 lg:right-5 lg:top-24 lg:max-h-none lg:w-[360px]">
          <ConfiguratorPanel />
        </div>

        <div className="absolute bottom-6 left-5 hidden lg:block">
          <Footer />
        </div>
      </div>

      <IntroOverlay />
    </div>
  );
}
