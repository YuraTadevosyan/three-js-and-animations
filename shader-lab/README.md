# Shader Lab

A small GLSL experimentation lab built with **React Three Fiber** and hand-written shaders. Seven demos share a single fullscreen canvas and a minimal dark UI, with real-time controls, cross-faded transitions, pointer-driven uniforms, and tiny synthesized UI sounds.

**Live demo:** <https://yuratadevosyan.github.io/three-js-and-animations/shader-lab/>

Part of [`three-js-and-animations`](../README.md) — see all showcases at the
[index page](https://yuratadevosyan.github.io/three-js-and-animations/).

## Demos

| | Demo | What's inside |
|---|---|---|
| 01 | **Water** | Layered sine + fbm height field; screen-space derivatives drive normals, specular, and sky refraction. Pointer drops radial ripples. |
| 02 | **Noise Distortion** | Domain-warped fbm rendered to a cosine palette. Pointer pulls the warp field. |
| 03 | **Plasma** | Summed-sine plasma through a cosine palette with a pointer-driven swirl center. |
| 04 | **Voronoi** | Animated cellular noise — seeds gently drift, the pointer pulls them toward the cursor, and bright edges trace cell borders. |
| 05 | **Kaleidoscope** | N-fold polar wedge mirror over an fbm field. Twist with radius, segments tunable from 3 → 16. |
| 06 | **Glow Hologram** | Fresnel rim + local-space scanlines + UV grid + per-band glitch jitter on an icosahedron, drawn additively over a soft halo. |
| 07 | **Particle Sim** | 25 000 GPU points animated entirely in the vertex shader from a curl-noise field. Pointer becomes a 3D attractor projected onto the z = 0 plane. |

## Architecture

- **One R3F `<Canvas>`** mounts demos as React components. Each demo owns its own `ShaderMaterial`, uniforms, and `useFrame` loop.
- **Demos are registered** in `src/lib/demos.ts` with a control schema (`range` / `toggle` / `color`). The right-side panel renders sliders / toggles from that schema, so adding a demo is one file.
- **Cross-fade transitions** are driven by a shared `opacityRef` (`Stage.tsx`). Refs avoid per-frame React re-renders; each demo samples the ref in its own `useFrame` and writes to `uOpacity`.
- **GPU-first**: animation lives in shaders. Particle positions are computed per-frame in the vertex shader from static per-particle attributes — no JS-side updates. `depthWrite: false` + additive blending where it makes sense.
- **Pointer interaction** flows through `usePointerUV()`, which exposes a smoothed 0..1 UV vector via a stable ref. 3D demos unproject it onto a world plane.
- **UI sounds** are generated on the fly via `AudioContext` + `OscillatorNode` — no asset files. Hover ticks are throttled; mute state persists in `localStorage`.

## Run

```bash
npm install
npm run dev
```

Type-check: `npm run typecheck`. Build: `npm run build`. Deploy: `npm run deploy` (publishes `dist/` to the `shader-lab` subfolder on `gh-pages`).

## Adding a demo

1. Create `src/demos/MyDemo.tsx` exporting a `DemoDef`.
2. Append it to `DEMOS` in `src/lib/demos.ts`.

That's it — the switcher, control panel, About listing, and transitions pick it up automatically.
