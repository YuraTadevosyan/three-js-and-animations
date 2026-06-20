'use client';

import { useScene } from '@/store/useScene';
import { scrollToSection } from '@/components/providers/SmoothScroll';
import { NAV_LINKS, PROFILE } from '@/lib/data';
import { cn } from '@/lib/cn';

/**
 * Non-interactive cyberpunk "HUD" chrome that frames the whole viewport:
 * scanline sweep, corner ticks, a live scroll-progress rail and a clickable
 * section tracker on the right edge. Sits above the canvas, below the content.
 */
export function Hud() {
  const progress = useScene((s) => s.progress);
  const active = useScene((s) => s.active);

  return (
    <>
      {/* CRT scanline sweep + static grain. */}
      <div className="pointer-events-none fixed inset-0 z-30 mix-blend-soft-light">
        <div className="scanlines absolute inset-0 opacity-[0.5]" />
        <div className="absolute inset-x-0 top-0 h-32 animate-scan bg-gradient-to-b from-neon-cyan/10 to-transparent" />
      </div>

      {/* Corner ticks. */}
      <div className="pointer-events-none fixed inset-4 z-30 hidden md:block">
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <span
            key={c}
            className={cn(
              'absolute h-5 w-5 border-neon-cyan/40',
              c === 'tl' && 'left-0 top-0 border-l border-t',
              c === 'tr' && 'right-0 top-0 border-r border-t',
              c === 'bl' && 'bottom-0 left-0 border-b border-l',
              c === 'br' && 'bottom-0 right-0 border-b border-r',
            )}
          />
        ))}
      </div>

      {/* Bottom status bar. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 hidden items-center justify-between px-6 pb-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 md:flex">
        <span>{PROFILE.location}</span>
        <span className="text-neon-cyan/70">
          sys.scroll {String(Math.round(progress * 100)).padStart(3, '0')}%
        </span>
        <span>lat 40.18 // lon 44.51</span>
      </div>

      {/* Scroll progress rail (top). */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[2px] bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-magenta shadow-neon"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Right-edge section tracker. */}
      <nav className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex">
        {NAV_LINKS.map((link) => (
          <button
            key={link.id}
            onClick={() => scrollToSection(link.id)}
            className="group flex items-center gap-2"
            aria-label={`Go to ${link.label}`}
          >
            <span
              className={cn(
                'font-mono text-[10px] uppercase tracking-[0.2em] transition-opacity',
                active === link.id
                  ? 'text-neon-cyan opacity-100'
                  : 'text-white/40 opacity-0 group-hover:opacity-100',
              )}
            >
              {link.label}
            </span>
            <span
              className={cn(
                'h-[2px] transition-all',
                active === link.id
                  ? 'w-8 bg-neon-cyan shadow-neon'
                  : 'w-4 bg-white/30 group-hover:w-6',
              )}
            />
          </button>
        ))}
      </nav>
    </>
  );
}
