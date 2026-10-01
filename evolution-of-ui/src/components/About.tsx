import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik'
import { ERA_TECH, TECH, WITHOUT } from './about-data'
import { ABOUT_EVENT } from './about-open'

type Status = 'yes' | 'part' | 'no' | 'info'

interface Check {
  label: string
  status: Status
  note: string
}

const supports = (prop: string, value: string): boolean => {
  try {
    return CSS.supports(prop, value)
  } catch {
    return false
  }
}

/** What this browser is actually doing with the page, right now. */
function detect(): Check[] {
  const w = window as unknown as Record<string, unknown>
  const gpuOn = !!document.querySelector('.layer-dos[data-gpu="on"], .layer-scifi[data-gpu="on"]')
  const gpu = 'gpu' in navigator
  const native = !!window.__eou?.native
  const listen = 'SpeechRecognition' in w || 'webkitSpeechRecognition' in w
  const speak = 'speechSynthesis' in w
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  let storage = false
  try {
    localStorage.setItem('eou.probe', '1')
    localStorage.removeItem('eou.probe')
    storage = true
  } catch {
    /* blocked */
  }
  return [
    {
      label: 'WebGPU',
      status: gpuOn ? 'yes' : gpu ? 'part' : 'no',
      note: gpuOn
        ? 'In use: the CRT and the hologram are drawn by your GPU.'
        : gpu
          ? 'Available. It starts when 1980 or 2040 comes into view.'
          : 'Not here. DOS is drawn as text and the hologram on Canvas 2D.',
    },
    {
      label: 'Scroll-driven animations',
      status: native ? 'yes' : 'part',
      note: native ? 'Native: the scroll timeline itself drives every transition.' : 'Not native: a scroll listener writes --t instead. Same CSS.',
    },
    {
      label: '@property',
      status: 'registerProperty' in CSS ? 'yes' : 'no',
      note: 'registerProperty' in CSS ? 'Typed --t, and the year counter in pure CSS.' : 'Transitions still work; the year counter may not.',
    },
    {
      label: 'color-mix()',
      status: supports('color', 'color-mix(in srgb, red, blue)') ? 'yes' : 'no',
      note: 'How the Web 2.0 gloss drains into Material indigo.',
    },
    {
      label: 'backdrop-filter',
      status: supports('backdrop-filter', 'blur(2px)') || supports('-webkit-backdrop-filter', 'blur(2px)') ? 'yes' : 'no',
      note: 'The frost on the 2025 glass.',
    },
    {
      label: 'Web Audio',
      status: 'AudioContext' in w ? 'yes' : 'no',
      note: 'AudioContext' in w ? 'Available. Sound starts off; turn it on in the rail.' : 'Silent here. Nothing else changes.',
    },
    {
      label: 'Web Speech',
      status: listen ? 'yes' : speak ? 'part' : 'no',
      note: listen ? 'You can talk to NEXUS in 2040.' : speak ? 'NEXUS can speak, but you’ll have to type.' : 'Typing only.',
    },
    {
      label: 'Saved between visits',
      status: storage ? 'yes' : 'no',
      note: storage ? 'Your note, painting and messages are kept in localStorage.' : 'Storage is blocked, so everything lasts for this visit.',
    },
    {
      label: 'Reduced motion',
      status: 'info',
      note: reduced ? 'On, and respected: no flicker, drift, tilt or physics.' : 'Off: full motion.',
    },
  ]
}

export const About = component$(() => {
  const env = useStore<{ checks: Check[] }>({ checks: [] })

  useVisibleTask$(
    ({ cleanup }) => {
      const run = () => {
        env.checks = detect()
      }
      run()
      window.addEventListener(ABOUT_EVENT, run)
      cleanup(() => window.removeEventListener(ABOUT_EVENT, run))
    },
    { strategy: 'document-idle' },
  )

  return (
    <dialog
      id="about"
      class="about"
      aria-labelledby="about-title"
      // A click on the dialog element itself (not its contents) is a click on the backdrop.
      onClick$={(e, el) => {
        if (e.target === el) el.close()
      }}
    >
      <div class="about-in">
        <header class="about-head">
          <p class="about-eyebrow">About this page</p>
          <h2 id="about-title">The Evolution of UI</h2>
          <p class="about-lede">
            Sixty years of interface design, rebuilt from scratch on one page. No screenshots and no emulators: every
            decade is drawn by today’s web platform, and every one of them works.
          </p>
          <button type="button" class="about-close" aria-label="Close" onClick$={(_, el) => el.closest('dialog')?.close()}>
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
            </svg>
          </button>
        </header>

        <section class="about-sec" aria-labelledby="about-env">
          <h3 id="about-env">Running in this browser</h3>
          <ul class="about-checks">
            {env.checks.length === 0 && <li class="info">Checking…</li>}
            {env.checks.map((c) => (
              <li key={c.label} class={c.status}>
                <i aria-hidden="true" />
                <b>{c.label}</b>
                <span>{c.note}</span>
              </li>
            ))}
          </ul>
        </section>

        <section class="about-sec" aria-labelledby="about-stack">
          <h3 id="about-stack">Built with</h3>
          <div class="about-groups">
            {TECH.map((g) => (
              <div key={g.title} class="about-group">
                <h4>{g.title}</h4>
                <ul>
                  {g.items.map((t) => (
                    <li key={t.name}>
                      <a href={t.href} target="_blank" rel="noreferrer">
                        <b>{t.name}</b>
                        {t.version && <span class="v">{t.version}</span>}
                      </a>
                      <p>{t.role}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section class="about-sec" aria-labelledby="about-eras">
          <h3 id="about-eras">Each decade, underneath</h3>
          <dl class="about-eras">
            {ERA_TECH.map((e) => (
              <div key={e.year}>
                <dt>
                  <span>{e.year}</span>
                  {e.name}
                </dt>
                <dd>{e.tech}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p class="about-without">
          <b>Built without</b> {WITHOUT.join(' · ')}.
        </p>

        <footer class="about-foot">
          <span>Yura Tadevosyan · 2026</span>
          <nav aria-label="Links">
            <a href="https://github.com/YuraTadevosyan/three-js-and-animations/tree/main/evolution-of-ui" target="_blank" rel="noreferrer">
              Source
            </a>
            <a href="/three-js-and-animations/">All showcases</a>
          </nav>
        </footer>
      </div>
    </dialog>
  )
})
