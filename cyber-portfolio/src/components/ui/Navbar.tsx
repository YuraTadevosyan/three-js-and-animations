'use client';

import { Info } from 'lucide-react';
import { useScene } from '@/store/useScene';
import { useUI } from '@/store/useUI';
import { scrollToSection } from '@/components/providers/SmoothScroll';
import { NAV_LINKS, PROFILE } from '@/lib/data';
import { cn } from '@/lib/cn';

/**
 * Fixed glass navbar. The active link is driven by the scene store (set by
 * each <Section> as it scrolls through centre), so the highlight always
 * matches what the camera is looking at.
 */
export function Navbar() {
  const active = useScene((s) => s.active);
  const openAbout = useUI((s) => s.openAbout);

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4">
      <nav className="flex w-full max-w-6xl items-center justify-between gap-4 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 shadow-glass backdrop-blur-xl">
        <button
          onClick={() => scrollToSection('hero')}
          className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.3em] text-white"
        >
          <span className="h-2 w-2 animate-pulse-glow rounded-full bg-neon-cyan shadow-neon" />
          {PROFILE.handle}
        </button>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => scrollToSection(link.id)}
                className={cn(
                  'relative px-3 py-1.5 font-mono text-xs uppercase tracking-[0.2em] transition-colors',
                  active === link.id
                    ? 'text-neon-cyan'
                    : 'text-white/55 hover:text-white',
                )}
              >
                {active === link.id && (
                  <span className="absolute inset-0 -z-[1] rounded-md bg-neon-cyan/10 shadow-neon" />
                )}
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            onClick={openAbout}
            aria-label="About this build — technologies used"
            title="Built with…"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-neon-cyan/60 hover:text-neon-cyan"
          >
            <Info className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="clip-corner bg-neon-cyan/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-neon-cyan transition-colors hover:bg-neon-cyan/20"
          >
            Connect
          </button>
        </div>
      </nav>
    </header>
  );
}
