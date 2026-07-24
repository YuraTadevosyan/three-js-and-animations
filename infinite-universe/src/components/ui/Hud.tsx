import { Zap } from 'lucide-react';
import { UNIVERSE } from '@/lib/config';
import { cn, formatLightYears } from '@/lib/cn';
import { useUniverse } from '@/state/universeStore';
import { useTelemetry } from '@/hooks/useTelemetry';
import { Brand } from './Brand';
import { About } from './About';

const SPEED_LABELS = ['Slow', 'Cruise', 'Fast', 'Blink'];

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">
        {label}
      </span>
      <span className="font-mono text-sm tabular-nums text-white/90">
        {value}
        {unit && <span className="ml-1 text-[11px] text-white/40">{unit}</span>}
      </span>
    </div>
  );
}

/** Persistent flight instrumentation, shown once the drift has begun. */
export function Hud() {
  const { started, speedLevel, setSpeedLevel, triggerWarp } = useUniverse();
  const tele = useTelemetry(started);

  if (!started) return null;

  return (
    <>
      {/* Top-left brand */}
      <div className="pointer-events-none absolute left-5 top-5 z-20 flex items-center gap-3">
        <Brand />
        <About />
      </div>

      {/* Top-right telemetry */}
      <div className="animate-fade-in absolute right-5 top-5 z-20">
        <div className="glass flex items-center gap-6 rounded-2xl px-5 py-3">
          <Stat label="Distance" value={formatLightYears(tele.distance)} unit="ly" />
          <div className="h-8 w-px bg-white/10" />
          <Stat label="Worlds charted" value={tele.charted.toLocaleString()} />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="animate-fade-in absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-3 px-4">
        <div className="glass flex items-center gap-1 rounded-full p-1">
          {UNIVERSE.speedLevels.map((mul, i) => (
            <button
              key={i}
              onClick={() => setSpeedLevel(i)}
              className={cn(
                'pointer-events-auto rounded-full px-4 py-1.5 text-[12px] font-medium transition',
                i === speedLevel
                  ? 'bg-white/90 text-void shadow'
                  : 'text-white/55 hover:text-white/90',
              )}
              title={`${mul}× cruise`}
            >
              {SPEED_LABELS[i]}
            </button>
          ))}
          <div className="mx-1 h-5 w-px bg-white/10" />
          <button
            onClick={triggerWarp}
            className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-gradient-to-r from-nebula to-plasma px-4 py-1.5 text-[12px] font-semibold text-void shadow-[0_0_18px_-4px_rgba(124,92,255,0.9)] transition hover:brightness-110"
          >
            <Zap className="h-3.5 w-3.5" strokeWidth={2.4} />
            Warp
          </button>
        </div>
        <p className="text-[11px] text-white/35">
          Move to steer · click a world to scan · scroll to change speed
        </p>
      </div>
    </>
  );
}
