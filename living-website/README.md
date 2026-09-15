# living-website

A page that behaves like an organism.

The sky breathes. The interface follows your cursor — buttons lean toward it,
pupils dilate in the dark, eyelids sag when you go quiet. A garden grows in real
time, keeps growing while the tab is closed, and cross-breeds itself: bees and
butterflies by day, moths after dark, carrying pollen between flowering plants
so their seeds come out as hybrids. Weather drifts on a Markov chain every
couple of minutes. And the colour of every element on screen is a function of
the actual hour where you are sitting, interpolated continuously from midnight
to midnight.

**Live:** <https://yuratadevosyan.github.io/three-js-and-animations/living-website/>

## Stack

| | |
| --- | --- |
| Framework | [Astro](https://astro.build/) 5 — static output, one page, no client router |
| Components | [Lit](https://lit.dev/) 3 web components, rendered into the **light DOM** |
| Transitions | [Motion](https://motion.dev/) 13 — one-shot transitions only |
| WebGL | [PixiJS](https://pixijs.com/) 8, hand-written GLSL ES 3.00 for the sky |
| Styling | Tailwind v3, HSL custom-property theming |
| Build | TypeScript 6, `astro check` |

Astro, Lit, Motion and PixiJS are all new to this repo. It is the first app here
built on web components rather than a framework's component model, and the first
to use a 2D WebGL renderer.

> **Astro is pinned to 5.x on purpose.** Astro 6+ requires Node ≥ 22.12, and
> every other app in this repo builds on the default Node 20. `chess-world` is
> already the one exception; there was no reason to add a second.

## The one rule

**There is exactly one `requestAnimationFrame` loop on the page.**

Everything that moves subscribes to it: the Pixi renderer, every pair of eyes,
the garden, the CSS custom properties, the cursor aura. CSS animations and
per-component rAF loops each run on their own timeline and drift apart within
seconds — which is most of the reason a page with a dozen animated widgets reads
as a pile of widgets rather than as one thing.

The corollary is that **one writer owns each property**. A button's transform is
composed in a single place from four inputs (magnetism, hover, press, breath)
rather than by four handlers taking turns with it.

Motion's job is the other half: transitions that have a beginning and an end —
scroll reveals, the notice when you come back, the caption under the garden. It
is also used purely as a gesture *detector* (`hover`, `press`) on the buttons,
setting target values that the heartbeat then springs toward.

## The systems

| System | What it does |
| --- | --- |
| **Breath** | One asymmetric oscillator — 40% inhale, a brief hold, 60% exhale. Rate runs 5–16 / min depending on how much you're moving. |
| **Circadian** | Seven palettes pinned around the clock, interpolated hue-by-hue on the short way round the wheel, written onto `:root` at 8Hz. |
| **Weather** | Ten systems on a Markov chain with a 90s–3.5min dwell. Seasonal re-weighting from the real date; aurora gated to night, snow to cold. |
| **Garden** | Plants grown from a sixteen-trait genome via an L-system, with a full life cycle: sprout → flower → seed → compost. |
| **Pollinators** | Bees, butterflies and moths that navigate to open flowers, carry pollen between plants, and ground themselves in rain or wind. |
| **Attention** | Pointer position, smoothed speed, arousal, idle time, and a four-state mood that drives breath rate, pupils and the dormancy veil. |

### The colour system is the circadian system

There is no dark mode here and no `dark:` variant anywhere in the markup.
Tailwind's tokens (`--background`, `--primary`, `--muted-foreground`, …) are
rewritten on `:root` as the day advances, so `bg-primary` is a different green
at noon than at 9pm and every component follows without knowing about it.

Writing custom properties on the root element invalidates style for the whole
document, so that runs at 8Hz with unchanged values skipped — far below the
threshold where the sun's motion would look like it was stepping.

### The garden persists, and inherits

Each plant carries a **genome**: sixteen heritable traits (species, segment
length, branching angle, curl, taper, leaf spacing, flower size, hue shift,
vigour and so on). `growSkeleton(genome, seed)` builds the geometry from those
means; the seed now only supplies per-branch jitter, so the same genome and
seed always grow the same plant.

That split is what makes heredity possible at all. Plants used to be a single
integer, which is beautifully compact but has no notion of inheritance —
crossing two seeds can only produce a third unrelated plant.

Growth is real time, modulated by daylight, soil moisture and temperature —
roughly 15 minutes of good conditions takes a seedling to maturity, and a night
takes about an hour. Time spent away counts too, at 40% rate and capped at six
hours, and it is replayed in 90-second chunks so a plant that was due to flower,
seed and die during your absence actually does all three in order.

### Pollination

Bees and butterflies fly when `daylight > 0.28`, moths when it drops below
`0.12`, and nothing flies through rain or a strong wind. They steer toward real
flower positions — published every frame by the renderer, because flowers move
with the wind and a target refreshed at 10Hz makes an insect visibly stutter —
and they prefer a plant they are not already carrying pollen from.

On arrival a pollinator delivers first and collects second, so one flower can
receive pollen and donate its own on the same visit. The receiving plant holds
that genome until it goes to seed; then:

- **Pollinated** → `crossGenomes()`. Each trait is independently dominant from
  one parent, dominant from the other, or intermediate, then given a small
  mutation. Hue blends rather than segregating, because it is the trait people
  actually read as "that one came from those two".
- **Not pollinated** → `mutateGenome()`. A near-copy that drifts, with a 4%
  chance of sporting into a different species outright. Without this a garden
  nobody watched would clone itself forever and heredity would be invisible.

Ferns never participate. Their wild type has no flowers, so nothing visits
them — which is roughly the correct botany, and worth knowing before filing it
as a bug.

## What's real, and what's simulated

**Real:** your local clock and calendar date; the sunrise equation (solar
declination at a fixed 40°N, so the day length genuinely shortens in December);
the frame counter; visit count and elapsed age; every particle, path and pixel,
all generated at runtime.

**Simulated:** the weather. It is a weighted Markov chain, not a forecast — no
network requests are made, and no location is requested or used.

**No network requests, no image files and no audio files ship with the build.**
Clouds, rain streaks, snowflakes and sun flares are all drawn into offscreen
canvases at boot.

## Notes for anyone editing this

**Lit renders into the light DOM.** `Organ` (in `src/components/base.ts`)
overrides `createRenderRoot()` to return `this`. Shadow DOM would wall each
element off from the Tailwind sheet and from the `:root` custom properties that
the entire colour system depends on. The trade-off is real: no style
encapsulation, and no `<slot>`.

**Wrapper components deliberately have no `render()`.** `LitElement.render()`
returns `noChange` by default, so `organ-card` and `living-title` never touch
their own children. That is what lets them wrap Astro-authored markup which
stays in the static HTML whether or not the bundle arrives.

**Pixi 8's GLSL conventions are load-bearing.** It detects GLSL ES 3.00 by
finding the literal string `#version 300 es` in the *fragment* source, then
strips it from both stages, prepends the precision qualifier and re-inserts the
version. So the directive must be present verbatim, precision must *not* be
declared by hand, and the fragment output must be named `finalColor`. The
renderer supplies `uProjectionMatrix`, `uWorldTransformMatrix` and
`uTransformMatrix` through bind groups 100/101 even to a fully custom shader;
custom uniform groups land in group 99 and don't collide.

`preference: 'webgl'` is set explicitly. The sky is hand-written GLSL and there
is no parallel WGSL version for the WebGPU backend.

**Per-frame work is kept to transforms.** The garden writes two transforms per
plant at frame rate; growth, colour and staging run at 10Hz and are all
change-guarded, and a branch stops being written to entirely once it is fully
drawn. Components sample `getBoundingClientRect()` at 8Hz rather than every
frame, because it forces layout.

**Organs only tick while on screen.** `Organ` uses an `IntersectionObserver`
with a 240px margin; only fixed backdrops set `alwaysTick`.

## Degradation

| If | Then |
| --- | --- |
| WebGL is unavailable | `SkyStage.create()` returns `null`; the CSS gradient underneath (driven by the same `--sky-*` tokens) stays visible and simply stops moving. |
| `localStorage` throws or is blocked | The garden starts fresh and runs in memory for the session. |
| A saved plant predates genomes, or a field is corrupt | `reviveGenome()` falls back to the seed-derived genome per field, so old gardens migrate instead of being wiped. |
| The bundle never loads | A failsafe timer in the layout's blocking script un-hides the scroll-revealed sections after 2.5s. All copy is in the static HTML. |
| `prefers-reduced-motion` | The rhythm keeps running so every timing stays correct, but amplitude collapses to near zero and precipitation budgets drop to 0. |

The blocking script in `src/layouts/Base.astro` also does a coarse three-way
day/dusk/night split before first paint, so arriving at 3am doesn't flash a
white page while the bundle loads.

## Layout

```
src/
├── organism/          the state, and the systems that mutate it
│   ├── index.ts       the singleton: wiring, tick order, visitor controls
│   ├── clock.ts       the single heartbeat
│   ├── state.ts       one typed state object, read by everything
│   ├── breath.ts      the master oscillator
│   ├── circadian.ts   solar model + the seven palettes
│   ├── weather.ts     profiles + the Markov transition table
│   ├── garden.ts      growth, life cycle, seeding, catch-up
│   ├── pollinators.ts insect agents, flower registry, cross-pollination
│   ├── attention.ts   pointer, arousal, mood
│   ├── theme.ts       palette → CSS custom properties
│   └── persistence.ts localStorage, defensively
├── gl/                PixiJS: stage, sky shader, weather layers, textures
├── components/        Lit organs (light DOM, viewport-gated)
├── lib/               math, colour, seeded RNG, genomes, the L-system,
│                       and the bed's shared coordinate space
├── layouts/           the shell + the no-flash boot script
└── pages/             index.astro — all copy lives here
```

`window.organism` is exposed on purpose. The state is meant to be legible.

## Local development

```bash
npm install
npm run dev        # http://localhost:5186
npm run typecheck  # astro check
npm run build      # astro check && astro build → dist/
```

## Deploying

```bash
npm run deploy     # gh-pages -d dist -e living-website
```
