import { $, component$, useSignal, useStore, useStyles$, useVisibleTask$ } from '@builder.io/qwik'
import styles from './scifi.css?inline'
import { respond } from './assistant'
import { inbox, noteLines, unreadCount, useWorld } from '@/state/world'
import { LIVE, eraById } from '@/timeline/eras'
import { goTo, whenNear } from '@/timeline/progress'
import { play, setSong, toggleSong } from '@/state/sound'
import { TOUR_EVENT, type TourArrival } from '@/timeline/tour'

interface LogLine {
  id: number
  who: 'you' | 'nexus'
  text: string
}

const ANSWERS: [string, string][] = [
  ['Yes, I ate', 'Good. Call me on Sunday.'],
  ['Not yet', 'Eat something. Then call me.'],
  ['Eating right now', 'Good. Chew. Call me after.'],
]

const pad2 = (n: number) => String(n).padStart(2, '0')

export const SciFi = component$(() => {
  useStyles$(styles)
  const world = useWorld()
  const root = useSignal<HTMLElement>()
  const canvas = useSignal<HTMLCanvasElement>()
  const count = useSignal<HTMLElement>()
  const log = useStore<{ items: LogLine[]; seq: number }>({
    items: [{ id: 0, who: 'nexus', text: 'NEXUS online. Ask me anything, or say “help”.' }],
    seq: 1,
  })
  const draft = useSignal('')
  const canListen = useSignal(false)
  const listening = useSignal(false)
  const editing = useSignal(false)
  const answer = useSignal(-1)
  const callSecs = useSignal(0)
  const mounted = useSignal(false)

  useVisibleTask$(({ cleanup }) => {
    canListen.value = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    let dispose: (() => void) | null = null
    let gone = false
    const stop = whenNear(LIVE.scifi, 0.6, () => {
      void import('./mount').then(async ({ mountSciFi }) => {
        const d = await mountSciFi({ root: root.value!, canvas: canvas.value!, count: count.value! })
        if (gone) d()
        else {
          dispose = d
          mounted.value = true
        }
      })
    })
    cleanup(() => {
      gone = true
      stop()
      dispose?.()
    })
  }, { strategy: 'document-ready' })

  // Hand the hologram whatever has been painted over the photo, now and
  // whenever it changes. Waits for the hologram rather than loading it.
  useVisibleTask$(({ track }) => {
    const art = track(() => world.art)
    if (track(() => mounted.value)) void import('./mount').then((mod) => mod.setArt(art))
  })

  // The call clock runs while the link is open.
  useVisibleTask$(({ track, cleanup }) => {
    track(() => world.call)
    if (world.call !== 'open') return
    callSecs.value = 0
    const id = window.setInterval(() => callSecs.value++, 1000)
    cleanup(() => window.clearInterval(id))
  })

  const say = $((text: string) => {
    const id = log.seq++
    log.items = [...log.items, { id, who: 'nexus' as const, text }].slice(-4)
  })

  // The guided tour stops here: NEXUS says hello and lights up the lake.
  useVisibleTask$(
    ({ cleanup }) => {
      let timer = 0
      const onTour = (e: Event) => {
        if ((e as CustomEvent<TourArrival>).detail.era !== 'scifi') return
        timer = window.setTimeout(() => {
          void say('Tour mode. That is your lake, from 1986. When the tour ends, drag it around.')
          play(world, 'sf-reply')
          if (mounted.value) void import('./mount').then((mod) => mod.pulse())
        }, 1400)
      }
      window.addEventListener(TOUR_EVENT, onTour)
      cleanup(() => {
        window.removeEventListener(TOUR_EVENT, onTour)
        window.clearTimeout(timer)
      })
    },
    { strategy: 'document-ready' },
  )

  const ask = $(async (text: string, spoken = false) => {
    const q = text.trim()
    if (!q) return
    const reply = respond(q, {
      note: world.note,
      messages: inbox(world),
      wifi: world.wifi,
      now: new Date(),
      playing: world.playing,
      painted: !!world.art,
    })
    play(world, 'sf-reply')
    const id = log.seq
    log.seq += 2
    log.items = [...log.items, { id, who: 'you' as const, text: q }, { id: id + 1, who: 'nexus' as const, text: reply.text }].slice(-4)
    switch (reply.action) {
      case 'append-note':
        world.note = world.note.trim() ? `${world.note.replace(/\n+$/, '')}\n${reply.payload}` : (reply.payload ?? '')
        break
      case 'open-call':
        if (world.call === 'ringing') world.call = 'open'
        break
      case 'pulse':
        void import('./mount').then((mod) => mod.pulse())
        break
      case 'go-1980':
        goTo(eraById('dos').snap)
        break
      case 'toggle-wifi':
        world.wifi = true
        break
      case 'play-song':
        void setSong(world, true)
        break
      case 'stop-song':
        void setSong(world, false)
        break
    }
    if (spoken && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(reply.text)
      u.rate = 1.04
      u.pitch = 0.85
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    }
  })

  const listen = $(() => {
    const w = window as unknown as Record<string, any>
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SR || listening.value) return
    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript
      if (text) void ask(text, true)
    }
    rec.onend = () => (listening.value = false)
    rec.onerror = () => (listening.value = false)
    listening.value = true
    rec.start()
  })

  const lines = noteLines(world.note)
  const msgs = inbox(world)
  const mom = msgs.find((m) => m.id === 'mom')
  const others = msgs.filter((m) => m.id !== 'mom')
  const unread = unreadCount(world)

  return (
    <section ref={root} class="layer layer-scifi" aria-label="2040: Sci-fi UI">
      <div class="sf-bg" aria-hidden="true" />
      <canvas ref={canvas} class="sf-gl" aria-label="A hologram of the lake photo, rebuilt as a 3D point cloud. Drag to orbit." role="img" />
      <div class="sf-overlay" aria-hidden="true" />
      <div class="sf-reticle sf-in" style={{ '--i': '3' }} aria-hidden="true">
        <i />
        <i />
      </div>

      <div class="sf-hud">
        <header class="sf-top sf-in" style={{ '--i': '0' }}>
          <span class="sf-brand">
            NEXUS<small>/os 40.2</small>
          </span>
          <span class="sf-when">
            <span data-clock="hud-date">2040.09.27</span>
            <i />
            <span data-clock="hud-time">12:00:00</span>
          </span>
          <span class="sf-sys">
            <span class={!world.wifi && 'warn'}>LINK {world.wifi ? '▲ 12.4 Tb/s' : 'OFFLINE'}</span>
            <span>BT {world.bluetooth ? 'ON' : 'OFF'}</span>
            <span>FOCUS {world.focus ? 'ON' : 'OFF'}</span>
            <button type="button" class={['sf-audio', world.playing && 'on']} aria-pressed={world.playing} onClick$={() => toggleSong(world)}>
              {world.playing ? '■ AUDIO' : '▶ AUDIO'}
            </button>
          </span>
        </header>

        <aside class="sf-panel sf-memory sf-in" style={{ '--i': '1', '--dx': '-1', '--dy': '0' }} aria-label="Memory">
          <h3>
            <b>Memory</b> // notes.txt <span>1980 → 2040</span>
          </h3>
          {editing.value ? (
            <textarea
              class="sf-edit"
              aria-label="Edit note"
              spellcheck={false}
              value={world.note}
              onInput$={(_, el) => (world.note = el.value)}
            />
          ) : (
            <ol class="sf-lines">
              {lines.length === 0 && <li class="sf-dim">— empty —</li>}
              {lines.map((l, i) => (
                <li key={i}>
                  <span>{pad2(i + 1)}</span>
                  {l || ' '}
                </li>
              ))}
            </ol>
          )}
          <button type="button" class="sf-btn ghost" onClick$={() => (editing.value = !editing.value)}>
            {editing.value ? 'Done' : 'Edit'}
          </button>
        </aside>

        <aside class="sf-panel sf-comms sf-in" style={{ '--i': '2', '--dx': '1', '--dy': '0' }} aria-label="Communications">
          <h3>
            <b>Comms</b> <span>{world.wifi ? `${unread} pending` : 'no link'}</span>
          </h3>
          {mom && world.wifi ? (
            <div class={['sf-call', world.call]}>
              {world.call === 'ringing' && (
                <>
                  <p class="sf-call-h">
                    <i class="sf-ping" /> Incoming · voice
                  </p>
                  <p class="sf-call-name">Mom</p>
                  <div class="sf-wave" aria-hidden="true">
                    {Array.from({ length: 22 }, (_, j) => (
                      <i key={j} style={{ '--j': String(j) }} />
                    ))}
                  </div>
                  <div class="sf-row">
                    <button
                      type="button"
                      class="sf-btn"
                      onClick$={() => {
                        world.call = 'open'
                        play(world, 'sf-blip')
                      }}
                    >
                      Accept
                    </button>
                    <button type="button" class="sf-btn ghost" onClick$={() => say('Deferred. Mom will call back. She always does.')}>
                      Later
                    </button>
                  </div>
                </>
              )}
              {world.call === 'open' && (
                <>
                  <p class="sf-call-h">
                    <i class="sf-live" /> Link open · {pad2(Math.floor(callSecs.value / 60))}:{pad2(callSecs.value % 60)}
                  </p>
                  <div class="sf-wave fast" aria-hidden="true">
                    {Array.from({ length: 22 }, (_, j) => (
                      <i key={j} style={{ '--j': String(j) }} />
                    ))}
                  </div>
                  <p class="sf-say">
                    <b>Mom ›</b> {mom.subject}
                  </p>
                  <div class="sf-chips">
                    {ANSWERS.map(([a], k) => (
                      <button
                        key={a}
                        type="button"
                        class="sf-chip"
                        onClick$={() => {
                          answer.value = k
                          world.call = 'answered'
                          mom.read = true
                        }}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {world.call === 'answered' && (
                <>
                  <p class="sf-call-h">Link closed</p>
                  <p class="sf-say">
                    <b>Mom ›</b> {mom.subject}
                  </p>
                  <p class="sf-say you">
                    <b>You ›</b> {ANSWERS[Math.max(0, answer.value)][0]}
                  </p>
                  <p class="sf-say">
                    <b>Mom ›</b> {ANSWERS[Math.max(0, answer.value)][1]} ♡
                  </p>
                  <p class="sf-dim">First asked in 1980. Answered in 2040.</p>
                </>
              )}
            </div>
          ) : (
            <p class="sf-dim">{world.wifi ? 'No voice links.' : 'Link down. Somebody switched the Wi-Fi off in 2025.'}</p>
          )}
          {world.wifi && others.length > 0 && (
            <ul class="sf-msgs">
              {others.map((m) => (
                <li key={m.id}>
                  <button type="button" class={!m.read && 'unread'} onClick$={() => (m.read = true)}>
                    <b>{m.from}</b>
                    <span>{m.read ? m.body : m.subject}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <p class="sf-subject sf-in" style={{ '--i': '4' }}>
          <span>Subject</span> lake.pcx · 1986 · rebuilt · <span ref={count}>reconstructing</span>
          {world.art ? ' · with your 1995 paint' : ''} · drag to orbit
        </p>

        <form
          class="sf-cmd sf-in"
          style={{ '--i': '5' }}
          preventdefault:submit
          onSubmit$={() => {
            const q = draft.value
            draft.value = ''
            return ask(q)
          }}
        >
          <div class="sf-log" aria-live="polite">
            {log.items.map((l) => (
              <p key={l.id} class={['sf-logline', l.who]}>
                <b>{l.who === 'you' ? 'you' : 'nexus'}</b>
                <span>{l.text}</span>
              </p>
            ))}
          </div>
          <label class="sf-input">
            <span aria-hidden="true">›</span>
            <input
              type="text"
              placeholder="Ask NEXUS…"
              aria-label="Ask NEXUS"
              autocomplete="off"
              value={draft.value}
              onInput$={(_, el) => (draft.value = el.value)}
            />
            {canListen.value && (
              <button type="button" class={['sf-mic', listening.value && 'on']} aria-label="Speak to NEXUS" aria-pressed={listening.value} onClick$={listen}>
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11z" fill="currentColor" />
                </svg>
              </button>
            )}
            <button type="submit" class="sf-send" aria-label="Send">
              ↵
            </button>
          </label>
        </form>
      </div>
    </section>
  )
})
