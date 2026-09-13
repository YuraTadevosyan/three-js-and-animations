import { animate } from 'motion'
import { organism } from '@/organism'

function shortDuration(ms: number): string {
  const m = ms / 60000
  if (m < 1) return 'a moment'
  if (m < 90) return `${Math.round(m)} minutes`
  const h = m / 60
  if (h < 36) return `${Math.round(h)} hours`
  return `${Math.round(h / 24)} days`
}

/**
 * The page's only interruption: a single line, once, telling you what happened
 * while you weren't looking. It is the payoff for the garden persisting — with
 * nothing to mark it, a returning visitor would just find a different bed and
 * assume it was random.
 */
export function setupNotices() {
  const host = document.createElement('div')
  host.className =
    'organ fixed bottom-5 left-1/2 z-50 max-w-[min(92vw,30rem)] -translate-x-1/2 px-5 py-3 text-sm text-foreground'
  host.setAttribute('role', 'status')
  host.style.opacity = '0'
  host.style.pointerEvents = 'none'
  document.body.appendChild(host)

  let timer = 0

  const show = (message: string) => {
    host.textContent = message
    window.clearTimeout(timer)
    void animate(
      host,
      { opacity: [0, 1], transform: ['translate(-50%, 14px)', 'translate(-50%, 0px)'] },
      { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    )
    timer = window.setTimeout(() => {
      void animate(
        host,
        { opacity: [1, 0], transform: ['translate(-50%, 0px)', 'translate(-50%, 10px)'] },
        { duration: 0.4 },
      )
    }, 7000)
  }

  organism.on('returned', ({ awayMs, grewBy }) => {
    // Ignore a blink of tab-switching; only a real absence is worth a line.
    if (awayMs < 60_000 || grewBy < 20) return
    show(
      `You were gone ${shortDuration(awayMs)}. The garden kept going — ` +
        `${Math.round(grewBy / 60)} minutes of growth while you were away.`,
    )
  })
}
