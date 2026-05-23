import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { ACCENTS, type Accent } from '@/lib/cards';

interface AboutPanelProps {
  open: boolean;
  onClose: () => void;
}

interface FeatureRow {
  accent: Accent;
  title: string;
  body: string;
}

const FEATURES: FeatureRow[] = [
  { accent: 'violet', title: 'Draggable cards', body: 'Every card is a chamfered Matter.js rigid body.' },
  { accent: 'pink', title: 'Elastic hover', body: 'Springy GSAP elastic pop on every card face.' },
  { accent: 'cyan', title: 'Magnetic cursor', body: 'Trailing two-part cursor; Magnet mode pulls orbs in.' },
  { accent: 'amber', title: 'Dynamic collisions', body: 'Impact rings and brightness pulses on every hit.' },
  { accent: 'lime', title: 'Floating particles', body: 'Bouncy orb bodies plus an ambient parallax canvas.' },
  { accent: 'cyan', title: 'Smooth interpolation', body: '`quickTo` cursor and eased particle parallax.' },
  { accent: 'violet', title: 'Modern dark UI', body: 'Glassy cards, accent glows, live FPS / hit / body HUD.' },
  { accent: 'pink', title: 'Mobile support', body: 'Touch dragging, layout scale, reduced-motion fallbacks.' },
];

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['G'], label: 'Toggle gravity' },
  { keys: ['M'], label: 'Toggle magnet' },
  { keys: ['S'], label: 'Toggle slow-mo' },
  { keys: ['E', 'Space'], label: 'Explode' },
  { keys: ['R'], label: 'Reset' },
  { keys: ['?', 'I'], label: 'Open this panel' },
  { keys: ['Esc'], label: 'Close this panel' },
];

const STACK: { name: string; version?: string; role: string }[] = [
  { name: 'React', version: '18', role: 'UI runtime' },
  { name: 'Matter.js', version: '0.20', role: 'Rigid-body 2D physics' },
  { name: 'GSAP', version: '3', role: 'Tweens · elastic eases · quickTo' },
  { name: 'TypeScript', role: 'Strict static types' },
  { name: 'Tailwind CSS', version: '3', role: 'Utility-first styling' },
  { name: 'Vite', version: '5', role: 'Bundler / dev server' },
];

const SOURCE_URL = 'https://github.com/YuraTadevosyan/three-js-and-animations';
const LANDING_URL = '/three-js-and-animations/';

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-400">
      {children}
    </h3>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-1.5 font-mono text-[11px] font-medium text-ink-100 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.4)]">
      {children}
    </kbd>
  );
}

export function AboutPanel({ open, onClose }: AboutPanelProps) {
  // Lock background scroll while the panel is open — defensive, even though
  // the root is already overflow:hidden.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
    >
      <button
        type="button"
        aria-label="Close about panel"
        onClick={onClose}
        data-cursor="button"
        className="absolute inset-0 bg-ink-950/65 backdrop-blur-md"
      />

      <div
        className={cn(
          'relative flex max-h-[calc(100dvh-4rem)] w-full max-w-[760px] flex-col',
          'rounded-2xl border border-white/10 bg-ink-900/90 backdrop-blur-xl',
          'shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]',
        )}
      >
        <header className="flex items-start justify-between border-b border-white/5 px-6 pb-4 pt-6 sm:px-8">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-ink-300">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink-100" />
              About
            </div>
            <h2 id="about-title" className="mt-2 text-2xl font-semibold text-ink-100">
              Physics Playground
            </h2>
            <p className="mt-1 max-w-[58ch] text-[13px] leading-relaxed text-ink-300">
              A physics-based interactive UI playground — every card is a real
              rigid body. Matter.js handles motion, GSAP handles feel, and the
              cards are plain HTML synced to the simulation each frame.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-cursor="button"
            className={cn(
              'grid h-8 w-8 shrink-0 place-items-center rounded-lg',
              'border border-white/10 text-ink-200 transition-colors',
              'hover:border-white/20 hover:bg-white/5 hover:text-white',
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </header>

        <div className="no-scrollbar space-y-6 overflow-y-auto px-6 py-5 sm:px-8">
          <section>
            <SectionLabel>Features</SectionLabel>
            <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FEATURES.map((f) => {
                const c = ACCENTS[f.accent];
                return (
                  <li
                    key={f.title}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                  >
                    <span
                      className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ background: c.hex, boxShadow: `0 0 10px ${c.hex}` }}
                    />
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-ink-100">{f.title}</div>
                      <div className="text-[11px] leading-relaxed text-ink-300">{f.body}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <SectionLabel>Controls</SectionLabel>
            <ul className="mt-2 space-y-1.5 text-[12px] leading-relaxed text-ink-300">
              <li>
                <span className="text-ink-100">Drag</span> a card or orb to fling it — mouse or touch.
              </li>
              <li>
                <span className="text-ink-100">Hover</span> a card for an elastic GSAP pop.
              </li>
              <li>
                <span className="text-ink-100">Bottom dock</span> toggles Gravity, Magnet, Slow-mo, plus Explode and Reset.
              </li>
            </ul>

            <h4 className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
              Keyboard
            </h4>
            <ul className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
              {SHORTCUTS.map((s) => (
                <li
                  key={s.label}
                  className="flex items-center justify-between gap-3 text-[12px] text-ink-300"
                >
                  <span>{s.label}</span>
                  <span className="flex items-center gap-1">
                    {s.keys.map((k, i) => (
                      <span key={k} className="flex items-center gap-1">
                        {i > 0 && <span className="text-ink-500">/</span>}
                        <Kbd>{k}</Kbd>
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionLabel>Stack</SectionLabel>
            <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {STACK.map((item) => (
                <li
                  key={item.name}
                  className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-ink-200" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-medium text-ink-100">
                        {item.name}
                      </span>
                      {item.version && (
                        <span className="font-mono text-[10px] tabular-nums text-ink-400">
                          v{item.version}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] leading-relaxed text-ink-300">
                      {item.role}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-white/5 px-6 py-3 sm:px-8">
          <a
            href={LANDING_URL}
            data-cursor="button"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-200 transition-colors hover:text-white"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            All showcases
          </a>
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="button"
            className="text-[11px] font-medium text-ink-200 transition-colors hover:text-white"
          >
            View source ↗
          </a>
        </footer>
      </div>
    </div>
  );
}
