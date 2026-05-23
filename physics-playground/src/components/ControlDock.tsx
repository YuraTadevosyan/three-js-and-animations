import type { ReactNode } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/cn';
import { useMagnetic } from '@/hooks/useMagnetic';

interface ControlDockProps {
  gravity: boolean;
  magnet: boolean;
  slowMo: boolean;
  onToggleGravity: () => void;
  onToggleMagnet: () => void;
  onToggleSlowMo: () => void;
  onExplode: () => void;
  onReset: () => void;
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const ICONS: Record<string, ReactNode> = {
  gravity: (
    <svg viewBox="0 0 24 24" width="18" height="18" {...stroke}>
      <path d="M12 3v11" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  ),
  magnet: (
    <svg viewBox="0 0 24 24" width="18" height="18" {...stroke}>
      <path d="M6 3v8a6 6 0 0 0 12 0V3" />
      <path d="M3 3h6v5H3zM15 3h6v5h-6z" />
    </svg>
  ),
  slowmo: (
    <svg viewBox="0 0 24 24" width="18" height="18" {...stroke}>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 13l3.5 -3" />
      <path d="M10 3h4" />
      <path d="M12 6v1" />
    </svg>
  ),
  explode: (
    <svg viewBox="0 0 24 24" width="18" height="18" {...stroke}>
      <path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5L19 19M19 5l-3.5 3.5M8.5 15.5L5 19" />
    </svg>
  ),
  reset: (
    <svg viewBox="0 0 24 24" width="18" height="18" {...stroke}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.8-6.3" />
      <path d="M3 4v5h5" />
    </svg>
  ),
};

function DockButton({
  icon,
  label,
  active,
  momentary,
  onClick,
}: {
  icon: keyof typeof ICONS;
  label: string;
  active?: boolean;
  momentary?: boolean;
  onClick: () => void;
}) {
  const ref = useMagnetic<HTMLButtonElement>(0.3);

  const handleClick = () => {
    if (momentary && ref.current) {
      gsap.fromTo(
        ref.current,
        { scale: 0.86 },
        { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' },
      );
    }
    onClick();
  };

  return (
    <button
      ref={ref}
      type="button"
      data-cursor="button"
      aria-pressed={momentary ? undefined : active}
      onClick={handleClick}
      className={cn(
        'pointer-events-auto flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium backdrop-blur-md transition-colors duration-200',
        active
          ? 'border-accent-cyan/50 bg-accent-cyan/15 text-ink-100'
          : 'border-white/[0.07] bg-ink-800/80 text-ink-300 hover:border-white/15 hover:text-ink-100',
      )}
    >
      <span className={cn(active ? 'text-accent-cyan' : 'text-ink-400')}>
        {ICONS[icon]}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/**
 * Bottom control bar. Each button is magnetic (drifts toward the pointer) and
 * the momentary ones get an elastic press. Toggle state is owned by the parent.
 */
export function ControlDock({
  gravity,
  magnet,
  slowMo,
  onToggleGravity,
  onToggleMagnet,
  onToggleSlowMo,
  onExplode,
  onReset,
}: ControlDockProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <DockButton
          icon="gravity"
          label={gravity ? 'Gravity' : 'Zero-G'}
          active={gravity}
          onClick={onToggleGravity}
        />
        <DockButton
          icon="magnet"
          label="Magnet"
          active={magnet}
          onClick={onToggleMagnet}
        />
        <DockButton
          icon="slowmo"
          label="Slow-mo"
          active={slowMo}
          onClick={onToggleSlowMo}
        />
        <DockButton icon="explode" label="Explode" momentary onClick={onExplode} />
        <DockButton icon="reset" label="Reset" momentary onClick={onReset} />
      </div>
    </div>
  );
}
