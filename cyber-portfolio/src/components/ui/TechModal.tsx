'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Cpu, X } from 'lucide-react';
import { gsap } from '@/lib/gsap';
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect';
import { useUI } from '@/store/useUI';
import { setScrollEnabled } from '@/components/providers/SmoothScroll';
import { TECH_STACK } from '@/lib/data';
import { cn } from '@/lib/cn';

const ACCENT_TEXT: Record<string, string> = {
  cyan: 'text-neon-cyan',
  magenta: 'text-neon-magenta',
  violet: 'text-neon-violet',
  amber: 'text-neon-amber',
};

/**
 * The "colophon" / about modal: a glassmorphism dialog listing the exact
 * technologies this site is built with. Opens from the navbar or contact
 * footer via the UI store. Animates in/out with GSAP, locks background scroll,
 * and closes on Escape, backdrop click or the close button.
 */
export function TechModal() {
  const open = useUI((s) => s.aboutOpen);
  const closeAbout = useUI((s) => s.closeAbout);

  // Keep the node mounted for the exit animation, then unmount.
  const [mounted, setMounted] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  // Animate in when opening, out when closing.
  useIsomorphicLayoutEffect(() => {
    if (!mounted) return;
    const r = root.current;
    const p = panel.current;
    if (!r || !p) return;

    const ctx = gsap.context(() => {
      if (open) {
        gsap.fromTo(r, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, ease: 'power2.out' });
        gsap.fromTo(
          p,
          { y: 28, scale: 0.96, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'expo.out' },
        );
        gsap.fromTo(
          '[data-tech-item]',
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.015, delay: 0.08, ease: 'power2.out' },
        );
      } else {
        const tl = gsap.timeline({ onComplete: () => setMounted(false) });
        tl.to(p, { y: 18, scale: 0.97, opacity: 0, duration: 0.22, ease: 'power2.in' }).to(
          r,
          { autoAlpha: 0, duration: 0.2 },
          '<0.04',
        );
      }
    }, r);

    return () => ctx.revert();
  }, [open, mounted]);

  // Lock background scroll + Escape-to-close while open, and focus the dialog.
  useEffect(() => {
    if (!open) return;
    setScrollEnabled(false);
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAbout();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      setScrollEnabled(true);
    };
  }, [open, closeAbout]);

  if (!mounted) return null;

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Technologies used to build this site"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={closeAbout}
        className="absolute inset-0 cursor-default bg-void/70 backdrop-blur-md"
      />

      {/* Panel */}
      <div
        ref={panel}
        className="cyber-corners relative max-h-[88svh] w-full max-w-3xl overflow-y-auto border border-white/10 bg-panel/70 p-6 shadow-glass backdrop-blur-2xl sm:p-8"
      >
        <div className="scanlines pointer-events-none absolute inset-0 opacity-20" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.35em] text-neon-cyan/80">
              <Cpu className="h-3.5 w-3.5" /> // colophon
            </p>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl">
              Built With
            </h2>
            <p className="mt-2 max-w-md font-mono text-xs leading-relaxed text-white/50">
              The toolchain powering this scene — real-time 3D, motion and the
              glassmorphism front-end.
            </p>
          </div>

          <button
            ref={closeBtn}
            onClick={closeAbout}
            aria-label="Close dialog"
            className="clip-corner flex h-10 w-10 shrink-0 items-center justify-center border border-white/15 bg-white/[0.04] text-white/70 transition-colors hover:border-neon-cyan/60 hover:text-neon-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mt-8 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
          {TECH_STACK.map((group) => (
            <div key={group.title}>
              <h3
                className={cn(
                  'mb-4 font-display text-xs font-bold uppercase tracking-[0.3em]',
                  ACCENT_TEXT[group.accent],
                )}
              >
                {group.title}
              </h3>
              <ul className="space-y-2.5">
                {group.items.map((tech) => (
                  <li key={tech.name} data-tech-item>
                    <a
                      href={tech.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-mono text-sm text-white/90">
                          {tech.name}
                        </span>
                        <span className="block truncate font-mono text-[11px] text-white/40">
                          {tech.role}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-white/30 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neon-cyan" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="relative mt-8 border-t border-white/5 pt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
          press esc or click outside to close
        </p>
      </div>
    </div>
  );
}
