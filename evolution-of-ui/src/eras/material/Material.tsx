import { $, component$, useSignal, useStore, useStyles$, useVisibleTask$ } from '@builder.io/qwik'
import styles from './material.css?inline'
import { inbox, unreadCount, useWorld } from '@/state/world'
import { LAKE_SRC } from '@/lib/lake-src'
import { play, toggleSong, useSongPosition } from '@/state/sound'
import { SONG_ARTIST, SONG_SECONDS, SONG_TITLE } from '@/lib/song'
import { LIVE } from '@/timeline/eras'
import { prefersReducedMotion, whenNear } from '@/timeline/progress'
import { TOUR_EVENT, type TourArrival } from '@/timeline/tour'

/** Material icon paths (Apache 2.0), 24×24. */
const I = {
  menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
  search:
    'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  more: 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  archive:
    'M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z',
  add: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  wifi: 'M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.24 4.24 0 0 0-6 0zm-4-4l2 2a7.07 7.07 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z',
  bluetooth:
    'M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z',
  dnd: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z',
  notes: 'M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z',
  photo: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
  mail: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  share:
    'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11A2.99 2.99 0 0 0 21 5a3 3 0 1 0-5.91.7L8.04 9.81A2.99 2.99 0 0 0 3 12a2.99 2.99 0 0 0 5.04 2.19l7.12 4.16c-.05.21-.08.43-.08.65A2.92 2.92 0 1 0 18 16.08z',
}

const Svg = (props: { d: string; size?: number }) => (
  <svg width={props.size ?? 24} height={props.size ?? 24} viewBox="0 0 24 24" aria-hidden="true">
    <path d={props.d} fill="currentColor" />
  </svg>
)

type Tab = 'all' | 'photos' | 'messages'
const TABS: Tab[] = ['all', 'photos', 'messages']

