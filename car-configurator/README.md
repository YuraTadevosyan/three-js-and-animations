# car-configurator

A premium **3D car configurator** — a procedural **BMW E46** sitting in a
Need-for-Speed-style garage. Built with **React Three Fiber**, **drei**, and
**GSAP**: real-time paint transitions, swappable alloy wheels, coloured brake
calipers, angel-eye headlights, cinematic camera presets, and a glossy
reflective stage with bloom.

**Live:** <https://yuratadevosyan.github.io/three-js-and-animations/car-configurator/>

## Features

- **Procedural BMW E46 model** — body, greenhouse, kidney grille, mirrors,
  taillights, splitter, side skirts and exhausts assembled from `drei`
  `RoundedBox` panels sharing one physical clearcoat material.
- **Paint transitions** — eight BMW-individual finishes that cross-fade colour
  _and_ metalness/roughness with GSAP rather than snapping.
- **Interactive wheels** — four parametric rim designs (cross-spoke,
  M double-spoke, forged 10-spoke, gold BBS mesh) generated from a spoke
  count + fork descriptor, each with a drilled brake disc and a coloured
  caliper.
- **Angel-eye headlights** — twin round projectors whose coronas, lenses,
  spotlights and volumetric cones all switch on together via a GSAP timeline.
- **Cinematic camera** — a sweeping intro fly-in plus six GSAP-tweened presets
  (Hero / Front / Profile / Rear / Wheel / Overhead) layered over damped
  `OrbitControls`.
- **Reflections & shadows** — a `MeshReflectorMaterial` floor, soft
  `ContactShadows`, and a fully offline studio environment built from
  `Lightformer`s (no external HDR needed).
- **Need-for-Speed garage** — dark walls, neon accent strips, fog, and a
  bloom + vignette post pipeline.
- **Smooth UI** — glassmorphic panels with a staggered GSAP entrance, plus a
  turntable spin and "randomize build" toggle.
- **Responsive & accessible** — bottom-sheet UI on mobile, side panel on
  desktop, and a `prefers-reduced-motion` path that skips every animation.

## Tech

React 18 · TypeScript · Vite · Tailwind CSS · three.js · @react-three/fiber ·
@react-three/drei · @react-three/postprocessing · GSAP · lucide-react

## Architecture

```
src/
├── state/configStore.tsx     React context: paint, wheel, caliper, view, toggles
├── lib/config.ts             paint / wheel / caliper / camera-preset tables
├── components/
│   ├── CarConfigurator.tsx    layout + GSAP entrance timeline
│   ├── scene/
│   │   ├── CarScene.tsx        Canvas, fog, post-processing
│   │   ├── Car.tsx             the E46 shell + shared paint material
│   │   ├── Wheel.tsx           one parametric alloy wheel
│   │   ├── Headlights.tsx      angel-eye rings + beams (GSAP)
│   │   ├── Garage.tsx          environment, floor, lights, walls
│   │   └── CameraRig.tsx       intro + preset fly-to over OrbitControls
│   └── ui/                     glass panels, selectors, toolbar, view bar
└── hooks/useReducedMotion.ts
```

All configurable options live in [`src/lib/config.ts`](./src/lib/config.ts), so
the 3D scene and the controls are always driven from a single source of truth.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173/three-js-and-animations/car-configurator/
```

Other scripts:

```bash
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## Deploying

Publishes to its own subpath on the shared GitHub Pages site:

```bash
npm run deploy     # builds, then gh-pages -d dist -e car-configurator
```
