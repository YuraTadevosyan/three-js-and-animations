import type { JSX } from 'preact'
import { FILE_COUNT } from '@/state/fs'
import { stats } from '@/state/telemetry'
import { openApp } from '@/state/windows'
import { formatUptime } from '@/lib/util'

const STACK: Array<[string, string]> = [
  ['Preact + @preact/signals', 'UI and OS state'],
  ['OGL', 'WebGL2 projection and the wireframe projector'],
  ['interact.js', 'window drag, resize and snap gestures'],
  ['Tailwind CSS', 'glass chrome and layout'],
  ['TypeScript + Vite', 'build'],
]

const REAL: string[] = [
  'The window manager — drag, resize, focus, z-order and edge snapping',
  'The WebGL projection and the wireframe projector you can spin',
  'The frame-rate counter in the System Monitor',
  'The file vault, shared byte-for-byte with the terminal',
]

const SIMULATED: string[] = [
  'CPU, GPU, memory, thermal and network telemetry — seeded value noise',
  'The atmospheric model — a weighted Markov chain over four stations',
  'NOVA — a keyword intent matcher, not a language model',
]

export function About(): JSX.Element {
  const s = stats.value

  return (
    <div class="h-full overflow-y-auto p-4">
      <div class="mb-4 flex items-start gap-3">
        <span class="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-primary/35" style={{ background: 'hsl(var(--primary) / 0.08)' }}>
          <svg viewBox="0 0 64 64" class="h-9 w-9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round">
            <path d="M32 8 55 21v22L32 56 9 43V21z" class="text-primary" />
            <path d="M32 8v48M9 21l46 22M55 21 9 43" stroke-width="1" opacity="0.4" class="text-primary" />
            <circle cx="32" cy="32" r="7.5" class="text-primary" />
          </svg>
        </span>
        <div class="min-w-0">
          <h1 class="font-mono text-base uppercase tracking-[0.18em] text-primary text-glow">Holographic OS</h1>
          <p class="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
            Holo-Kernel 4.2 · build 2026.08
          </p>
          <p class="mt-1.5 text-[0.78rem] leading-relaxed text-foreground/85">
            A futuristic desktop environment that runs entirely in a browser tab.
            No image files, no audio files and no network requests ship with it —
            every texture, sound-free animation and data series is generated at
            runtime.
          </p>
        </div>
      </div>

      <Section title="Stack">
        <dl class="space-y-1">
          {STACK.map(([name, role]) => (
            <div key={name} class="flex flex-wrap items-baseline gap-x-2 border-b border-primary/10 pb-1">
              <dt class="font-mono text-[0.68rem] text-primary">{name}</dt>
              <dd class="font-mono text-[0.6rem] text-muted-foreground">{role}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <div class="grid gap-3 sm:grid-cols-2">
        <Section title="Genuinely real">
          <ul class="space-y-1.5">
            {REAL.map((item) => (
              <li key={item} class="flex gap-2 text-[0.72rem] leading-snug text-foreground/85">
                <span class="mt-[3px] text-accent">✦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Simulated, offline">
          <ul class="space-y-1.5">
            {SIMULATED.map((item) => (
              <li key={item} class="flex gap-2 text-[0.72rem] leading-snug text-foreground/85">
                <span class="mt-[3px] text-primary/60">◇</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section title="This session">
        <dl class="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[0.65rem] tabular-nums sm:grid-cols-4">
          <Fact label="Uptime" value={formatUptime(s.uptimeMs)} />
          <Fact label="Frame rate" value={`${Math.round(s.fps)} fps`} />
          <Fact label="Documents" value={String(FILE_COUNT)} />
          <Fact label="Renderer" value="WebGL2" />
        </dl>
      </Section>

      <div class="mt-3 flex flex-wrap gap-1.5">
        <button type="button" class="holo-btn" onClick={() => openApp('files')}>
          Browse the vault
        </button>
        <button type="button" class="holo-btn" onClick={() => openApp('terminal')}>
          Open a shell
        </button>
        <button type="button" class="holo-btn" onClick={() => openApp('settings')}>
          Retune projection
        </button>
      </div>

      <p class="mt-4 border-t border-primary/15 pt-2.5 font-mono text-[0.55rem] leading-relaxed text-muted-foreground">
        Part of a portfolio of showcase apps, each deliberately built on a stack
        the others do not use. Press <kbd class="key">Alt</kbd>+<kbd class="key">Tab</kbd> to cycle
        surfaces, or drag a titlebar to a screen edge to snap it.
      </p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: JSX.Element }): JSX.Element {
  return (
    <section class="mb-3">
      <h2 class="label mb-1.5">{title}</h2>
      <div class="rounded border border-primary/15 bg-primary/5 p-2.5">{children}</div>
    </section>
  )
}

function Fact({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div>
      <dt class="text-[0.55rem] uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd class="text-primary">{value}</dd>
    </div>
  )
}