export const Material = component$(() => {
  useStyles$(styles)
  const world = useWorld()
  const root = useSignal<HTMLElement>()
  const noteRef = useSignal<HTMLTextAreaElement>()
  const tab = useSignal<Tab>('all')
  const drawer = useSignal(false)
  const songPos = useSongPosition(world)
  const snack = useStore({ show: false, text: '', undo: '' as '' | 'archive' | 'clear', id: '', note: '', seq: 0 })

  // Ink ripples, delegated: any [data-ripple] inside the layer gets one.
  useVisibleTask$(({ cleanup }) => {
    let detach = () => {}
    const stop = whenNear(LIVE.material, 0.5, () => {
      const el = root.value
      if (!el || prefersReducedMotion()) return
      const onDown = (e: PointerEvent) => {
        const host = (e.target as Element).closest<HTMLElement>('[data-ripple]')
        if (!host || !el.contains(host)) return
        const r = host.getBoundingClientRect()
        const size = Math.hypot(r.width, r.height) * 2
        const ink = document.createElement('span')
        ink.className = 'md-ink'
        ink.style.width = ink.style.height = `${size}px`
        ink.style.left = `${e.clientX - r.left - size / 2}px`
        ink.style.top = `${e.clientY - r.top - size / 2}px`
        host.appendChild(ink)
        play(world, 'md-tap')
        const done = () => ink.remove()
        ink.addEventListener('animationend', done, { once: true })
        window.setTimeout(done, 1200)
      }
      el.addEventListener('pointerdown', onDown)
      detach = () => el.removeEventListener('pointerdown', onDown)
    })
    cleanup(() => {
      stop()
      detach()
    })
  }, { strategy: 'document-ready' })

  const toast = $((text: string, undo: '' | 'archive' | 'clear' = '', id = '', note = '') => {
    snack.text = text
    snack.undo = undo
    snack.id = id
    snack.note = note
    snack.show = true
    play(world, 'md-snack')
    const seq = ++snack.seq
    setTimeout(() => {
      if (snack.seq === seq) snack.show = false
    }, 4000)
  })

  // The guided tour stops here: a snackbar, the most 2015 way to say hello.
  useVisibleTask$(
    ({ cleanup }) => {
      let timer = 0
      const onTour = (e: Event) => {
        if ((e as CustomEvent<TourArrival>).detail.era !== 'material') return
        timer = window.setTimeout(() => toast('You’re on the tour. Tap anything for an ink ripple.'), 1200)
      }
      window.addEventListener(TOUR_EVENT, onTour)
      cleanup(() => {
        window.removeEventListener(TOUR_EVENT, onTour)
        window.clearTimeout(timer)
      })
    },
    { strategy: 'document-ready' },
  )

  const msgs = inbox(world)
  const unread = unreadCount(world)
  const tabIndex = TABS.indexOf(tab.value)

  return (
    <section ref={root} class="layer layer-material" aria-label="2015: Material Design">
      <div class="md-app">
        <header class="md-appbar">
          <div class="md-toolbar">
            <button type="button" class="md-icon-btn" data-ripple aria-label="Open navigation" onClick$={() => (drawer.value = true)}>
              <Svg d={I.menu} />
            </button>
            <h2 class="md-title">Notes</h2>
            <span class="md-spacer" />
            <button type="button" class="md-icon-btn" data-ripple aria-label="Search">
              <Svg d={I.search} />
            </button>
            <button type="button" class="md-icon-btn" data-ripple aria-label="More options">
              <Svg d={I.more} />
            </button>
          </div>
          <div class="md-tabs" role="tablist" style={{ '--tab': String(tabIndex) }}>
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab.value === t}
                class={['md-tab', tab.value === t && 'on']}
                data-ripple
                onClick$={() => (tab.value = t)}
              >
                {t}
              </button>
            ))}
            <span class="md-inkbar" aria-hidden="true" />
          </div>
        </header>

        <main class="md-content" data-tab={tab.value}>
          <div class="md-grid">
            <article class="md-card" data-kind="note" style={{ '--i': '0' }}>
              <h3 class="md-card-title">To-do</h3>
              <label class="md-field">
                <textarea
                  ref={noteRef}
                  rows={5}
                  placeholder=" "
                  spellcheck={false}
                  value={world.note}
                  onInput$={(_, el) => (world.note = el.value)}
                />
                <span class="md-label">Note</span>
                <span class="md-underline" aria-hidden="true" />
              </label>
              <div class="md-actions">
                <button
                  type="button"
                  class="md-btn"
                  data-ripple
                  disabled={!world.note}
                  onClick$={() => {
                    const before = world.note
                    world.note = ''
                    toast('Note cleared', 'clear', '', before)
                  }}
                >
                  Clear
                </button>
              </div>
            </article>

            <article class="md-card md-photo" data-kind="photo" style={{ '--i': '1' }}>
              <div class="md-media">
                <img src={LAKE_SRC} alt="A lake at sunset, mountains reflected in the water" width={320} height={200} />
                {world.art && <img class="art-layer" src={world.art} alt="" aria-hidden="true" width={320} height={200} />}
              </div>
              <div class="md-card-text">
                <h3 class="md-headline">Lake at sunset</h3>
                <p>Shared with Mom, Alex and Grandpa</p>
              </div>
              <div class="md-actions">
                <button type="button" class="md-btn accent" data-ripple onClick$={() => toast('Link copied to clipboard')}>
                  Share
                </button>
                <button type="button" class="md-btn accent" data-ripple onClick$={() => toast('Explore opens in 2025. Keep scrolling.')}>
                  Explore
                </button>
              </div>
            </article>

            <article class="md-card" data-kind="messages" style={{ '--i': '2' }}>
              <h3 class="md-card-title">
                Messages
                {unread > 0 && <span class="md-chip">{unread} new</span>}
              </h3>
              {msgs.length === 0 && <p class="md-empty">Inbox zero. Everything is archived.</p>}
              <ul class="md-list">
                {msgs.map((m) => (
                  <li key={m.id} class={['md-li', !m.read && 'unread']}>
                    <button type="button" class="md-li-main" data-ripple onClick$={() => (m.read = true)}>
                      <span class="md-avatar" style={{ background: `hsl(${m.hue} 62% 48%)` }}>
                        {m.from.slice(0, 1)}
                      </span>
                      <span class="md-li-text">
                        <span class="md-li-primary">{m.from}</span>
                        <span class="md-li-secondary">
                          <b>{m.subject}</b> — {m.body}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      class="md-icon-btn dark"
                      data-ripple
                      aria-label={`Archive ${m.from}'s message`}
                      onClick$={() => {
                        m.archived = true
                        toast('Conversation archived', 'archive', m.id)
                      }}
                    >
                      <Svg d={I.archive} />
                    </button>
                  </li>
                ))}
              </ul>
            </article>

            <article class="md-card" data-kind="settings" style={{ '--i': '3' }}>
              <h3 class="md-card-title">Quick settings</h3>
              {(
                [
                  ['wifi', 'Wi-Fi', I.wifi],
                  ['bluetooth', 'Bluetooth', I.bluetooth],
                  ['focus', 'Do not disturb', I.dnd],
                ] as const
              ).map(([key, label, icon]) => (
                <label key={key} class="md-switch-row">
                  <Svg d={icon} />
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    role="switch"
                    class="md-switch"
                    checked={world[key]}
                    onChange$={(_, el) => {
                      world[key] = el.checked
                    }}
                  />
                </label>
              ))}
            </article>

            <article class="md-card md-music" data-kind="music" style={{ '--i': '4' }}>
              <div class="md-music-row">
                <div class="md-music-art" aria-hidden="true" />
                <div class="md-li-text">
                  <span class="md-li-primary">{SONG_TITLE}</span>
                  <span class="md-li-secondary">{SONG_ARTIST}</span>
                </div>
                <button type="button" class="md-play" data-ripple aria-label={world.playing ? 'Pause' : 'Play'} onClick$={() => toggleSong(world)}>
                  <Svg d={world.playing ? 'M6 5h4v14H6zm8 0h4v14h-4z' : 'M7 4.5v15l12-7.5z'} />
                </button>
              </div>
              <div class="md-progress" aria-hidden="true">
                <i style={{ transform: `scaleX(${songPos.value / SONG_SECONDS})` }} />
              </div>
            </article>
          </div>
        </main>

        <button
          type="button"
          class="md-fab"
          data-ripple
          aria-label="Add a line to the note"
          onClick$={() => {
            tab.value = 'all'
            if (world.note && !world.note.endsWith('\n')) world.note += '\n'
            const el = noteRef.value
            if (el) {
              el.focus({ preventScroll: true })
              requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length))
            }
          }}
        >
          <Svg d={I.add} />
        </button>

        <div class={['md-snackbar', snack.show && 'show']} role="status" aria-live="polite">
          <span>{snack.text}</span>
          {snack.undo && (
            <button
              type="button"
              class="md-btn accent"
              onClick$={() => {
                if (snack.undo === 'archive') {
                  const m = world.messages.find((x) => x.id === snack.id)
                  if (m) m.archived = false
                } else if (snack.undo === 'clear') world.note = snack.note
                snack.show = false
                snack.seq++
              }}
            >
              Undo
            </button>
          )}
        </div>

        <div class={['md-scrim', drawer.value && 'open']} onClick$={() => (drawer.value = false)} />
        <nav class={['md-drawer', drawer.value && 'open']} aria-label="Navigation" aria-hidden={!drawer.value}>
          <div class="md-drawer-head" style={{ backgroundImage: `url("${LAKE_SRC}")` }}>
            <span class="md-avatar big">Y</span>
            <b>you</b>
            <span>you@notr.com</span>
          </div>
          {(
            [
              ['all', 'Notes', I.notes],
              ['photos', 'Photos', I.photo],
              ['messages', 'Messages', I.mail],
            ] as const
          ).map(([t, label, icon]) => (
            <button
              key={t}
              type="button"
              class={['md-drawer-item', tab.value === t && 'on']}
              data-ripple
              tabIndex={drawer.value ? 0 : -1}
              onClick$={() => {
                tab.value = t
                drawer.value = false
              }}
            >
              <Svg d={icon} />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </section>
  )
})
