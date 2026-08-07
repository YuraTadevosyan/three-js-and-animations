import type { JSX } from 'preact'
import { dismissNotice, notices } from '@/state/os'
import { TOPBAR_H } from '@/state/windows'
import { IconClose } from '@/ui/icons'

const TONE: Record<string, string> = {
  info: 'hsl(var(--primary))',
  ok: 'hsl(var(--accent))',
  warn: 'hsl(var(--warn))',
}

/** Transient toasts, stacked under the top bar. */
export function Notifications(): JSX.Element {
  return (
    <div
      class="pointer-events-none fixed right-3 z-[9700] flex w-[min(88vw,20rem)] flex-col gap-2"
      style={{ top: `${TOPBAR_H + 10}px` }}
      role="log"
      aria-live="polite"
    >
      {notices.value.map((n) => (
        <div
          key={n.id}
          class="glass brackets pointer-events-auto flex items-start gap-2.5 rounded-lg py-2.5 pl-3 pr-2 animate-rail-in"
        >
          <span
            class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: TONE[n.tone], boxShadow: `0 0 8px ${TONE[n.tone]}` }}
          />
          <div class="min-w-0 flex-1">
            <p class="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-primary">{n.title}</p>
            <p class="mt-0.5 break-words font-mono text-[0.62rem] leading-snug text-foreground/80">{n.body}</p>
          </div>
          <button
            type="button"
            class="grid h-5 w-5 shrink-0 place-items-center rounded text-primary/50 transition-colors hover:bg-primary/15 hover:text-primary"
            aria-label="Dismiss"
            onClick={() => dismissNotice(n.id)}
          >
            <IconClose size={11} />
          </button>
        </div>
      ))}
    </div>
  )
}
