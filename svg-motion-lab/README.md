# SVG Motion Lab

A small lab of interactive **SVG animation** techniques, built with **Vue 3** + **Vite**. Five demos showcase code-driven vector motion with **[anime.js v4](https://animejs.com/)** and designer-authored playback with **[Lottie](https://airbnb.io/lottie/)** — line drawing, shape morphing, grid staggers, motion paths and a runtime-controlled Lottie player, all on a minimal dark UI.

**Live demo:** <https://yuratadevosyan.github.io/three-js-and-animations/svg-motion-lab/>

Part of [`three-js-and-animations`](../README.md) — see all showcases at the
[index page](https://yuratadevosyan.github.io/three-js-and-animations/).

## Demos

| | Demo | What's inside |
|---|---|---|
| 01 | **Line drawing** | `svg.createDrawable` turns paths into stroke-dash drawables; a `stagger` reveals each path in sequence. |
| 02 | **Shape morphing** | `svg.morphTo` interpolates one path's `d` into another — blob ↔ star ↔ heart — across differing point counts. |
| 03 | **Grid stagger wave** | One `animate()` call drives 88 nodes; a grid `stagger` ripples the delay outward from a selectable origin (center / first / last). |
| 04 | **Motion path** | A follower rides a figure-eight track via `getPointAtLength`, auto-rotating to the curve's tangent. |
| 05 | **Lottie playback** | A hand-authored Lottie JSON rendered to live SVG via `lottie-web`, with play/pause and 0.5×/1×/2× speed controls. |

## Stack

- **Vue 3** (`<script setup>`) + **Vite** + **TypeScript**
- **anime.js v4** — `animate`, `stagger`, and the `svg` helpers (`createDrawable`, `morphTo`), plus path-following via native `getPointAtLength`
- **lottie-web** — imported as `lottie_light` (SVG renderer, no AE-expressions engine, so no `eval` and ~half the bundle)
- **Tailwind CSS** with HSL CSS-variable theming

## Architecture

- **Each demo is a self-contained `.vue` component** under `src/demos/`, wrapped by a shared `DemoCard` (stage + controls + tech chips). Adding a demo is one file plus one line in `App.vue`.
- **anime targets are resolved from template refs**, not global selectors, so multiple demos never collide. Looping animations are cleaned up with `revert()` / `pause()` in `onBeforeUnmount`.
- **The Lottie animation is bundled** as `src/animations/orbit.json` and passed via `animationData`, so it works offline and on GitHub Pages with no runtime fetch.

## Local development

```bash
npm install
npm run dev          # vite dev server
npm run build        # vue-tsc -b (typecheck) && vite build → dist/
npm run preview      # serve dist/ locally
```

## Deployment

Publishes to the `gh-pages` branch under
<https://yuratadevosyan.github.io/three-js-and-animations/svg-motion-lab/>:

```bash
npm run deploy
```

The script builds, then runs `gh-pages -d dist -e svg-motion-lab`, so it lands
in its own subfolder and doesn't clobber the sibling apps.

## Bring your own Lottie

Drop any `.json` exported from After Effects (Bodymovin) or
[LottieFiles](https://lottiefiles.com/) into `src/animations/` and import it in
`src/demos/LottieDemo.vue` — the player controls work with any animation.
