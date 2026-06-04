# Camp Nou — A Matchday Story

A scroll-driven matchday story at Camp Nou, built in the **blaugrana** palette
with **React**, **GSAP ScrollTrigger** and **Lenis**. Ten scenes — full-bleed
stadium hero, a one-card-at-a-time squad carousel, an interactive 4-3-3
formation diagram, a coaching-staff grid, a La Masia academy grid, a scrolled
trophy-cabinet counter, a horizontal-scrub timeline of iconic nights, a
parallax fans bleed, and a credits outro — animate as you scroll. A nav-bar
toggle plays *El Cant del Barça* in the background, with a Web-Audio
synth-ambience fallback. All animations run on the DOM; no `three.js`, no
`<canvas>`, single render pass.

**Live demo:** <https://yuratadevosyan.github.io/three-js-and-animations/immersive-story/>

Part of [`three-js-and-animations`](../README.md) — see all showcases at the
[index page](https://yuratadevosyan.github.io/three-js-and-animations/).

## Sections

| #   | Section          | What you see                                                                                                            |
| --- | ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 00  | **Hero**         | Full-bleed Camp Nou photo with a slow ken-burns zoom, scoreboard pill, big "MÉS QUE UN CLUB" reveal.                    |
| 01  | **Squad intro**  | "THE FIRST TEAM." headline announcing the carousel that follows.                                                        |
| 02  | **Squad**        | Pinned carousel — all 23 first-team players, one card at a time. Photo, big stroked shirt-number, bio.                  |
| 03  | **Shape**        | SVG 4-3-3 pitch with the starting XI plotted. Tap a dot to lift that player's card on the side.                         |
| 04  | **Staff**        | 3-up grid of coaching-staff cards (Hansi Flick + assistants).                                                            |
| 05  | **La Masia**     | Six-card grid of current first-teamers who came up through the academy — debut-year watermark, photo, one-line note.    |
| 06  | **The cabinet**  | Pinned trophy room — every competition's count rolls up from 0 → N as you scroll, with a gold grand-total counter.      |
| 07  | **Iconic nights** | Horizontal-scrub timeline. Six legendary matches (Wembley '92, Roma '09, La Remontada…) as typographic 100-vw panels.   |
| 08  | **Fans**         | Pinned crowd photo with parallax drift; 4 stats lift in as you scroll over it.                                          |
| 09  | **Outro**        | "VISCA EL BARÇA." sign-off + tech / data / image / audio credits.                                                        |

## Features

| Feature                        | What's inside                                                                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Pinned squad carousel**      | One scrubbed GSAP timeline crossfades all 23 players in the same physical frame as you scroll the pin (~11 viewport-heights total).     |
| **Live player counter**        | Top-right `07 / 23` counter and a bottom gradient progress bar update from the carousel timeline's `onUpdate`.                          |
| **Tactical 4-3-3 diagram**     | Pure SVG pitch (markings stroke-drawn via `stroke-dasharray`) with the starting XI plotted; hover/tap a dot to lift its player card.    |
| **Trophy-cabinet count-up**    | A single scrubbed dummy tween rewrites every numeric `<span>` on each frame — every tile counts up to `N` and a grand total to 92.      |
| **Horizontal scrub timeline**  | The Iconic Nights section pins and translates a track of N viewport-wide panels leftward; same primitive as the squad carousel.         |
| **Anthem audio toggle**        | Nav button plays an MP3 of *El Cant del Barça* on demand, falling back to a Web-Audio-synthesised stadium roar if the file is missing. |
| **IntersectionObserver text**  | `<SplitText>` lifts lines / words / chars into view from below — IO-driven so it works inside pinned sections that broke ScrollTrigger. |
| **Ken-burns hero**             | Hero photo scales 1.05 → 1.22 on scroll, a dual blue/red overlay deepens, scroll hint fades.                                            |
| **Parallax fans bleed**        | Crowd photo drifts and zooms inside a pinned section; stats stagger in via `data-fans-stat`.                                            |
| **Auto-hiding nav**            | `<StoryNav>` slides out on scroll-down and back in on scroll-up; always visible in the first 80 px.                                     |
| **About modal**                | Glass sheet listing the tech stack, notable techniques and bundle stats. Esc / backdrop / X to close; Lenis is paused while open.       |
| **Smooth scroll**              | Lenis runs off the GSAP ticker (one update loop) — ScrollTrigger and the inertial scroll stay in lockstep.                              |
| **Reduced-motion fallback**    | Animations collapse to ~0ms when `prefers-reduced-motion: reduce`; text is visible from the start.                                      |
| **Photo positioning**          | Player photos are `background-position: center top` so heads stay in frame on tall portrait crops.                                      |
| **Bundle**                     | ~360 KB JS + CSS (no `three.js`, no postprocessing). The `anthem.mp3` (~1.3 MB) and image assets dominate the deploy size.              |

## Stack

| Layer      | Choice                                                  |
| ---------- | ------------------------------------------------------- |
| Build      | Vite 5 (es2020 target, manual vendor chunks for GSAP and Lenis) |
| UI runtime | React 18 + TypeScript (strict)                          |
| Motion     | GSAP 3 + ScrollTrigger; Lenis 1 for smooth scroll       |
| Reveals    | Native `IntersectionObserver` (replaces ScrollTrigger for text reveals — more reliable inside pinned sections) |
| Audio      | `HTMLAudioElement` for the real anthem file; Web Audio API for the synth-ambience fallback (brown noise + lowpass + LFO swell) |
| Styling    | Tailwind CSS 3 + a small hand-written stylesheet for the design primitives |
| Fonts      | Archivo Black (display), Inter (body), JetBrains Mono (captions) — loaded from Google Fonts |

## Architecture

- **One scroll-driven controller per scene.** Each section has its own
  `useEffect` registering ScrollTrigger pins and tweens, then cleans them up
  on unmount. There's no global animation graph — adding / removing a section
  doesn't touch any other code.
- **Squad carousel = one master timeline.** All 23 cards stack absolutely in
  the same stage, hidden via `autoAlpha:0`. A `scrub`-driven GSAP timeline
  alternates `dwell → slide-out + slide-in` per card. The active card index
  is read back from `self.progress` to drive the counter and the progress
  bar — no second source of truth.
- **Reveal text via IntersectionObserver, not ScrollTrigger.**
  `<SplitText>` originally used ScrollTrigger, which silently failed inside
  pinned sections (the trigger's measured position fought the pin-spacer).
  The current implementation:
    1. CSS leaves the text fully visible — so a broken JS path doesn't leave
       lines permanently hidden.
    2. On mount, `gsap.set()` hides the pieces.
    3. An `IntersectionObserver` on the host plays the reveal when any of it
       enters the viewport — works identically in normal flow, pin spacers,
       and sticky containers.
    4. A 4-second safety net forces the reveal if the observer never fires.
- **Lenis × GSAP shared loop.** Lenis's `raf()` is driven from
  `gsap.ticker.add(...)`, and Lenis emits `scroll` events into
  `ScrollTrigger.update`. That keeps pinned sections from drifting against
  the inertial scroll position.
- **Modal stops the page.** Opening the About modal calls a
  module-scoped `pageScroll.stop()` (exposed by `useSmoothScroll`) and
  sets `body { overflow: hidden }`. The modal sheet adds
  `data-lenis-prevent` and `overscroll-contain` so its inner scroll never
  drifts the page.
- **Defensive CSS for text reveals.** The split-text primitives don't have
  any initial hidden transform — that state is set by JS on mount. If JS
  fails entirely, the page is still readable.
- **Trophy counters from one tween.** A single scrubbed `gsap.to({ p: 0..1 })`
  drives every numeric span via `onUpdate` — each tile's slice of progress
  is computed from a smoothed `p`, so the digits never drift if the user
  scrolls fast or reverses.
- **Audio: file-or-synth.** On mount, `<AudioToggle>` HEAD-probes
  `public/audio/anthem.mp3`; if it returns an `audio/*` response it uses
  that, otherwise it builds a stadium roar from brown noise + a lowpass
  filter + a slow LFO swell on a Web Audio gain. The button label
  switches between **Anthem** and **Ambience** so the user knows which is
  playing. The `AudioContext` is only constructed on first toggle —
  modern browsers require a user gesture.

## Project layout

```
src/
├── App.tsx                    section composition + smooth scroll + about state
├── main.tsx
├── index.css                  design primitives — palette, stripes, scoreboard, stats, audio button
├── vite-env.d.ts
├── components/
│   ├── AboutModal.tsx         glass sheet listing the tech stack
│   ├── AudioToggle.tsx        nav button — plays anthem.mp3 or a Web-Audio synth roar
│   ├── ChapterRail.tsx        right-side chapter dots; reads sections via querySelectorAll
│   ├── Cursor.tsx             blend-difference dot cursor
│   ├── SplitText.tsx          IO-driven word / line / char reveal
│   ├── StoryNav.tsx           top nav, auto-hide on scroll
│   └── StoryProgress.tsx      bottom progress bar driven by ScrollTrigger.onUpdate
├── data/
│   ├── squad.ts               23 player roster (auto-generated from Wikipedia)
│   ├── staff.ts               coaching staff (auto-generated from Wikipedia)
│   ├── lineup.ts              4-3-3 starting XI with pitch x/y coords; resolves players from squad.ts
│   ├── masia.ts               academy graduates currently in the squad + debut year + one-liner
│   ├── trophies.ts            7 competition tallies + grand total
│   └── moments.ts             6 iconic-night entries (year, score, opponent, title, caption)
├── hooks/
│   └── useSmoothScroll.ts     mounts Lenis + exposes `pageScroll.stop / start`
├── lib/
│   ├── cn.ts                  className helper
│   └── math.ts                lerp / clamp / smoothstep
└── sections/
    ├── Hero.tsx               full-bleed Camp Nou ken-burns
    ├── SquadIntro.tsx         intro card for the squad gallery
    ├── Squad.tsx              pinned carousel (master timeline)
    ├── Lineup.tsx             SVG 4-3-3 pitch + active-dot side panel
    ├── Staff.tsx              coaching-staff grid
    ├── Masia.tsx              La Masia academy-graduate grid
    ├── Trophies.tsx           pinned trophy cabinet with scroll-driven count-ups
    ├── IconicMoments.tsx      pinned horizontal-scrub timeline of legendary nights
    ├── Fans.tsx               pinned parallax crowd shot + stats
    └── Outro.tsx              credits, image attribution, footer
public/
└── audio/
    └── anthem.mp3             El Cant del Barça pulled from YouTube via yt-dlp (see Licensing caveat)
```

Adding a section: drop a component under `src/sections/`, add it to
`<App>` in render order, and (optionally) add a label to `CHAPTERS` in
[`ChapterRail.tsx`](./src/components/ChapterRail.tsx).

## Data + imagery

- **Squad roster** is parsed from the
  [2025-26 FC Barcelona season page on Wikipedia](https://en.wikipedia.org/wiki/2025-26_FC_Barcelona_season)
  via the parse API. Real names, shirt numbers, positions, nationalities,
  captain badges. Bios are the Wikipedia page-summary extracts.
- **Coaching staff** comes from the same page's Management Team section.
- **Player photos** are sourced via web image search (mostly the official
  `fcbarcelona.com` photo bucket and press agencies like *Mundo Deportivo*,
  *getfootballnewsspain*, *DAZN*, *Goal.com*). Each one is downsampled to
  ~2200 px tall and saved into `public/players/`.
- **Hero, fans, and pitch photos** come from
  [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Camp_Nou)
  under CC-BY-SA / CC-BY licences. Attribution is rendered in the Outro.
- **Trophy counts** are the cabinet at the start of the 2025-26 season,
  sourced from the *List of FC Barcelona records and statistics* article
  on Wikipedia. The grand total is computed at compile time.
- **Iconic-moments copy** is hand-written from the public match reports
  on Wikipedia — no images in this section, just typography, so no
  licensing question.
- **Anthem audio** (`public/audio/anthem.mp3`) is a short pre-match clip
  of *El Cant del Barça* sung at Camp Nou, pulled from YouTube via
  `yt-dlp` and transcoded to 96 kbps MP3 with `ffmpeg`. The recording is
  used here under the same "Internet (copyright unclear)" caveat that
  applies to the player photos — see below.

### Licensing caveat

Photos sourced from FCB / press agencies via web search are **not** licensed
for redistribution — they're public web URLs but the underlying images are
copyrighted by their owners. The data file marks them as
`license: 'Internet (copyright unclear)'`. The anthem audio in
`public/audio/anthem.mp3` falls under the same caveat: *El Cant del Barça*
is © FC Barcelona / its composers, and the recording was pulled from a
public YouTube video. For a personal portfolio on GitHub Pages the practical
risk is low; for any commercial deployment you'd need to either license
those assets properly or revert to the earlier Wikimedia-Commons-only photos
(`git checkout` an earlier commit of `public/players/` and
`src/data/squad.ts`) and delete the MP3 (the audio toggle automatically
falls back to a Web-Audio synth roar when the file is missing).

To drop in your own photos, save them as `public/players/<slug>.jpg` matching
the slugs in [`src/data/squad.ts`](./src/data/squad.ts) — the carousel picks
them up automatically. To use a different anthem track, replace
`public/audio/anthem.mp3` with any MP3 (the `<AudioToggle>` HEAD-probes the
path on mount and picks up the new file on the next page load).

## Local development

```bash
npm install
npm run dev          # vite dev server
npm run build        # tsc -b && vite build → dist/
npm run preview      # serve dist/ locally
npm run typecheck    # tsc -b --noEmit
```

## Deployment

Publishes to the `gh-pages` branch under
`/three-js-and-animations/immersive-story/`:

```bash
npm run deploy
```

The script runs `vite build` then `gh-pages -d dist -e immersive-story`, so
it lands in its own subfolder and doesn't clobber the sibling apps.

## License

Private / portfolio project — see the root [README](../README.md).
