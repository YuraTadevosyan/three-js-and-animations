# Physics Playground

A physics-based interactive UI playground built with **React**, **Matter.js**
and **GSAP**. Every card on screen is a real rigid body — drag it, fling it,
pile it up — over a dark UI with a magnetic cursor, elastic hover, dynamic
collisions, and a drifting particle field. Toggle gravity, magnet mode, or
slow-motion from the dock, or drive it all from the keyboard. Touch and
mobile supported.

**Live demo:** <https://yuratadevosyan.github.io/three-js-and-animations/physics-playground/>

Part of [`three-js-and-animations`](../README.md) — see all showcases at the
[index page](https://yuratadevosyan.github.io/three-js-and-animations/).

## Features

| Feature                 | What's inside                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| **Draggable cards**     | Each card is a chamfered Matter.js body; a `MouseConstraint` handles mouse and touch dragging.          |
| **Elastic hover**       | Hovering a card runs a springy `elastic.out` GSAP tween on its visual face.                             |
| **Magnetic cursor**     | A custom two-part cursor (dot + trailing ring); a Magnet mode also pulls orbs toward the pointer.       |
| **Dynamic collisions**  | `collisionStart` gated by closing speed spawns an impact ring and a brightness pulse on both bodies.    |
| **Floating particles**  | Bouncy orb bodies in the simulation, plus an ambient parallax canvas layer behind everything.           |
| **Smooth interpolation** | `gsap.quickTo` drives the cursor at two lerp speeds; the particle parallax eases toward the pointer.   |
| **Modern dark UI**      | Glassy cards, accent glows, a vignette, and a live FPS / hit / body HUD.                                |
| **Mobile support**      | Touch dragging, `touch-action: none`, a viewport-scaled layout, and `prefers-reduced-motion` fallbacks. |
| **Slow-motion toggle**  | Scales `engine.timing.timeScale` so collisions read in slow-mo without rebuilding the world.            |
| **Keyboard shortcuts**  | Every dock toggle and the About panel are bound to single keys (see below).                             |
| **About panel**         | Glass modal listing features, controls, and the stack — opened from the header or with `?` / `i`.        |

## Controls

| Where     | How it works                                                                                          |
| --------- | ----------------------------------------------------------------------------------------------------- |
| Drag      | Click / touch any card or orb and throw it. The dragged card lifts (drop shadow + accent ring).        |
| Hover     | Pointer over a card runs an `elastic.out` scale pop. Skipped on touch devices.                         |
| Dock      | Gravity · Magnet · Slow-mo (toggles) and Explode · Reset (momentary). Each button is magnetic.         |
| Header    | An `i` button in the top-right opens the About panel.                                                  |

### Keyboard

| Key                     | Action                          |
| ----------------------- | ------------------------------- |
| `G`                     | Toggle gravity                  |
| `M`                     | Toggle magnet                   |
| `S`                     | Toggle slow-mo                  |
| `E` / `Space`           | Explode                         |
| `R`                     | Reset                           |
| `?` / `I`               | Open the About panel            |
| `Esc`                   | Close the About panel           |

## Stack

| Layer      | Choice                                          |
| ---------- | ----------------------------------------------- |
| Build      | Vite 5 (es2020 target, manual vendor chunks)    |
| UI runtime | React 18 + TypeScript (strict)                  |
| Physics    | Matter.js 0.20 — rigid-body 2D engine           |
| Animation  | GSAP 3 (`quickTo`, elastic / back eases)        |
| Styling    | Tailwind CSS 3                                  |

## Architecture

- **Matter.js owns motion; the DOM is the renderer.** Cards and orbs are real
  HTML elements. Each frame, the engine's `afterUpdate` event writes a
  `translate3d(...) rotate(...)` transform onto every body's element — no
  `<canvas>` for the bodies themselves.
- **Two-layer cards.** The outer `.physics-body` element carries the
  physics transform (rewritten every frame), while an inner `.card-face`
  stays free for GSAP to drive hover scale, the entrance pop, and collision
  flashes without ever fighting the sync loop.
- **Off-render-path updates.** FPS / hit counters (`Header`) and impact rings
  (`CollisionLayer`) expose imperative handles, so the physics loop updates
  them every frame without re-rendering the React tree.
- **Magnetic cursor, two ways.** The cursor visual lags via two `quickTo`
  speeds and scales over `[data-cursor]` elements; Magnet mode additionally
  applies a distance-falloff attractive force to the orb bodies.
- **Layout scaling.** `buildLayout()` derives a single scale factor from the
  viewport so the whole card set fits on a phone; bodies and font sizes scale
  together, and resizing only re-frames the static walls.
- **Slow-mo without rebuild.** The Slow-mo button writes to
  `engine.timing.timeScale`, so the same world keeps running at a fraction
  of the tick rate — collisions still resolve, just visibly slower.
- **Cleanup.** The engine, runner, events, and Matter's mouse listeners are
  all torn down on unmount, so React StrictMode's double-mount can't leak
  duplicate handlers.

## Project layout

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── components/
│   ├── Playground.tsx        physics world setup + orchestration + shortcuts
│   ├── PhysicsCard.tsx       a DOM card synced to a Matter body
│   ├── PhysicsOrb.tsx        a glowing circular "particle" body
│   ├── MagneticCursor.tsx    custom two-part trailing cursor
│   ├── ParticleField.tsx     ambient background canvas (parallax)
│   ├── CollisionLayer.tsx    imperative impact-ring effects
│   ├── ControlDock.tsx       gravity · magnet · slow-mo · explode · reset
│   ├── AboutPanel.tsx        modal listing features, controls, and stack
│   └── Header.tsx            title + live HUD + about button
├── hooks/
│   ├── useMagnetic.ts        magnetic-pull for the dock buttons
│   └── useReducedMotion.ts
└── lib/
    ├── cards.ts              card + orb definitions, layout scaling
    ├── physics.ts            Matter body factories + force helpers
    ├── math.ts               lerp / clamp / damp / rand helpers
    └── cn.ts                 className helper
```

Adding a card: append an entry to `CARD_BLUEPRINT` in
[`src/lib/cards.ts`](./src/lib/cards.ts) with an `id`, `kind`, base size, and
accent. The body, DOM element, entrance, and collision wiring all derive from
it automatically.

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
`/three-js-and-animations/physics-playground/`:

```bash
npm run deploy
```

The script runs `vite build` then `gh-pages -d dist -e physics-playground`, so
it lands in its own subfolder and doesn't clobber the sibling apps.

## License

Private / portfolio project — see the root [README](../README.md).
