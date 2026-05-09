import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { cn } from '@/lib/cn';

interface SliderProps {
  value: number;
  onChange: (v: number) => void;
  onScrubStart?: () => void;
  onScrubEnd?: () => void;
  ariaLabel: string;
  className?: string;
  fillClassName?: string;
  thumbClassName?: string;
  step?: number;
  disabled?: boolean;
}

export function Slider({
  value,
  onChange,
  onScrubStart,
  onScrubEnd,
  ariaLabel,
  className,
  fillClassName = 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-300',
  thumbClassName = 'bg-zinc-900 ring-2 ring-violet-500/40 dark:bg-white dark:ring-violet-400/40',
  step = 0.05,
  disabled,
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrubbing, setScrubbing] = useState(false);

  const computeRatio = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return value;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return value;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  };

  const handleDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    onChange(computeRatio(e.clientX));
    setScrubbing(true);
    onScrubStart?.();
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!scrubbing) return;
    onChange(computeRatio(e.clientX));
  };
  const handleUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!scrubbing) return;
    setScrubbing(false);
    onScrubEnd?.();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    let next = value;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(1, value + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(0, value - step);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 1;
    else return;
    e.preventDefault();
    onChange(next);
  };

  const pct = Math.max(0, Math.min(1, value)) * 100;

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-disabled={disabled}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onKeyDown={handleKey}
      className={cn(
        'group relative flex h-7 cursor-pointer select-none items-center touch-none',
        'focus-visible:outline-none',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <div
        className={cn(
          'relative w-full overflow-visible rounded-full bg-zinc-900/15 transition-[height] duration-150 dark:bg-white/15',
          scrubbing ? 'h-1.5' : 'h-1 group-hover:h-1.5 group-focus-visible:h-1.5',
        )}
      >
        <div
          className={cn('h-full rounded-full', fillClassName)}
          style={{ width: `${pct}%` }}
        />
        <div
          className={cn(
            'pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.45)] transition-opacity duration-150',
            scrubbing
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
            thumbClassName,
          )}
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}
