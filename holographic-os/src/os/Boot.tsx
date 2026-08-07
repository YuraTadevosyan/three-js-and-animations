import type { JSX } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { bootPhase, projection } from '@/state/os'

const STEPS: Array<{ text: string; ms: number }> = [
  { text: 'holo-kernel 4.2 — cold start', ms: 90 },
  { text: 'acquiring webgl2 context', ms: 130 },
  { text: 'compiling volumetric pass … 2 programs', ms: 180 },
  { text: 'lattice projector online', ms: 110 },
  { text: 'atmos-sim: 4 stations registered', ms: 140 },
  { text: 'vault: indexing documents', ms: 150 },
  { text: 'novad: intent table loaded', ms: 120 },
  { text: 'telemetry-agent: sampling at 10 Hz', ms: 130 },
  { text: 'compositor: surfaces ready', ms: 160 },
]

/**
 * Boot overlay. Lines resolve on their own cadence, then the whole plate wipes
 * to reveal the desktop already running underneath it.
 */
export function Boot(): JSX.Element | null {
  const [step, setStep] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // Honour the OS's own reduce-motion switch as well as the media query.
    const skip =
      projection.peek().reduceMotion ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (skip) {
      bootPhase.value = 'ready'
      return
    }

    let cancelled = false
    let timer = 0

    const advance = (i: number) => {
      if (cancelled) return
      if (i >= STEPS.length) {
        setLeaving(true)
        timer = window.setTimeout(() => {
          if (!cancelled) bootPhase.value = 'ready'
        }, 620)
        return
      }
      setStep(i + 1)
      timer = window.setTimeout(() => advance(i + 1), STEPS[i].ms)
    }

    timer = window.setTimeout(() => advance(0), 220)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])

  if (bootPhase.value === 'ready') return null

  const progress = (step / STEPS.length) * 100

  return (
    <div
      class="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background transition-opacity duration-500"
      style={{ opacity: leaving ? 0 : 1, pointerEvents: leaving ? 'none' : 'auto' }}
      role="status"
      aria-live="polite"
    >
      {/* Mark */}
      <svg viewBox="0 0 64 64" class="mb-6 h-16 w-16 text-primary" fill="none" stroke="currentColor" stroke-linejoin="round">
        <path d="M32 8 55 21v22L32 56 9 43V21z" stroke-width="1.6" opacity="0.9" />
        <path d="M32 8v48M9 21l46 22M55 21 9 43" stroke-width="0.7" opacity="0.35" />
        <circle cx="32" cy="32" r="7.5" stroke-width="1.6" class="animate-breathe" />
        <circle cx="32" cy="32" r="2.4" fill="currentColor" stroke="none" />
      </svg>

      <h1 class="mb-1 font-mono text-sm uppercase tracking-[0.4em] text-primary text-glow">Holographic OS</h1>
      <p class="mb-7 font-mono text-[0.55rem] uppercase tracking-[0.28em] text-muted-foreground">
        Holo-Kernel 4.2
      </p>

      {/* Progress */}
      <div class="mb-5 h-px w-56 overflow-hidden bg-primary/15">
        <div
          class="h-full bg-primary transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%`, boxShadow: '0 0 12px hsl(var(--primary))' }}
        />
      </div>

      {/* Log */}
      <div class="h-28 w-[min(90vw,26rem)] overflow-hidden font-mono text-[0.6rem] leading-relaxed">
        {STEPS.slice(0, step).map((s, i) => (
          <p key={s.text} class="flex gap-2 animate-fade-in" style={{ opacity: i === step - 1 ? 1 : 0.4 }}>
            <span class="text-accent">[ok]</span>
            <span class="text-muted-foreground">{s.text}</span>
          </p>
        ))}
      </div>
    </div>
  )
}
