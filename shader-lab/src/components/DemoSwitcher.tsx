import { cn } from '@/lib/cn';
import { DEMOS } from '@/lib/demos';
import { sound } from '@/lib/sound';
import { useSoundEnabled } from '@/hooks/useSoundEnabled';
import { LANDING_URL } from '@/lib/links';

interface DemoSwitcherProps {
  activeId: string;
  onSelect: (id: string) => void;
  onAboutClick: () => void;
}

export function DemoSwitcher({ activeId, onSelect, onAboutClick }: DemoSwitcherProps) {
  const { enabled: soundOn, toggle: toggleSound } = useSoundEnabled();
  return (
    <nav
      className={cn(
        'pointer-events-auto absolute left-4 top-4 z-20',
        'flex items-center flex-wrap gap-1 p-1 rounded-2xl',
        'max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-340px)]',
        'border border-white/5 bg-ink-900/70 backdrop-blur-xl',
        'shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)]',
        'animate-fade-in',
      )}
      aria-label="Demo selector"
    >
      <a
        href={LANDING_URL}
        onPointerEnter={() => sound.hover()}
        onClick={() => sound.click()}
        aria-label="Back to all showcases"
        className={cn(
          'hidden sm:inline-flex items-center gap-2 pl-3 pr-2',
          'text-[11px] uppercase tracking-[0.22em] text-ink-300',
          'hover:text-ink-100 transition-colors group',
        )}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-60 group-hover:opacity-100 transition-opacity"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Shader Lab
      </a>
      {DEMOS.map((d) => {
        const active = d.id === activeId;
        return (
          <button
            key={d.id}
            type="button"
            onPointerEnter={() => sound.hover()}
            onClick={() => {
              sound.click();
              onSelect(d.id);
            }}
            className={cn(
              'relative px-3 py-1.5 rounded-xl text-[12px] font-medium transition-colors',
              'border border-transparent',
              active
                ? 'text-white bg-white/10 border-white/10'
                : 'text-ink-300 hover:text-ink-100 hover:bg-white/5',
            )}
            style={active ? { boxShadow: `inset 0 0 0 1px ${d.accent}40` } : undefined}
          >
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: active ? d.accent : 'rgba(255,255,255,0.25)',
                  boxShadow: active ? `0 0 8px ${d.accent}` : undefined,
                }}
              />
              {d.name}
            </span>
          </button>
        );
      })}
      <span className="hidden sm:inline-block mx-1 h-5 w-px bg-white/10" aria-hidden />
      <button
        type="button"
        onClick={toggleSound}
        aria-label={soundOn ? 'Mute interface sounds' : 'Enable interface sounds'}
        aria-pressed={soundOn}
        className={cn(
          'h-7 w-7 grid place-items-center rounded-xl transition-colors',
          'border border-transparent text-ink-300 hover:text-ink-100 hover:bg-white/5',
        )}
      >
        {soundOn ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H3v6h3l5 4V5z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H3v6h3l5 4V5z" />
            <path d="M22 9l-6 6" />
            <path d="M16 9l6 6" />
          </svg>
        )}
      </button>
      <button
        type="button"
        onPointerEnter={() => sound.hover()}
        onClick={() => {
          sound.open();
          onAboutClick();
        }}
        aria-label="About this app"
        className={cn(
          'px-2.5 py-1.5 rounded-xl text-[12px] font-medium transition-colors',
          'border border-transparent text-ink-300 hover:text-ink-100 hover:bg-white/5',
          'inline-flex items-center gap-1.5',
        )}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <path d="M12 7.5v.5" />
        </svg>
        <span className="hidden sm:inline">About</span>
      </button>
    </nav>
  );
}
