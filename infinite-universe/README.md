# Infinite Universe

An endless, procedurally generated cosmos with **no beginning and no end** — you
fall forever through a corridor of floating islands and glowing worlds, threaded
together by pulses of light. Built with **React Three Fiber**, **GSAP**,
**simplex-noise** and hand-written **GLSL ES 3.0** shaders.

**Live demo:** <https://yuratadevosyan.github.io/three-js-and-animations/infinite-universe/>

Inspired by universe exploration and _No Man's Sky_.

## How the infinity works

The universe is a corridor along the −Z axis. Every world is a pure,
deterministic function of an integer **slot** ahead of the camera
([`worldFromSlot`](./src/lib/worldgen.ts)). A fixed pool of ~26 slots is kept
alive and slides forward as you travel, streaming worlds in and out — so a
couple dozen meshes create a boundless cosmos while everything stays seamless
and reproducible. The nebula skydome and starfield recenter on the camera each
frame, so the far distance is never any closer.

## Features

- **Infinite travel & warp zoom** — cruise forever; four speed levels plus a
  hyperspace jump that stretches the dust into streaks and floods the sky.
- **Procedural generation** — seeded biomes, palettes, terrain, rings and names.
  Planets, floating islands, gas giants, crystal worlds and rare anomalies.
- **Floating islands** — sculpted in the vertex shader (upper terrain, tapered
  hanging underside).
- **Connected worlds** — a constellation of light-threads rewires itself as the
  corridor streams, with energy pulses flowing along each link.
- **Cinematic camera** — organic simplex-noise drift you can steer with the
  mouse; click any world for a GSAP fly-to that eases in and settles into orbit.
- **Dynamic lighting** — a distant sun circles with a drifting hue, lighting
  every world in unison; bloom lifts every emissive core and atmosphere rim.
- **GLSL** — simplex/fbm displacement, faceted low-poly normals from screen-space
  derivatives, fresnel atmospheres, an infinite nebula and warp streaks.
- **Hidden easter eggs** — the Konami code triggers a warp; rare **monolith**
  worlds decode a secret when scanned; the logo remembers seven clicks.

## Controls

| Action | Effect |
| --- | --- |
| Move mouse | Steer / trim heading |
| Click a world | Fly in and scan it |
| Scroll | Change cruising speed |
| Warp button / Konami code | Hyperspace jump |
| `Esc` | Release a scanned world |

Respects `prefers-reduced-motion` (gentler drift, slower spins, calmer effects).

## Tech

React · TypeScript · three.js · @react-three/fiber · @react-three/postprocessing
· GSAP · simplex-noise · GLSL ES 3.0 · Tailwind · Vite

## Local development

```bash
npm install
npm run dev        # http://localhost:5173/three-js-and-animations/infinite-universe/
npm run build      # tsc -b && vite build → dist/
npm run deploy     # gh-pages -d dist -e infinite-universe
```
