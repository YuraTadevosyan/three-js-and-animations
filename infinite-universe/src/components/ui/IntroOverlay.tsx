import { MousePointer2, Orbit, Sparkles, Gauge } from 'lucide-react';
import { useUniverse } from '@/state/universeStore';

const CONTROLS = [
  { icon: MousePointer2, label: 'Move to steer', hint: 'the mouse trims your heading' },
  { icon: Orbit, label: 'Click a world', hint: 'fly in and scan it' },
  { icon: Gauge, label: 'Scroll', hint: 'change cruising speed' },
  { icon: Sparkles, label: 'Release with Esc', hint: 'and drift on' },
];

/** The landing veil shown over the already-drifting cosmos. */
export function IntroOverlay() {
  const { begin } = useUniverse();

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-b from-void/70 via-void/40 to-void/80 px-6">
      <div className="animate-fade-up max-w-xl text-center">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-plasma/90">
          <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-plasma" />
          No beginning · No end
        </p>

        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          <span className="text-cosmic">Infinite Universe</span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-white/65">
          Fall forever through a procedurally generated cosmos of floating
          islands and glowing worlds, threaded together by light. Every horizon
          becomes the next. Some worlds keep secrets.
        </p>

        <button
          onClick={begin}
          className="pointer-events-auto group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-plasma to-nebula px-7 py-3 text-sm font-semibold text-void shadow-[0_0_30px_-6px_rgba(40,224,255,0.7)] transition hover:shadow-[0_0_40px_-4px_rgba(124,92,255,0.9)]"
        >
          Begin the drift
          <span className="transition group-hover:translate-x-0.5">→</span>
        </button>

        <div className="mx-auto mt-10 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
          {CONTROLS.map(({ icon: Icon, label, hint }) => (
            <div
              key={label}
              className="glass rounded-xl px-3 py-3 text-left"
            >
              <Icon className="mb-1.5 h-4 w-4 text-plasma/90" strokeWidth={1.8} />
              <div className="text-[12px] font-medium text-white/85">{label}</div>
              <div className="text-[11px] leading-tight text-white/45">{hint}</div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[11px] italic tracking-wide text-white/30">
          The old codes still work out here.
        </p>
      </div>
    </div>
  );
}
