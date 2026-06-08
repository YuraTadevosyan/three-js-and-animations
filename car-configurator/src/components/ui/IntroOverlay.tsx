import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

import { useReducedMotion } from '@/hooks/useReducedMotion';

/** A brief cinematic boot screen that wipes away to reveal the garage. */
export function IntroOverlay() {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setDone(true);
      return;
    }
    const tl = gsap.timeline({ onComplete: () => setDone(true) });
    tl.to(bar.current, { scaleX: 1, duration: 1.1, ease: 'power2.inOut' })
      .to(root.current, { opacity: 0, duration: 0.7, ease: 'power2.in' }, '+=0.1')
      .set(root.current, { pointerEvents: 'none' });
    return () => void tl.kill();
  }, [reducedMotion]);

  if (done) return null;

  return (
    <div
      ref={root}
      className="absolute inset-0 z-50 grid place-items-center bg-ink"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.5em] text-white/40">
            Need for Speed Garage
          </p>
          <p className="text-shadow-glow mt-2 text-2xl font-semibold tracking-tight text-white">
            BMW E46 Configurator
          </p>
        </div>
        <div className="h-[2px] w-56 overflow-hidden rounded-full bg-white/10">
          <div
            ref={bar}
            className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-neon to-ember"
          />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
          Warming up the lights…
        </p>
      </div>
    </div>
  );
}
