import { forwardRef, useImperativeHandle, useRef } from 'react';

export interface HeaderApi {
  setFps(value: number): void;
  setCollisions(value: number): void;
}

interface HeaderProps {
  /** Total dynamic body count — fixed for the session. */
  bodies: number;
  /** Opens the About panel. */
  onAboutClick: () => void;
}

function Stat({
  label,
  valueRef,
  initial,
}: {
  label: string;
  valueRef?: React.Ref<HTMLSpanElement>;
  initial: string;
}) {
  return (
    <div className="flex flex-col items-end rounded-xl border border-white/5 bg-ink-800/70 px-3 py-1.5 backdrop-blur-md">
      <span
        ref={valueRef}
        className="font-mono text-sm font-semibold tabular-nums text-ink-100"
      >
        {initial}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink-400">
        {label}
      </span>
    </div>
  );
}

/**
 * Fixed top HUD — brand mark, title, and live readouts. FPS and collision
 * counters update through the imperative handle, never via React state, so the
 * physics loop can drive them every frame without re-rendering.
 */
export const Header = forwardRef<HeaderApi, HeaderProps>(({ bodies, onAboutClick }, ref) => {
  const fpsRef = useRef<HTMLSpanElement>(null);
  const colRef = useRef<HTMLSpanElement>(null);

  useImperativeHandle(
    ref,
    () => ({
      setFps(value) {
        if (fpsRef.current) fpsRef.current.textContent = String(value);
      },
      setCollisions(value) {
        if (colRef.current) colRef.current.textContent = String(value);
      },
    }),
    [],
  );

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-3 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{
            background:
              'linear-gradient(135deg, #22d3ee 0%, #818cf8 50%, #f472b6 100%)',
          }}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
            <rect
              x="4"
              y="7"
              width="11"
              height="11"
              rx="2.5"
              stroke="#06070d"
              strokeWidth="2"
              transform="rotate(-12 9.5 12.5)"
            />
            <circle cx="17.5" cy="8" r="3.2" fill="#06070d" />
          </svg>
        </span>
        <div className="leading-tight">
          <h1 className="text-base font-semibold text-ink-100 sm:text-lg">
            Physics Playground
          </h1>
          <p className="hidden text-xs text-ink-400 sm:block">
            Matter.js &middot; GSAP &middot; React
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Stat label="fps" valueRef={fpsRef} initial="60" />
        <Stat label="hits" valueRef={colRef} initial="0" />
        <Stat label="bodies" initial={String(bodies)} />
        <button
          type="button"
          onClick={onAboutClick}
          aria-label="About"
          data-cursor="button"
          className="pointer-events-auto grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-ink-800/70 text-ink-300 backdrop-blur-md transition-colors hover:border-white/15 hover:text-ink-100"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5" />
            <circle cx="12" cy="8" r="0.6" fill="currentColor" />
          </svg>
        </button>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
