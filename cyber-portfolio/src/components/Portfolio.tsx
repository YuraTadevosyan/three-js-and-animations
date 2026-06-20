'use client';

import { useEffect } from 'react';
import { usePointerTracker } from '@/hooks/usePointerTracker';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useScene } from '@/store/useScene';
import { SmoothScroll } from '@/components/providers/SmoothScroll';
import { SceneCanvas } from '@/components/canvas/SceneCanvas';
import { Navbar } from '@/components/ui/Navbar';
import { Hud } from '@/components/ui/Hud';
import { IntroOverlay } from '@/components/ui/IntroOverlay';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Projects } from '@/components/sections/Projects';
import { Skills } from '@/components/sections/Skills';
import { Contact } from '@/components/sections/Contact';

/**
 * Client root that wires the whole experience together: it feeds the pointer
 * tracker + reduced-motion flag into the scene store, mounts the fixed WebGL
 * backdrop and HUD chrome, and renders the scrollable content inside the
 * Lenis smooth-scroll provider.
 */
export function Portfolio() {
  usePointerTracker();
  const reduced = usePrefersReducedMotion();
  const setReducedMotion = useScene((s) => s.setReducedMotion);

  useEffect(() => {
    setReducedMotion(reduced);
  }, [reduced, setReducedMotion]);

  return (
    <>
      <IntroOverlay />
      <SceneCanvas />
      <Navbar />
      <Hud />

      <SmoothScroll>
        <main className="relative z-10">
          <Hero />
          <About />
          <Projects />
          <Skills />
          <Contact />
        </main>
      </SmoothScroll>
    </>
  );
}
