import { component$, useSignal, useStyles$, useVisibleTask$ } from '@builder.io/qwik'
import styles from './glass.css?inline'
import { agoLabel, inbox, useWorld } from '@/state/world'
import { LAKE_SRC } from '@/lib/lake-src'
import { LIVE } from '@/timeline/eras'
import { prefersReducedMotion, whenNear } from '@/timeline/progress'

const TRACK_LEN = 214 // "Call Me Back", 3:34

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

const WifiIcon = (props: { on: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 18.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zM5.6 13.9l1.5 1.5a6.9 6.9 0 0 1 9.8 0l1.5-1.5a9 9 0 0 0-12.8 0zM2 10.3l1.5 1.5a12 12 0 0 1 17 0l1.5-1.5a14.1 14.1 0 0 0-20 0z"
      fill="currentColor"
      opacity={props.on ? 1 : 0.35}
    />
    {!props.on && <path d="M4 4l16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />}
  </svg>
)

export const Glass = component$(() => {
  useStyles$(styles)
  const world = useWorld()
  const root = useSignal<HTMLElement>()
  const playing = useSignal(false)
  const pos = useSignal(71)
  const bright = useSignal(80)

  // Light and depth: each panel catches a highlight where the pointer is and
  // leans toward it. One rAF loop eases every panel and stops when they settle.
  useVisibleTask$(({ cleanup }) => {
    let detach = () => {}
    const stop = whenNear(LIVE.glass, 0.4, () => {
      const el = root.value
      if (!el) return
      const reduced = prefersReducedMotion()
      const panels = Array.from(el.querySelectorAll<HTMLElement>('.gl-grid .gl-panel'))
      const st = panels.map(() => ({ rx: 0, ry: 0, trx: 0, try: 0 }))
      let raf = 0
      const loop = () => {
        raf = 0
        let moving = false
        panels.forEach((p, i) => {
          const s = st[i]
          s.rx += (s.trx - s.rx) * 0.14
          s.ry += (s.try - s.ry) * 0.14
          if (Math.abs(s.trx - s.rx) > 0.01 || Math.abs(s.try - s.ry) > 0.01) moving = true
          p.style.setProperty('--rx', `${s.rx.toFixed(2)}deg`)
          p.style.setProperty('--ry', `${s.ry.toFixed(2)}deg`)
        })
        if (moving) raf = requestAnimationFrame(loop)
      }
      const kick = () => {
        if (!raf) raf = requestAnimationFrame(loop)
      }
      const onMove = (e: PointerEvent) => {
        panels.forEach((p, i) => {
          const r = p.getBoundingClientRect()
          const x = (e.clientX - r.left) / r.width
          const y = (e.clientY - r.top) / r.height
          p.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
          p.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
          const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1
          st[i].trx = inside && !reduced ? (0.5 - y) * 7 : 0
          st[i].try = inside && !reduced ? (x - 0.5) * 9 : 0
        })
        kick()
      }
      const onLeave = () => {
        st.forEach((s) => {
          s.trx = 0
          s.try = 0
        })
        kick()
      }
      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      detach = () => {
        cancelAnimationFrame(raf)
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
      }
    })
    cleanup(() => {
      stop()
      detach()
    })
  }, { strategy: 'document-ready' })

  // The song only moves while it's playing.
  useVisibleTask$(({ track, cleanup }) => {
    track(() => playing.value)
    if (!playing.value) return
    const id = window.setInterval(() => {
      pos.value = (pos.value + 1) % TRACK_LEN
    }, 1000)
    cleanup(() => window.clearInterval(id))
  })

  const msgs = inbox(world)

  return (
    <section ref={root} class="layer layer-glass" aria-label="2025: Glassmorphism">
      <div class="gl-bg" aria-hidden="true" style={{ '--bright': String(bright.value / 100) }}>
        <i class="b1" />
        <i class="b2" />
        <i class="b3" />
        <i class="b4" />
      </div>

      <div class="gl-menubar gl-panel" style={{ '--i': '0' }}>
        <span class="gl-dot" aria-hidden="true" />
        <b>Notes</b>
        <span class="gl-menu">File</span>
        <span class="gl-menu">Edit</span>
        <span class="gl-menu">View</span>
        <span class="gl-menu">Window</span>
        <span class="gl-spacer" />
        <WifiIcon on={world.wifi} />
        <span class="gl-batt" aria-label="Battery 82%">
          <i />
        </span>
        <span data-clock="glass-day">Sat Sep 27 12:00</span>
      </div>

      <div class="gl-grid">
        <div class="gl-panel gl-clock" style={{ '--i': '1' }}>
          <span class="gl-time" data-clock="glass-time">
            12:00
          </span>
          <span class="gl-date" data-clock="glass-date">
            Saturday, September 27
          </span>
          <span class="gl-weather">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4.5" fill="#ffd66b" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" stroke="#ffd66b" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            18° · The lake · Clear, golden hour
          </span>
        </div>

        <figure class="gl-panel gl-photo" style={{ '--i': '2' }}>
          <img class="gl-photo-glow" src={LAKE_SRC} alt="" aria-hidden="true" width={320} height={200} />
          <img class="gl-photo-img" src={LAKE_SRC} alt="A lake at sunset, mountains reflected in the water" width={320} height={200} />
          <figcaption class="gl-chip">Lake at sunset · shared with 3 people</figcaption>
        </figure>

        <div class="gl-panel gl-note" style={{ '--i': '3' }}>
          <h3>Note</h3>
          <textarea aria-label="Note" spellcheck={false} value={world.note} onInput$={(_, el) => (world.note = el.value)} />
        </div>

        <div class="gl-panel gl-msgs" style={{ '--i': '4' }}>
          <h3>Notifications</h3>
          <div class="gl-stack">
            {msgs.length === 0 && <p class="gl-quiet">No notifications. Suspiciously quiet.</p>}
            {msgs.map((m, n) => (
              <div key={m.id} class={['gl-notif', !m.read && 'unread']} style={{ '--n': String(n), zIndex: String(10 - n) }}>
                <button type="button" class="gl-notif-main" onClick$={() => (m.read = true)}>
                  <span class="gl-app" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.4 6.1L4.5 21l4.2-2.3c1 .2 2.1.3 3.3.3 5.5 0 10-3.6 10-8s-4.5-8-10-8z" fill="#fff" />
                    </svg>
                  </span>
                  <span class="gl-notif-b">
                    <span class="gl-notif-h">
                      <b>{m.from}</b>
                      <span>{agoLabel(m.ago)}</span>
                    </span>
                    <span class="gl-notif-s">{m.subject}</span>
                    <span class="gl-notif-t">{m.body}</span>
                  </span>
                </button>
                <button type="button" class="gl-x" aria-label={`Clear ${m.from}'s message`} onClick$={() => (m.archived = true)}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div class="gl-panel gl-music" style={{ '--i': '5' }}>
          <div class="gl-art" aria-hidden="true" />
          <div class="gl-track">
            <b>Call Me Back</b>
            <span>The Good Cables</span>
            <div class="gl-progress" role="progressbar" aria-valuemin={0} aria-valuemax={TRACK_LEN} aria-valuenow={pos.value} aria-label="Playback position">
              <i style={{ width: `${(pos.value / TRACK_LEN) * 100}%` }} />
            </div>
            <div class="gl-times">
              <span>{fmt(pos.value)}</span>
              <span>-{fmt(TRACK_LEN - pos.value)}</span>
            </div>
          </div>
          <div class="gl-controls">
            <button type="button" aria-label="Previous" onClick$={() => (pos.value = 0)}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" fill="currentColor" />
              </svg>
            </button>
            <button type="button" class="gl-play" aria-label={playing.value ? 'Pause' : 'Play'} onClick$={() => (playing.value = !playing.value)}>
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path d={playing.value ? 'M6 5h4v14H6zm8 0h4v14h-4z' : 'M7 4.5v15l12-7.5z'} fill="currentColor" />
              </svg>
            </button>
            <button type="button" aria-label="Next" onClick$={() => (pos.value = 0)}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        <div class="gl-panel gl-cc" style={{ '--i': '6' }}>
          <div class="gl-toggles">
            {(
              [
                ['wifi', 'Wi-Fi', 'M12 18.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zM5.6 13.9l1.5 1.5a6.9 6.9 0 0 1 9.8 0l1.5-1.5a9 9 0 0 0-12.8 0zM2 10.3l1.5 1.5a12 12 0 0 1 17 0l1.5-1.5a14.1 14.1 0 0 0-20 0z'],
                ['bluetooth', 'Bluetooth', 'M17.7 7.7L12 2h-1v7.6L6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l4.6-4.6V22h1l5.7-5.7-4.3-4.3 4.3-4.3zM13 5.8l1.9 1.9L13 9.6V5.8zm1.9 10.5L13 18.2v-3.8l1.9 1.9z'],
                ['focus', 'Focus', 'M12.1 22A10 10 0 0 1 9.4 2.4a8 8 0 0 0 12.2 10.1A10 10 0 0 1 12.1 22z'],
              ] as const
            ).map(([key, label, d]) => (
              <button
                key={key}
                type="button"
                class={['gl-toggle', world[key] && 'on']}
                aria-pressed={world[key]}
                onClick$={() => (world[key] = !world[key])}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={d} fill="currentColor" />
                </svg>
                <span>{label}</span>
              </button>
            ))}
          </div>
          <label class="gl-slider">
            <span>Display</span>
            <input type="range" min={30} max={100} value={bright.value} onInput$={(_, el) => (bright.value = +el.value)} />
          </label>
        </div>
      </div>
    </section>
  )
})
