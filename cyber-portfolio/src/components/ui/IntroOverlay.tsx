'use client';

import { useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useScene } from '@/store/useScene';

const BOOT_LINES = [
  '> initializing neural interface ...',
  '> mounting webgl context ......... [ ok ]',
  '> spawning neon particle field ... [ ok ]',
  '> calibrating camera rig ......... [ ok ]',
  '> establishing uplink to night.city',
];

/**
 * The animated intro "boot sequence". A GSAP timeline types the log lines,
 * fills a loader, flashes ACCESS GRANTED, then wipes up to reveal the site.
 * Locks scroll while it plays and refreshes ScrollTrigger on exit.
 */
export function IntroOverlay() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    document.body.style.overflow = 'hidden';
    const reduce = useScene.getState().reducedMotion;

    const finish = () => {
      document.body.style.overflow = '';
      ScrollTrigger.refresh();
      setDone(true);
    };

    if (reduce) {
      finish();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: finish });
      tl.from('[data-boot-logo]', { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' })
        .from(
          '[data-boot-line]',
          { opacity: 0, x: -12, duration: 0.28, stagger: 0.22, ease: 'power1.out' },
          '-=0.1',
        )
        .fromTo(
          '[data-boot-bar]',
          { scaleX: 0 },
          { scaleX: 1, transformOrigin: 'left', duration: 1.3, ease: 'power2.inOut' },
          '<',
        )
        .to('[data-boot-grant]', { opacity: 1, duration: 0.2 }, '+=0.05')
        .to('[data-boot-grant]', { opacity: 0.2, duration: 0.08, repeat: 3, yoyo: true })
        .to(el, { yPercent: -100, duration: 0.8, ease: 'expo.inOut' }, '+=0.15');
    }, el);

    return () => {
      document.body.style.overflow = '';
      ctx.revert();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-void px-8"
    >
      <div className="scanlines pointer-events-none absolute inset-0 opacity-30" />
      <div className="w-full max-w-md">
        <p
          data-boot-logo
          className="mb-6 font-display text-2xl font-bold uppercase tracking-[0.4em] text-neon-cyan"
        >
          NIGHT::CITY.DEV
        </p>
        <div className="space-y-1.5 font-mono text-xs text-white/70">
          {BOOT_LINES.map((line) => (
            <p key={line} data-boot-line>
              {line}
            </p>
          ))}
        </div>
        <div className="relative mt-6 h-[3px] w-full overflow-hidden bg-white/10">
          <span data-boot-bar className="absolute inset-0 block bg-neon-cyan shadow-neon" />
        </div>
        <p
          data-boot-grant
          className="mt-6 font-display text-lg uppercase tracking-[0.5em] text-neon-magenta opacity-0"
        >
           access granted
        </p>
      </div>
    </div>
  );
}
