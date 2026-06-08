import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

import { CALIPERS, PAINTS, WHEELS } from '@/lib/config';
import { useConfig } from '@/state/configStore';
import { cn } from '@/lib/cn';
import { WheelPreview } from './WheelPreview';

function Section({
  index,
  title,
  hint,
  children,
}: {
  index: string;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="px-5 py-4">
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.2em] text-white/80">
          <span className="font-mono text-[10px] text-neon/70">{index}</span>
          {title}
        </h2>
        {hint && <span className="text-[11px] text-white/40">{hint}</span>}
      </header>
      {children}
    </section>
  );
}

export function ConfiguratorPanel() {
  const { paint, setPaint, wheel, setWheel, caliper, setCaliper } = useConfig();

  return (
    <div
      data-ui-enter="panel"
      className="glass pointer-events-auto flex w-full flex-col overflow-hidden rounded-2xl lg:w-[360px]"
    >
      {/* Header / live summary */}
      <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
            Your build
          </p>
          <p className="mt-0.5 text-sm font-medium text-white">{paint.name}</p>
        </div>
        <span
          className="h-8 w-8 rounded-full border border-white/20 shadow-inner"
          style={{ background: paint.hex }}
        />
      </div>

      <div className="no-scrollbar divide-y divide-white/8 overflow-y-auto">
        {/* Paint */}
        <Section index="01" title="Paint" hint={paint.name}>
          <div className="grid grid-cols-8 gap-2 lg:grid-cols-4">
            {PAINTS.map((p) => {
              const active = p.id === paint.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  title={p.name}
                  onClick={() => setPaint(p)}
                  className={cn(
                    'relative aspect-square rounded-full border transition-transform duration-200 hover:scale-105',
                    active
                      ? 'border-neon ring-2 ring-neon/40'
                      : 'border-white/15',
                  )}
                  style={{ background: p.hex }}
                >
                  {active && (
                    <Check
                      size={14}
                      className="absolute inset-0 m-auto text-white mix-blend-difference"
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Wheels */}
        <Section index="02" title="Wheels" hint={`${WHEELS.length} sets`}>
          <div className="flex flex-col gap-2">
            {WHEELS.map((w) => {
              const active = w.id === wheel.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWheel(w)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200',
                    active
                      ? 'border-neon/50 bg-neon/[0.07]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]',
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0 rounded-full p-1 transition-transform duration-300',
                      active && 'rotate-180',
                    )}
                  >
                    <WheelPreview wheel={w} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-white">
                      {w.name}
                    </span>
                    <span className="block truncate text-[11px] text-white/45">
                      {w.blurb}
                    </span>
                  </span>
                  {active && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-neon shadow-[0_0_10px_2px_rgba(61,215,255,0.7)]" />
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Calipers */}
        <Section index="03" title="Brakes" hint={caliper.name}>
          <div className="flex items-center gap-2.5">
            {CALIPERS.map((cp) => {
              const active = cp.id === caliper.id;
              return (
                <button
                  key={cp.id}
                  type="button"
                  title={cp.name}
                  onClick={() => setCaliper(cp)}
                  className={cn(
                    'h-8 w-8 rounded-lg border transition-transform duration-200 hover:scale-110',
                    active ? 'border-white ring-2 ring-white/30' : 'border-white/15',
                  )}
                  style={{ background: cp.hex }}
                />
              );
            })}
            <span className="ml-1 text-xs text-white/55">{caliper.name}</span>
          </div>
        </Section>
      </div>
    </div>
  );
}
