import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';
import gsap from 'gsap';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { IconButton } from './IconButton';

const TECH: { name: string; role: string }[] = [
  { name: 'React 18', role: 'UI & component state' },
  { name: 'TypeScript', role: 'Type-safe, strict codebase' },
  { name: 'Vite', role: 'Dev server & production build' },
  { name: 'three.js', role: 'WebGL rendering engine' },
  { name: 'React Three Fiber', role: 'React renderer for three.js' },
  { name: '@react-three/drei', role: 'GLTF loader, OrbitControls, Environment, reflections' },
  { name: '@react-three/postprocessing', role: 'Bloom & vignette post pipeline' },
  { name: 'GSAP', role: 'Paint, camera & UI animation' },
  { name: 'Tailwind CSS', role: 'Glassmorphic interface' },
  { name: 'lucide-react', role: 'Icon set' },
];

const FEATURES: string[] = [
  'Real BMW M3 GTR E46 GLB — auto-fitted, oriented & grounded',
  'Live paint with 12 presets + custom colour picker',
  'Swappable real/procedural wheels at the car’s own hubs',
  'Rim & caliper finishes with a custom colour picker',
  'Angel-eye headlights, cinematic camera presets',
  'Reflective Need-for-Speed garage with profile lighting',
];

export function About() {
  const [open, setOpen] = useState(false);
  const backdrop = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  // Entrance + Esc-to-close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);

    let ctx: gsap.Context | undefined;
    if (!reducedMotion) {
      ctx = gsap.context(() => {
        gsap.from(backdrop.current, { opacity: 0, duration: 0.25, ease: 'power2.out' });
        gsap.from(panel.current, {
          opacity: 0,
          y: 18,
          scale: 0.96,
          duration: 0.4,
          ease: 'power3.out',
        });
      });
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      ctx?.revert();
    };
  }, [open, reducedMotion]);

  return (
    <div data-ui-enter="toolbar">
      <IconButton
        icon={<Info size={18} strokeWidth={2} />}
        label="About this build"
        onClick={() => setOpen(true)}
      />

      {open &&
        createPortal(
          <div
            ref={backdrop}
            className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="About this project"
            onClick={(e) => e.stopPropagation()}
            className="glass no-scrollbar max-h-[86vh] w-full max-w-lg overflow-y-auto rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/8 p-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-neon/70">
                  Need for Speed Garage
                </p>
                <h2 className="text-shadow-glow mt-1 text-xl font-semibold tracking-tight text-white">
                  BMW M3 GTR E46 Configurator
                </h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">
                  A premium 3D car configurator: a real GLB model dropped into a
                  cinematic garage, driven live by paint, wheels, finishes and
                  lighting.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-white/60 transition-colors hover:border-white/20 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Built with */}
            <section className="p-5">
              <h3 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/75">
                <span className="font-mono text-[10px] text-neon/70">01</span>
                Built with
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {TECH.map((t) => (
                  <li
                    key={t.name}
                    className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2"
                  >
                    <span className="block text-[13px] font-medium text-white">{t.name}</span>
                    <span className="block text-[11px] leading-snug text-white/45">
                      {t.role}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Features */}
            <section className="border-t border-white/8 p-5">
              <h3 className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/75">
                <span className="font-mono text-[10px] text-neon/70">02</span>
                Highlights
              </h3>
              <ul className="space-y-1.5">
                {FEATURES.map((f) => (
                  <li key={f} className="flex gap-2.5 text-[13px] text-white/65">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon/80" />
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            {/* Credit */}
            <section className="border-t border-white/8 p-5">
              <h3 className="mb-2 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-white/75">
                <span className="font-mono text-[10px] text-neon/70">03</span>
                Model credit
              </h3>
              <p className="text-[12px] leading-relaxed text-white/45">
                3D models “2005 BMW M3 GTR — Need for Speed Most Wanted” and the
                tuner wheel by <span className="text-white/70">get3dmodels</span>.
                Fan-made assets — honour the original (typically non-commercial,
                attribution-required) licence before public use.
              </p>
            </section>
          </div>
        </div>,
          document.body,
        )}
    </div>
  );
}
