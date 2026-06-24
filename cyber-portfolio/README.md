# cyber-portfolio

A futuristic **cyberpunk developer portfolio** — _Cyberpunk 2077_ × _Blade Runner_ ×
developer aesthetic. An interactive 3D workspace floats in a neon-lit, foggy
night scene while the camera dollies between sections as you scroll.

**Stack:** Next.js (App Router, static export) · React Three Fiber · drei ·
@react-three/postprocessing · GSAP + ScrollTrigger · Lenis · Tailwind · zustand · TypeScript.

## Features

- **Animated intro scene** — a GSAP boot-sequence overlay that types a log,
  fills a loader and wipes away to reveal the site ([IntroOverlay](src/components/ui/IntroOverlay.tsx)).
- **Floating neon particles** — ~900 GPU-driven points (custom GLSL, additive
  blending) that drift entirely on the vertex shader — no per-frame CPU work
  ([Particles](src/components/canvas/Particles.tsx)).
- **Interactive 3D workspace** — a procedural dev desk: glowing shader
  "terminal", neon edge bars, a rotating holographic core, parallax tilt toward
  the pointer ([Workspace](src/components/canvas/Workspace.tsx)).
- **Camera transitions between sections** — one cinematic waypoint per section;
  the rig lerps between them with frame-rate-independent damping
  ([CameraRig](src/components/canvas/CameraRig.tsx), [waypoints](src/components/canvas/waypoints.ts)).
- **Smooth scrolling** — Lenis hooked into GSAP's ticker so ScrollTrigger and
  inertia share one clock ([SmoothScroll](src/components/providers/SmoothScroll.tsx)).
- **Animated text reveal** — masked per-word/char rises ([RevealText](src/components/ui/RevealText.tsx)).
- **Glassmorphism UI** — blurred, clipped-corner HUD panels ([GlassCard](src/components/ui/GlassCard.tsx)).
- **About / colophon modal** — a glass dialog listing the exact tech stack
  (Escape / backdrop close, scroll-lock, GSAP transitions), opened from the
  navbar info button or the contact footer ([TechModal](src/components/ui/TechModal.tsx)).
- **Responsive design** — particle count, antialiasing and DPR adapt to mobile.
- **High-FPS optimized** — adaptive DPR via `<PerformanceMonitor>`, GPU shaders,
  a store-driven render loop (the R3F tree never re-renders on scroll), and full
  `prefers-reduced-motion` support.
- **Modular reusable components** — `canvas/`, `ui/`, `sections/`, plus a small
  zustand scene store and shared hooks.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

## Build & deploy

This app deploys to a GitHub Pages subpath like its siblings. It statically
exports (`output: 'export'`) and, in production, prefixes every asset/route
with `/three-js-and-animations/cyber-portfolio`.

```bash
npm run build    # → ./out (static)
npm run preview  # serve ./out locally on :5181
npm run deploy   # build → out/, then gh-pages -d out -e cyber-portfolio -t
```

> Locally the `basePath` is empty, so `npm run dev` and the production export
> behave identically apart from the URL prefix.

### `.nojekyll` (important for GitHub Pages)

GitHub Pages runs Jekyll, which **silently deletes any folder starting with
`_`** — including Next.js's `_next/`, where every JS/CSS chunk lives. Without a
fix the deployed page renders as unstyled HTML with no scripts.

To disable Jekyll, the gh-pages branch needs a **`.nojekyll` file at its root**
(a copy inside a subfolder is *not* enough). The root is published by the
`landing` app, so `landing/public/.nojekyll` is committed and `landing`'s
deploy uses `-t` (include dotfiles). This app also writes its own
`out/.nojekyll` on `postbuild` and deploys with `-t` for good measure.

If the deployed page ever looks unstyled, redeploy the landing page once:

```bash
cd ../landing && npm install && npm run deploy   # puts .nojekyll at the root
```

## Project structure

```
src/
├── app/                      layout, page, global cyberpunk theme
├── components/
│   ├── canvas/               R3F scene: Scene, CameraRig, Particles, Workspace, Floor, Effects
│   ├── providers/            Lenis smooth-scroll provider
│   ├── sections/             Hero, About, Projects, Skills, Contact
│   ├── ui/                   GlassCard, RevealText, NeonButton, Navbar, Hud, Section, …
│   └── Portfolio.tsx         client root wiring it all together
├── hooks/                    pointer tracker, media queries, isomorphic layout effect
├── lib/                      gsap registration, cn(), portfolio content
└── store/                    zustand scene store (active section, scroll, pointer)
```
