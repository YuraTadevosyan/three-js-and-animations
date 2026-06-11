# car-configurator

A premium **3D car configurator** for a **BMW M3 GTR E46** (the Need for Speed
Most Wanted "Razor" car), built with **React Three Fiber**, **drei**, and
**GSAP**. A real GLB model is loaded, auto-fitted into a Need-for-Speed-style
garage, and driven by a live configurator: paint transitions, wheel/caliper
finishes, angel-eye headlights, cinematic camera presets, reflections and bloom.

**Live:** <https://yuratadevosyan.github.io/three-js-and-animations/car-configurator/>

## Features

- **Real BMW M3 GTR E46 model** — a 14-material GLB is loaded with `useGLTF`,
  cloned (so the cached asset is never mutated), shadow-enabled, and
  **auto-fitted**: scaled to a known length, laid long-axis-along-Z, and
  oriented front-forward by detecting the taillight glass, then centred and
  dropped onto the floor.
- **Paint transitions** — twelve presets plus a **custom colour picker**, all
  GSAP-tweening the body material's colour *and* metalness/roughness. The baked
  livery map is removed so solid colours read true.
- **Real wheel swapping** — choose the OEM GTR rims or a **real wheel GLB**
  (e.g. the included tuner mesh). The OEM hub positions are measured after the
  auto-fit; on a non-OEM selection the relevant factory parts are hidden and the
  chosen wheel is centred, scaled to the hub radius, axle-oriented onto the
  car's wheel axis, and tinted with the finish. Drop more wheel GLBs into
  `public/models/wheels/` and add an entry to `WHEEL_STYLES` to extend the list.
- **Wheel / caliper finish** — nine alloy finishes plus a **custom rim colour
  picker**. On this model the rims and calipers share one material, so the finish
  applies to both together (and to any procedural/loaded rims).
- **Angel-eye headlights** — toggles the headlight material's emissive plus two
  forward spotlights, animated on together via GSAP.
- **Cinematic camera** — a sweeping intro fly-in and six GSAP-tweened presets
  (Hero / Front / Profile / Rear / Wheel / Overhead) over damped `OrbitControls`.
- **Reflections & shadows** — a `MeshReflectorMaterial` floor, soft
  `ContactShadows`, and a fully offline studio environment built from
  `Lightformer`s (no external HDR needed).
- **Need-for-Speed garage** — dark walls, neon accent strips, neutral profile
  light bars (so the flanks/wheels read), fog, and a bloom + vignette post
  pipeline with ACES tone mapping.
- **Smooth UI** — glassmorphic panels with a staggered GSAP entrance, a
  turntable spin, a "randomize build" toggle, and an **About modal** listing the
  tech stack and model credits.
- **Responsive & accessible** — bottom-sheet UI on mobile, side panel on
  desktop, and a `prefers-reduced-motion` path that skips every animation.

## Tech

React 18 · TypeScript · Vite · Tailwind CSS · three.js · @react-three/fiber ·
@react-three/drei · @react-three/postprocessing · GSAP · lucide-react

## Architecture

```
src/
├── state/configStore.tsx     React context: paint, wheel style/finish, view, toggles
├── lib/config.ts             model urls + material ids + paint/wheel/camera tables
├── components/
│   ├── CarConfigurator.tsx    layout + GSAP entrance timeline
│   ├── scene/
│   │   ├── CarScene.tsx        Canvas, tone mapping, post-processing
│   │   ├── CarModel.tsx        loads/clones the GLB, auto-fits, measures hubs, drives materials
│   │   ├── WheelModel.tsx      loads a real wheel GLB, fits it to a hub, tints it
│   │   ├── ProceduralWheel.tsx generated rim fallback mounted at a hub
│   │   ├── Garage.tsx          environment, reflective floor, lights, walls
│   │   └── CameraRig.tsx       intro + preset fly-to over OrbitControls
│   └── ui/                     glass panels, selectors, toolbar, view bar, About modal
└── hooks/useReducedMotion.ts
```

The material ids the configurator drives live in
[`src/lib/config.ts`](./src/lib/config.ts) (`MAT`), so the controls and the GLB
stay in sync.

### Swapping the model

The car is `public/models/bmw-m3-gtr.glb`. To use a different car, replace that
file and update the `MAT` material-name map (and option tables) in
`src/lib/config.ts` to match the new model's material names. Inspect a GLB's
materials/meshes with any glTF viewer, or the small parser used during build-out.

## Model credit & licence

3D model: **"2005 BMW M3 GTR — Need for Speed Most Wanted"** by **get3dmodels**.
It is a fan-made asset — check and honour its original licence (typically
non-commercial, attribution-required) before using it publicly.

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
