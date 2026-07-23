import { Radio, Ruler, Sparkles, X } from 'lucide-react';
import { useUniverse } from '@/state/universeStore';
import type { WorldDesc } from '@/lib/worldgen';

const TYPE_LABEL: Record<WorldDesc['type'], string> = {
  planet: 'Terrestrial',
  island: 'Floating island',
  gas: 'Gas giant',
  crystal: 'Crystalline',
  monolith: 'Anomaly',
};

function Swatch({ color }: { color: string }) {
  return (
    <span
      className="h-4 w-4 rounded-full ring-1 ring-white/20"
      style={{ backgroundColor: color }}
    />
  );
}

/** Slide-in dossier for the world currently being scanned. */
export function FocusPanel() {
  const { focus, setFocus } = useUniverse();
  if (!focus) return null;

  const p = focus.palette;
  const pos = focus.position;

  return (
    <div className="animate-slide-in absolute right-5 top-24 z-20 w-[300px]">
      <div className="glass-strong overflow-hidden rounded-2xl">
        <div className="relative px-5 pb-4 pt-5">
          <button
            onClick={() => setFocus(null)}
            className="pointer-events-auto absolute right-3 top-3 rounded-full p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Release (Esc)"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="text-[10px] uppercase tracking-[0.22em] text-plasma/80">
            {focus.designation}
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            {focus.name}
          </h2>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/70">
              {TYPE_LABEL[focus.type]}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/70">
              {focus.biomeName}
            </span>
            {focus.ring && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/70">
                Ringed
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3 border-t border-white/10 px-5 py-4">
          <div className="flex items-center gap-2 text-[12px] text-white/60">
            <Ruler className="h-3.5 w-3.5 text-white/40" />
            Radius
            <span className="ml-auto font-mono text-white/85">
              {(focus.size * 1000).toFixed(0)} km
            </span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-white/60">
            <Radio className="h-3.5 w-3.5 text-white/40" />
            Sector
            <span className="ml-auto font-mono text-white/85">
              {`${pos.x.toFixed(0)} · ${pos.y.toFixed(0)} · ${focus.slot}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-white/60">
            Palette
            <span className="ml-auto flex gap-1.5">
              <Swatch color={`#${p.low.getHexString()}`} />
              <Swatch color={`#${p.mid.getHexString()}`} />
              <Swatch color={`#${p.high.getHexString()}`} />
              <Swatch color={`#${p.atmosphere.getHexString()}`} />
            </span>
          </div>
        </div>

        {focus.isEgg && focus.secret && (
          <div className="border-t border-nebula/30 bg-nebula/10 px-5 py-4">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-nebula">
              <Sparkles className="h-3.5 w-3.5" />
              Anomaly decoded
            </div>
            <p className="text-[13px] italic leading-relaxed text-white/80">
              “{focus.secret}”
            </p>
          </div>
        )}

        <button
          onClick={() => setFocus(null)}
          className="pointer-events-auto w-full border-t border-white/10 py-3 text-[12px] font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
        >
          Release · Esc
        </button>
      </div>
    </div>
  );
}
