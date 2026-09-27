import { $, component$, useSignal, useStyles$, useTask$ } from '@builder.io/qwik'
import styles from './web2.css?inline'
import { inbox, noteLines, unreadCount, useWorld } from '@/state/world'
import { LAKE_SRC } from '@/lib/lake-src'

const TAGS: [string, number][] = [
  ['ajax', 22],
  ['blog', 13],
  ['css', 16],
  ['folksonomy', 11],
  ['mashup', 18],
  ['podcast', 12],
  ['rss', 20],
  ['social', 15],
  ['sunset', 14],
  ['tagging', 12],
  ['web2.0', 24],
  ['wiki', 13],
]

const BADGES: [string, string, string][] = [
  ['RSS', 'feed', '#f60'],
  ['XHTML', '1.0 ✓', '#369'],
  ['CSS', 'valid', '#693'],
  ['AJAX', 'powered', '#c30'],
  ['WEB', '2.0', '#96c'],
  ['GET', 'FIREFOX', '#e66000'],
]

const initial = (s: string) => s.slice(0, 1).toUpperCase()

export const Web2 = component$(() => {
  useStyles$(styles)
  const world = useWorld()
  const draft = useSignal(world.note)
  const saving = useSignal(false)
  const flash = useSignal(0)
  const diggs = useSignal(42)
  const dugg = useSignal(false)
  const rating = useSignal(0)
  const tab = useSignal('home')

  // The note can change in any era; keep the box in step with it.
  useTask$(({ track }) => {
    draft.value = track(() => world.note)
  })

  const update = $(() => {
    if (saving.value) return
    saving.value = true
    // An XMLHttpRequest that takes exactly as long as it did in 2005.
    setTimeout(() => {
      world.note = draft.value
      saving.value = false
      flash.value++
    }, 750)
  })

  const lines = noteLines(world.note)
  const msgs = inbox(world)
  const unread = unreadCount(world)

  return (
    <section class="layer layer-web2" aria-label="2005: Web 2.0">
      <div class="w2-page">
        {!world.wifi && (
          <div class="w2-infobar" role="status">
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 1l7 13H1z" fill="#fc0" stroke="#963" />
              <path d="M8 6v4" stroke="#000" stroke-width="1.6" />
              <circle cx="8" cy="12" r=".9" />
            </svg>
            You appear to be offline. notr works best with an internet connection! (Someone switched the Wi-Fi off in 2025.)
          </div>
        )}

        <header class="w2-header">
          <div class="w2-wrap w2-header-in">
            <div class="w2-logo">
              notr<span class="w2-beta">beta</span>
            </div>
            <nav class="w2-tabs" aria-label="notr">
              {['home', 'friends', 'photos', 'tags'].map((t) => (
                <button key={t} type="button" class={['w2-tab', tab.value === t && 'on']} onClick$={() => (tab.value = t)}>
                  {t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </nav>
            <form class="w2-search" role="search" preventdefault:submit>
              <input type="search" placeholder="Search notr" aria-label="Search notr" />
              <button type="submit" class="w2-gloss w2-gloss-blue">
                Go
              </button>
            </form>
          </div>
        </header>

        <div class="w2-subbar">
          <div class="w2-wrap">
            Welcome back, <b>you</b>! · <span class="w2-a">{unread} new message{unread === 1 ? '' : 's'}</span> · Invite friends ·
            Upgrade to <b>notr Pro</b>
            <span class="w2-rss" aria-label="RSS">
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <circle cx="2.2" cy="9.8" r="1.6" fill="#fff" />
                <path d="M1 5.2a5.8 5.8 0 0 1 5.8 5.8M1 1.4a9.6 9.6 0 0 1 9.6 9.6" stroke="#fff" stroke-width="1.8" fill="none" />
              </svg>
            </span>
          </div>
        </div>

        <div class="w2-wrap w2-main">
          <aside class="w2-side">
            <div class="w2-box w2-profile">
              <span class="w2-avatar big" style={{ '--h': '210' }}>
                Y
              </span>
              <div>
                <b>you</b>
                <p class="w2-online">
                  <i /> Online now!
                </p>
                <p class="w2-muted">member since 2004</p>
              </div>
            </div>

            <div class="w2-box">
              <h2 class="w2-box-h">What are you doing right now?</h2>
              <div class="w2-box-b">
                <textarea
                  class="w2-input"
                  rows={4}
                  aria-label="Your status (it's your note)"
                  value={draft.value}
                  onInput$={(_, el) => (draft.value = el.value)}
                />
                <div class="w2-status-row">
                  <span class="w2-muted">{saving.value ? 'Saving…' : `${Math.max(0, 140 - draft.value.length)} characters left`}</span>
                  {saving.value && <span class="w2-spinner" aria-hidden="true" />}
                  <button type="button" class="w2-gloss w2-gloss-green" disabled={saving.value} onClick$={update}>
                    Update
                  </button>
                </div>
              </div>
            </div>

            <div class="w2-box w2-cloud-box">
              <h2 class="w2-box-h">Popular tags</h2>
              <p class="w2-box-b w2-cloud">
                {TAGS.map(([t, size]) => (
                  <span key={t} class="w2-a" style={{ fontSize: `${size}px` }}>
                    {t}
                  </span>
                ))}
              </p>
            </div>
          </aside>

          <main class="w2-feed">
            <span class="w2-burst" aria-hidden="true">
              <span>NEW!</span>
            </span>

            <article key={`note-${flash.value}`} class={['w2-post', flash.value > 0 && 'w2-yft']}>
              <div class="w2-digg">
                <b>{diggs.value}</b>
                <span>diggs</span>
                <button
                  type="button"
                  disabled={dugg.value}
                  onClick$={() => {
                    diggs.value++
                    dugg.value = true
                  }}
                >
                  {dugg.value ? 'dugg!' : 'digg it'}
                </button>
              </div>
              <div class="w2-post-b">
                <h3>
                  <span class="w2-a">you</span>{' '}
                  updated notes.txt
                </h3>
                <ul class="w2-note">
                  {lines.length ? lines.map((l, i) => <li key={i}>{l || ' '}</li>) : <li class="w2-muted">(nothing yet)</li>}
                </ul>
                <p class="w2-meta">
                  {flash.value ? 'posted just now' : 'posted 3 minutes ago'} via web · <span class="w2-a">3 comments</span> · <span class="w2-a">share this</span>
                </p>
              </div>
            </article>

            <article class="w2-post w2-photo-post">
              <figure class="w2-polaroid">
                <img src={LAKE_SRC} alt="A lake at sunset, mountains reflected in the water" width={320} height={200} />
                <figcaption>lake at sunset ☀</figcaption>
              </figure>
              <div class="w2-post-b">
                <h3>
                  <span class="w2-a">lake.jpg</span>
                </h3>
                <p class="w2-tags">
                  tags: <span class="w2-a">sunset</span> <span class="w2-a">lake</span> <span class="w2-a">summer</span> <span class="w2-a">nofilter</span>
                </p>
                <div class="w2-rate">
                  <div class="w2-stars" role="radiogroup" aria-label="Rate this photo">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={rating.value === n}
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}
                        class={['w2-star', n <= rating.value && 'on']}
                        onClick$={() => (rating.value = n)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span class="w2-muted">{rating.value ? 'Thanks for rating!' : 'rate it'}</span>
                </div>
                <p class="w2-meta">
                  uploaded <span data-clock="web2-date">Sep 27, 2005</span> · 12 favorites · <span class="w2-a">slideshow</span>
                </p>
              </div>
            </article>

            <section class="w2-box w2-wall">
              <h2 class="w2-box-h">
                Your wall <span class="w2-count">{msgs.length}</span>
              </h2>
              <div class="w2-box-b">
                {msgs.length === 0 && <p class="w2-muted">Nothing on your wall. You archived everyone in 2015.</p>}
                {msgs.map((m) => (
                  <button key={m.id} type="button" class={['w2-wallpost', !m.read && 'unread']} onClick$={() => (m.read = true)}>
                    <span class="w2-avatar" style={{ '--h': String(m.hue) }}>
                      {initial(m.from)}
                    </span>
                    <span class="w2-wall-b">
                      <span>
                        <b>{m.from}</b> wrote: <em>{m.subject}</em>
                        {!m.read && <span class="w2-new">new!</span>}
                      </span>
                      <span class="w2-muted">{m.body}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </main>
        </div>

        <footer class="w2-footer">
          <div class="w2-wrap">
            <p class="w2-badges" aria-label="Badges">
              {BADGES.map(([a, b, c]) => (
                <span key={a} class="w2-badge">
                  <span style={{ background: c }}>{a}</span>
                  <span>{b}</span>
                </span>
              ))}
            </p>
            <p class="w2-muted">© 2005 notr, a Web 2.0 company · About · Blog · API · Terms · Privacy · Jobs (we're hiring!)</p>
          </div>
        </footer>
      </div>
    </section>
  )
})
