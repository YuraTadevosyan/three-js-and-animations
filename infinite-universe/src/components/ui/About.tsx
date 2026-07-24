import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';
import gsap from 'gsap';

import { useReducedMotion } from '@/hooks/useReducedMotion';

const TECH: { name: string; role: string }[] = [
  { name: 'React 18', role: 'HUD, overlays & app state' },
  { name: 'TypeScript', role: 'Strict, type-safe codebase' },
  { name: 'Vite', role: 'Dev server & production build' },
  { name: 'three.js', role: 'WebGL2 rendering engine' },
  { name: 'React Three Fiber', role: 'React renderer for three.js' },
  {
    name: '@react-three/postprocessing',
    role: 'Bloom, chromatic aberration & vignette',
  },
  { name: 'GSAP', role: 'Fly-to camera, warp ramps & this modal' },
  { name: 'simplex-noise', role: 'Organic camera drift on the JS side' },
  {
    name: 'GLSL ES 3.0',
    role: 'Worlds, nebula, stars, dust & light-threads',
  },
  { name: 'Tailwind CSS', role: 'Glass HUD & overlays' },
  { name: 'lucide-react', role: 'Icon set' },
];

const HIGHLIGHTS: string[] = [
  'Deterministic worlds — planets, floating islands, gas giants, crystals',
  'Light-threads between neighbours, with energy pulses flowing along them',
  'Click any world for a GSAP fly-to that settles into a slow orbit',
  'A hue-drifting sun lights every world in unison, lifted by bloom',
  'Hyperspace warp stretches the dust field into streaks of light',
  'Respects prefers-reduced-motion',
];

export function About() {
  const [open, setOpen] = useState(false);
  const backdrop = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Entrance animation + Esc-to-close. The listener runs on the capture phase
  // and stops propagation so Esc closes the modal without also releasing a
  // world that happens to be scanned behind it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      setOpen(false);
    };
    window.addEventListener('keydown', onKey, true);

    let ctx: gsap.Context | undefined;
    if (!reducedMotion) {
      ctx = gsap.context(() => {
        gsap.from(backdrop.current, { opacity: 0, duration: 0.25, ease: 'power2.out' });
        gsap.from(panel.current, {
          opacity: 0,
          y: 18,
          scale: 0.96,
          duration: 0.45,
          ease: 'power3.out',
        });
      });
    }
    return () => {
      window.removeEventListener('keydown', onKey, true);
      ctx?.revert();
    };
  }, [open, reducedMotion]);

  return (
    <>
      <button
        type="button"
        aria-label="About this build"
        title="About this build"
        onClick={() => setOpen(true)}
        className="pointer-events-auto grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/55 transition hover:border-white/25 hover:text-white"
      >
        <Info size={15} strokeWidth={2} />
      </button>

      {open &&
        createPortal(
          <div
            ref={backdrop}
            className="fixed inset-0 z-[100] grid place-items-center bg-void/75 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-label="About Infinite Universe"
              onClick={(e) => e.stopPropagation()}
              className="glass-strong max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-plasma/80">
                    No beginning · No end
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    <span className="text-cosmic">Infinite Universe</span>
                  </h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
                    An endless procedural cosmos of floating islands and glowing
                    worlds threaded together by light — inspired by universe
                    exploration and <em>No Man&apos;s Sky</em>.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-white/60 transition hover:border-white/25 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Built with */}
              <section className="p-5">
                <h3 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/75">
                  <span className="font-mono text-[10px] text-plasma/70">01</span>
                  Built with
                </h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {TECH.map((t) => (
                    <li
                      key={t.name}
                      className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2"
                    >
                      <span className="block text-[13px] font-medium text-white">
                        {t.name}
                      </span>
                      <span className="block text-[11px] leading-snug text-white/45">
                        {t.role}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* How the infinity works */}
              <section className="border-t border-white/10 p-5">
                <h3 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/75">
                  <span className="font-mono text-[10px] text-plasma/70">02</span>
                  How the infinity works
                </h3>
                <p className="text-[12.5px] leading-relaxed text-white/55">
                  The universe is a corridor along the −Z axis. Every world is a
                  pure, deterministic function of an integer <em>slot</em> ahead
                  of the camera, and a fixed pool of ~26 slots streams in and out
                  as you travel — so a couple of dozen meshes create a boundless
                  cosmos. The nebula and starfield recenter on the camera each
                  frame, so the far distance is never any closer.
                </p>
              </section>

              {/* Highlights */}
              <section className="border-t border-white/10 p-5">
                <h3 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/75">
                  <span className="font-mono text-[10px] text-plasma/70">03</span>
                  Highlights
                </h3>
                <ul className="space-y-1.5">
                  {HIGHLIGHTS.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[13px] text-white/65">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-plasma/80" />
                      {f}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Secrets */}
              <section className="border-t border-white/10 p-5">
                <h3 className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/75">
                  <span className="font-mono text-[10px] text-plasma/70">04</span>
                  Secrets
                </h3>
                <p className="text-[12px] leading-relaxed text-white/45">
                  Three things out here are hidden on purpose. One answers to an
                  old cheat code, one is a rare obelisk that decodes a message
                  when scanned, and one is counting your clicks. Happy hunting.
                </p>
              </section>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
