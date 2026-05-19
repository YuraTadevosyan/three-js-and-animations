import { useCallback, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { STACK } from '@/lib/stack';
import { DEMOS } from '@/lib/demos';
import { sound } from '@/lib/sound';
import { LANDING_URL } from '@/lib/links';

interface AboutPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AboutPanel({ open, onClose }: AboutPanelProps) {
  const dismiss = useCallback(() => {
    sound.close();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismiss]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
      className="fixed inset-0 z-30 flex items-center justify-center p-4 sm:p-8 animate-fade-in"
    >
      {/* Backdrop — click to dismiss */}
      <button
        type="button"
        aria-label="Close about panel"
        onClick={dismiss}
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-md"
      />

      <div
        className={cn(
          'relative w-full max-w-[760px] max-h-[calc(100dvh-4rem)] flex flex-col',
          'rounded-2xl border border-white/10 bg-ink-900/85 backdrop-blur-xl',
          'shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]',
        )}
      >
        <header className="flex items-start justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-ink-300">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink-100" />
              About
            </div>
            <h2 id="about-title" className="mt-2 text-2xl font-semibold text-ink-100">
              Shader Lab
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-300 max-w-[58ch]">
              A small playground for hand-written GLSL — {DEMOS.length} demos sharing one
              fullscreen canvas, with real-time controls, pointer-driven uniforms, and
              cross-faded transitions. Animation lives on the GPU; the React tree stays still.
            </p>
          </div>
          <button
            type="button"
            onPointerEnter={() => sound.hover()}
            onClick={dismiss}
            aria-label="Close"
            className={cn(
              'shrink-0 h-8 w-8 grid place-items-center rounded-lg',
              'border border-white/10 text-ink-200 hover:text-white hover:border-white/20',
              'hover:bg-white/5 transition-colors',
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </header>

        <div className="overflow-y-auto no-scrollbar px-6 sm:px-8 py-5 space-y-6">
          <section>
            <SectionLabel>Demos</SectionLabel>
            <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMOS.map((d) => (
                <li
                  key={d.id}
                  className={cn(
                    'group flex items-start gap-3 p-3 rounded-xl',
                    'border border-white/5 bg-white/[0.02] hover:bg-white/[0.04]',
                    'transition-colors',
                  )}
                >
                  <span
                    className="mt-1.5 inline-block h-2 w-2 rounded-full shrink-0"
                    style={{ background: d.accent, boxShadow: `0 0 10px ${d.accent}` }}
                  />
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-ink-100">{d.name}</div>
                    <div className="text-[11px] leading-relaxed text-ink-300">{d.tagline}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {STACK.map((group) => (
            <section key={group.title}>
              <SectionLabel>{group.title}</SectionLabel>
              <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onPointerEnter={() => sound.hover()}
                      onClick={() => sound.click()}
                      className={cn(
                        'group flex items-start gap-3 p-3 rounded-xl',
                        'border border-white/5 bg-white/[0.02] hover:bg-white/[0.05]',
                        'hover:border-white/10 transition-colors',
                      )}
                    >
                      <span
                        className="mt-1.5 inline-block h-2 w-2 rounded-full shrink-0"
                        style={{ background: item.accent, boxShadow: `0 0 10px ${item.accent}80` }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] font-medium text-ink-100">{item.name}</span>
                          {item.version && (
                            <span className="font-mono text-[10px] tabular-nums text-ink-400">
                              v{item.version}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] leading-relaxed text-ink-300">{item.role}</div>
                      </div>
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="mt-1.5 shrink-0 text-ink-500 group-hover:text-ink-200 transition-colors"
                      >
                        <path d="M7 17 17 7M9 7h8v8" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="px-6 sm:px-8 py-3 border-t border-white/5 flex items-center justify-between gap-4">
          <a
            href={LANDING_URL}
            onPointerEnter={() => sound.hover()}
            onClick={() => sound.click()}
            className="text-[11px] font-medium text-ink-200 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            All showcases
          </a>
          <a
            href="https://github.com/YuraTadevosyan/three-js-and-animations"
            target="_blank"
            rel="noopener noreferrer"
            onPointerEnter={() => sound.hover()}
            onClick={() => sound.click()}
            className="text-[11px] font-medium text-ink-200 hover:text-white transition-colors"
          >
            View source ↗
          </a>
        </footer>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] uppercase tracking-[0.22em] text-ink-400 font-semibold">
      {children}
    </h3>
  );
}
