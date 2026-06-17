import { Check, Pipette } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  BEAM_MODES,
  beamSetting,
  HEADLIGHT_COLORS,
  PAINT_FINISHES,
  PAINTS,
  SCENES,
  TAILLIGHT_COLORS,
  WHEEL_FINISHES,
  WHEEL_STYLES,
  WHEEL_SURFACES,
} from '@/lib/config';
import { useConfig } from '@/state/configStore';
import { cn } from '@/lib/cn';
import { WheelPreview } from './WheelPreview';
import { ColorField } from './ColorField';

function TogglePill({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all',
        on
          ? 'border-neon/50 bg-neon/15 text-neon'
          : 'border-white/10 bg-white/[0.03] text-white/45 hover:text-white',
      )}
    >
      {on ? 'On' : 'Off'}
    </button>
  );
}

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
        {hint && <span className="max-w-[55%] truncate text-[11px] text-white/40">{hint}</span>}
      </header>
      {children}
    </section>
  );
}

export function ConfiguratorPanel() {
  const {
    paint,
    setPaint,
    setCustomPaint,
    paintFinish,
    setPaintFinish,
    wheelStyle,
    setWheelStyle,
    wheelFinish,
    setWheelFinish,
    setCustomFinish,
    wheelSurface,
    setWheelSurface,
    headlightColor,
    setHeadlightColor,
    setCustomHeadlight,
    beamMode,
    setBeamMode,
    taillightColor,
    setTaillightColor,
    setCustomTaillight,
    windowTint,
    setWindowTint,
    carbonOn,
    toggleCarbon,
    scene,
    setScene,
  } = useConfig();

  const customActive = paint.id === 'custom';
  const finishCustomActive = wheelFinish.id === 'custom';

  return (
    <div
      data-ui-enter="panel"
      className="glass pointer-events-auto flex max-h-[44vh] w-full flex-col overflow-hidden rounded-2xl lg:h-full lg:max-h-full lg:w-[360px]"
    >
      {/* Header / live summary */}
      <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">Your build</p>
          <p className="mt-0.5 truncate text-sm font-medium text-white">
            {paint.name} · {wheelStyle.name}
          </p>
        </div>
        <span
          className="h-8 w-8 shrink-0 rounded-full border border-white/20 shadow-inner"
          style={{ background: paint.hex }}
        />
      </div>

      <div className="no-scrollbar min-h-0 flex-1 divide-y divide-white/8 overflow-y-auto">
        {/* Paint */}
        <Section index="01" title="Paint" hint={paint.name}>
          <div className="grid grid-cols-8 gap-2 lg:grid-cols-6">
            {PAINTS.map((p) => {
              const active = p.id === paint.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  title={p.name}
                  onClick={() => setPaint(p)}
                  className={cn(
                    'relative aspect-square rounded-full border transition-transform duration-200 hover:scale-110',
                    active ? 'border-neon ring-2 ring-neon/40' : 'border-white/15',
                  )}
                  style={{ background: p.hex }}
                >
                  {active && (
                    <Check
                      size={13}
                      className="absolute inset-0 m-auto text-white mix-blend-difference"
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom colour picker */}
          <label
            className={cn(
              'mt-3 flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
              customActive
                ? 'border-neon/50 bg-neon/[0.07]'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20',
            )}
          >
            <span
              className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-white/20"
              style={{ background: customActive ? paint.hex : 'conic-gradient(from 0deg, #ff4d3d, #f2c20b, #15d6a0, #3dd7ff, #5b2a8c, #ff4d3d)' }}
            >
              <input
                type="color"
                value={customActive ? paint.hex : '#15d6a0'}
                onChange={(e) => setCustomPaint(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Custom paint colour"
              />
              {!customActive && <Pipette size={13} className="relative text-white drop-shadow" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-white">Custom colour</span>
              <span className="block text-[11px] text-white/45">
                {customActive ? paint.hex.toUpperCase() : 'Pick any shade you like'}
              </span>
            </span>
          </label>

          {/* Paint finish (surface type) */}
          <div className="mt-3">
            <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-white/40">
              Finish · <span className="text-white/70">{paintFinish.name}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PAINT_FINISHES.map((f) => {
                const active = f.id === paintFinish.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPaintFinish(f)}
                    className={cn(
                      'rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-all duration-200',
                      active
                        ? 'border-neon/50 bg-neon/10 text-neon'
                        : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white',
                    )}
                  >
                    {f.name}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Wheel style (geometry) */}
        <Section index="02" title="Wheels" hint={wheelStyle.name}>
          <div className="grid grid-cols-2 gap-2">
            {WHEEL_STYLES.map((w) => {
              const active = w.id === wheelStyle.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWheelStyle(w)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-all duration-200',
                    active
                      ? 'border-neon/50 bg-neon/[0.07]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]',
                  )}
                >
                  <span className="shrink-0">
                    <WheelPreview style={w} color={wheelFinish.hex} size={38} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-white">
                      {w.name}
                    </span>
                    <span className="block truncate text-[10px] text-white/45">{w.blurb}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Wheel + caliper finish */}
        <Section index="03" title="Finish" hint={`${wheelFinish.name} · ${wheelSurface.name}`}>
          <div className="grid grid-cols-9 gap-2 lg:grid-cols-6">
            {WHEEL_FINISHES.map((f) => {
              const active = f.id === wheelFinish.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  title={f.name}
                  onClick={() => setWheelFinish(f)}
                  className={cn(
                    'relative aspect-square rounded-full border transition-transform duration-200 hover:scale-110',
                    active ? 'border-neon ring-2 ring-neon/40' : 'border-white/15',
                  )}
                  style={{ background: f.hex }}
                >
                  {active && (
                    <Check
                      size={12}
                      className="absolute inset-0 m-auto text-white mix-blend-difference"
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom rim colour picker */}
          <label
            className={cn(
              'mt-3 flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
              finishCustomActive
                ? 'border-neon/50 bg-neon/[0.07]'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20',
            )}
          >
            <span
              className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-white/20"
              style={{
                background: finishCustomActive
                  ? wheelFinish.hex
                  : 'conic-gradient(from 0deg, #ff4d3d, #f2c20b, #15d6a0, #3dd7ff, #5b2a8c, #ff4d3d)',
              }}
            >
              <input
                type="color"
                value={finishCustomActive ? wheelFinish.hex : '#c0392b'}
                onChange={(e) => setCustomFinish(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Custom rim colour"
              />
              {!finishCustomActive && <Pipette size={13} className="relative text-white drop-shadow" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-white">Custom rim colour</span>
              <span className="block text-[11px] text-white/45">
                {finishCustomActive ? wheelFinish.hex.toUpperCase() : 'Pick any rim shade'}
              </span>
            </span>
          </label>

          {/* Wheel surface (finish type) */}
          <div className="mt-3">
            <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-white/40">
              Surface · <span className="text-white/70">{wheelSurface.name}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {WHEEL_SURFACES.map((s) => {
                const active = s.id === wheelSurface.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setWheelSurface(s)}
                    className={cn(
                      'rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-all duration-200',
                      active
                        ? 'border-neon/50 bg-neon/10 text-neon'
                        : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:text-white',
                    )}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-2.5 text-[11px] leading-relaxed text-white/35">
            Colour &amp; surface apply to the rims and the brake calipers together.
          </p>
        </Section>

        {/* Headlight beam mode + colour */}
        <Section index="04" title="Headlights" hint={beamSetting(beamMode).full}>
          <div className="mb-3 flex items-center gap-1.5">
            {BEAM_MODES.map((b) => {
              const active = b.id === beamMode;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBeamMode(b.id)}
                  className={cn(
                    'flex-1 rounded-lg border px-2 py-1.5 text-[12px] font-semibold transition-all duration-200',
                    active
                      ? 'border-neon/50 bg-neon/10 text-neon'
                      : 'border-white/10 bg-white/[0.02] text-white/55 hover:border-white/20 hover:text-white',
                  )}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
          <ColorField
            colors={HEADLIGHT_COLORS}
            active={headlightColor}
            onPick={setHeadlightColor}
            onCustom={setCustomHeadlight}
            customDefault="#eaf4ff"
            pickerLabel="Custom light colour"
          />
        </Section>

        {/* Taillight colour */}
        <Section index="05" title="Taillights" hint={taillightColor.name}>
          <ColorField
            colors={TAILLIGHT_COLORS}
            active={taillightColor}
            onPick={setTaillightColor}
            onCustom={setCustomTaillight}
            customDefault="#ff1f1f"
            pickerLabel="Custom taillight colour"
          />
        </Section>

        {/* Window tint */}
        <Section index="06" title="Windows" hint={`${Math.round(windowTint * 100)}% tint`}>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-white/40">Clear</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={windowTint}
              onChange={(e) => setWindowTint(parseFloat(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/15 accent-neon"
              aria-label="Window tint"
            />
            <span className="text-[11px] text-white/40">Limo</span>
          </div>
        </Section>

        {/* Carbon parts */}
        <Section index="07" title="Carbon" hint={carbonOn ? 'Carbon' : 'Body colour'}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/45">Hood vents, spoiler &amp; diffuser</span>
            <TogglePill on={carbonOn} onClick={toggleCarbon} />
          </div>
        </Section>

        {/* Scene / garage mood */}
        <Section index="08" title="Scene" hint={scene.name}>
          <div className="grid grid-cols-2 gap-2">
            {SCENES.map((s) => {
              const active = s.id === scene.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScene(s)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-all duration-200',
                    active
                      ? 'border-neon/50 bg-neon/[0.07]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]',
                  )}
                >
                  <span
                    className="h-6 w-6 shrink-0 rounded-full border border-white/20"
                    style={{
                      background: `linear-gradient(135deg, ${s.accentA}, ${s.accentB})`,
                    }}
                  />
                  <span className="truncate text-[12px] font-medium text-white">{s.name}</span>
                </button>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}
