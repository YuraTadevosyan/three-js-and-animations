import { useId } from 'react';
import type { ControlSpec, ParamValue, Params } from '@/lib/types';
import { cn } from '@/lib/cn';
import { sound } from '@/lib/sound';

interface ControlPanelProps {
  title: string;
  subtitle: string;
  accent: string;
  controls: ControlSpec[];
  values: Params;
  onChange: (key: string, value: ParamValue) => void;
  onReset: () => void;
}

export function ControlPanel({
  title,
  subtitle,
  accent,
  controls,
  values,
  onChange,
  onReset,
}: ControlPanelProps) {
  return (
    <aside
      className={cn(
        'pointer-events-auto absolute right-4 top-4 z-20',
        'w-[280px] sm:w-[300px] max-h-[calc(100dvh-2rem)]',
        'rounded-2xl border border-white/5 bg-ink-900/70 backdrop-blur-xl',
        'shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)]',
        'flex flex-col animate-slide-in-right',
      )}
    >
      <header className="px-5 pt-5 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
          />
          <h2 className="text-[13px] font-semibold tracking-wide uppercase text-ink-100">
            {title}
          </h2>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-ink-300">{subtitle}</p>
      </header>

      <div className="overflow-y-auto no-scrollbar px-5 py-4 space-y-4">
        {controls.map((c) => (
          <Control key={c.key} spec={c} value={values[c.key]} accent={accent} onChange={onChange} />
        ))}
      </div>

      <footer className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.18em] text-ink-400">Controls</span>
        <button
          type="button"
          onPointerEnter={() => sound.hover()}
          onClick={() => {
            sound.click();
            onReset();
          }}
          className={cn(
            'text-[11px] font-medium text-ink-200 hover:text-white',
            'px-2 py-1 rounded-md border border-white/5 hover:border-white/15',
            'transition-colors',
          )}
        >
          Reset
        </button>
      </footer>
    </aside>
  );
}

function Control({
  spec,
  value,
  accent,
  onChange,
}: {
  spec: ControlSpec;
  value: ParamValue;
  accent: string;
  onChange: (key: string, value: ParamValue) => void;
}) {
  const id = useId();
  if (spec.type === 'range') {
    const v = typeof value === 'number' ? value : spec.default;
    const pct = Math.max(
      0,
      Math.min(100, ((v - spec.min) / (spec.max - spec.min)) * 100),
    );
    // Fill is painted onto the slider's own track via a linear-gradient so it
    // stays aligned with the thumb (browsers add implicit half-thumb padding
    // that an overlay div can't match).
    const trackStyle = {
      background: `linear-gradient(to right, ${accent} 0%, ${accent} ${pct}%, rgba(255,255,255,0.10) ${pct}%, rgba(255,255,255,0.10) 100%)`,
    };
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <label htmlFor={id} className="text-ink-200">{spec.label}</label>
          <span className="font-mono tabular-nums text-ink-300">
            {formatNumber(v, spec.step)}
            {spec.unit ?? ''}
          </span>
        </div>
        <input
          id={id}
          className="lab-range"
          type="range"
          min={spec.min}
          max={spec.max}
          step={spec.step}
          value={v}
          style={trackStyle}
          onPointerEnter={() => sound.hover()}
          onPointerDown={() => sound.click()}
          onChange={(e) => onChange(spec.key, Number(e.target.value))}
        />
      </div>
    );
  }

  if (spec.type === 'toggle') {
    const checked = Boolean(value);
    return (
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[11px] text-ink-200">{spec.label}</label>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          onPointerEnter={() => sound.hover()}
          onClick={() => {
            if (checked) sound.toggleOff();
            else sound.toggleOn();
            onChange(spec.key, !checked);
          }}
          className={cn(
            'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
            'border border-white/10',
            checked ? 'bg-white/15' : 'bg-white/5',
          )}
          style={checked ? { boxShadow: `0 0 0 1px ${accent}80 inset` } : undefined}
        >
          <span
            className="inline-block h-3.5 w-3.5 rounded-full bg-ink-100 shadow-md transition-transform"
            style={{
              transform: checked ? 'translateX(18px)' : 'translateX(2px)',
              background: checked ? accent : '#e4e7ef',
            }}
          />
        </button>
      </div>
    );
  }

  // color (currently unused but here for completeness)
  const colorVal = typeof value === 'string' ? value : spec.default;
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-[11px] text-ink-200">{spec.label}</label>
      <input
        id={id}
        type="color"
        value={colorVal}
        onChange={(e) => onChange(spec.key, e.target.value)}
        className="h-6 w-9 rounded border border-white/10 bg-transparent"
      />
    </div>
  );
}

function formatNumber(v: number, step: number): string {
  const decimals = step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0;
  return v.toFixed(decimals);
}
