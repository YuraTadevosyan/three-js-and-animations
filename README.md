# three-js-and-animations

A small collection of frontend showcase apps, plus a static landing page that
indexes them all. Each app is its own Vite build and deploys to a subpath of
the same GitHub Pages site.

**Live:** <https://yuratadevosyan.github.io/three-js-and-animations/>

## Showcases

| App | Live | Stack |
| --- | --- | --- |
| [`three-webgl-showcase`](./three-webgl-showcase) | [/three-webgl-showcase/](https://yuratadevosyan.github.io/three-js-and-animations/three-webgl-showcase/) | React, three.js, @react-three/fiber, GLSL, TanStack Router |
| [`music-visualizer`](./music-visualizer) | [/music-visualizer/](https://yuratadevosyan.github.io/three-js-and-animations/music-visualizer/) | React, R3F, Web Audio API (FFT), GLSL, postprocessing |
| [`gsap-animations-showcase`](./gsap-animations-showcase) | [/gsap-animations-showcase/](https://yuratadevosyan.github.io/three-js-and-animations/gsap-animations-showcase/) | React, GSAP, ScrollTrigger, Tailwind, shadcn/ui |
| [`shader-lab`](./shader-lab) | [/shader-lab/](https://yuratadevosyan.github.io/three-js-and-animations/shader-lab/) | React, R3F, GLSL ES (WebGL2), Web Audio API, Tailwind |
| [`physics-playground`](./physics-playground) | [/physics-playground/](https://yuratadevosyan.github.io/three-js-and-animations/physics-playground/) | React, Matter.js, GSAP, TypeScript, Tailwind |
| [`immersive-story`](./immersive-story) | [/immersive-story/](https://yuratadevosyan.github.io/three-js-and-animations/immersive-story/) | React, GSAP ScrollTrigger, Lenis, Tailwind |
| [`car-configurator`](./car-configurator) | [/car-configurator/](https://yuratadevosyan.github.io/three-js-and-animations/car-configurator/) | React, TypeScript, three.js, R3F, drei, postprocessing, GSAP, Tailwind |
| [`cyber-portfolio`](./cyber-portfolio) | [/cyber-portfolio/](https://yuratadevosyan.github.io/three-js-and-animations/cyber-portfolio/) | Next.js (static export), R3F, drei, postprocessing, GSAP, Lenis, Tailwind, zustand |
| [`svg-motion-lab`](./svg-motion-lab) | [/svg-motion-lab/](https://yuratadevosyan.github.io/three-js-and-animations/svg-motion-lab/) | Vue 3, Vite, anime.js v4 (svg helpers), KUTE.js (morph/draw/transform), Lottie (lottie-web), Tailwind |
| [`infinite-universe`](./infinite-universe) | [/infinite-universe/](https://yuratadevosyan.github.io/three-js-and-animations/infinite-universe/) | React, TypeScript, three.js, R3F, postprocessing, GSAP, simplex-noise, GLSL ES 3.0, Tailwind |
| [`ai-data-viz`](./ai-data-viz) | [/ai-data-viz/](https://yuratadevosyan.github.io/three-js-and-animations/ai-data-viz/) | Svelte 5 (runes), TypeScript, D3 (scale/shape/force), Canvas, Tailwind |
| [`interactive-museum`](./interactive-museum) | [/interactive-museum/](https://yuratadevosyan.github.io/three-js-and-animations/interactive-museum/) | Babylon.js 9, SolidJS, TypeScript, Web Audio (synthesis + spatial), Tailwind |
| [`holographic-os`](./holographic-os) | [/holographic-os/](https://yuratadevosyan.github.io/three-js-and-animations/holographic-os/) | Preact, @preact/signals, OGL (WebGL2), interact.js, GLSL ES 3.0, Tailwind |
| [`dna-visualization`](./dna-visualization) | [/dna-visualization/](https://yuratadevosyan.github.io/three-js-and-animations/dna-visualization/) | Angular 21 (zoneless, signals), TypeScript, raw WebGL2, GLSL ES 3.0, Tailwind |
| [`landing`](./landing) | [/](https://yuratadevosyan.github.io/three-js-and-animations/) | Static HTML / CSS / JS |

## Repo layout

```
.
├── landing/                    static index page (HTML/CSS/JS)
├── three-webgl-showcase/       Three.js + WebGL gallery
├── music-visualizer/           Audio-reactive R3F scene
├── gsap-animations-showcase/   GSAP motion patterns
├── shader-lab/                 GLSL shader experimentation lab
├── physics-playground/         Matter.js + GSAP physics UI playground
├── immersive-story/            FC Barcelona-styled scroll matchday story (GSAP + Lenis)
├── car-configurator/           BMW M3 GTR E46 car configurator (R3F + drei + GSAP, GLB model)
├── cyber-portfolio/            Cyberpunk developer portfolio (Next.js static export + R3F + GSAP)
├── svg-motion-lab/             SVG animation lab (Vue 3 + anime.js + KUTE.js + Lottie)
├── infinite-universe/          Endless procedural cosmos — streamed floating worlds, fly-between camera, warp (R3F + GSAP + simplex + GLSL)
├── ai-data-viz/                Six generated datasets — flowing graphs, morphing charts, animated node networks, plus a client-side statistical analyst (Svelte 5 + D3)
├── interactive-museum/         A portfolio you walk through — six rooms, first-person controls, per-room lighting and synthesized spatial ambience, six hidden interactions (Babylon.js 9 + SolidJS)
├── holographic-os/             A futuristic desktop — draggable/snapping glass windows, 3D folders, magnifying dock, live GPU graphs, a simulated weather system and a local assistant, over a volumetric WebGL lattice (Preact + signals + OGL)
└── dna-visualization/          Scale — a scrolled descent through nine biological scales, tissue to hydrogen bonds and back out to the p53 interaction network (Angular 21 + hand-written WebGL2, no 3D engine)
```

## Hosting model

GitHub Pages serves the `gh-pages` branch:

- `/three-js-and-animations/` → landing page (from `landing/public/`)
- `/three-js-and-animations/<app>/` → that app's `dist/` output

Each app uses the [`gh-pages`](https://www.npmjs.com/package/gh-pages) CLI
with `-e <app>` to publish into its own subfolder, so deploys don't clobber
the others. The landing page deploys with `--add` so it merges into the root
without touching the app subfolders.

The Vite apps publish their `dist/` output; `cyber-portfolio` is a Next.js
app that statically exports to `out/` (via `output: 'export'` + a `basePath`),
so it slots into the same subpath model.

## Local development

Each app is independent:

```bash
cd three-webgl-showcase     && npm install && npm run dev
cd music-visualizer         && npm install && npm run dev
cd gsap-animations-showcase && npm install && npm run dev
cd shader-lab               && npm install && npm run dev
cd physics-playground       && npm install && npm run dev
cd immersive-story          && npm install && npm run dev
cd car-configurator         && npm install && npm run dev
cd cyber-portfolio          && npm install && npm run dev   # Next.js, http://localhost:3000
cd svg-motion-lab           && npm install && npm run dev
cd infinite-universe        && npm install && npm run dev
cd ai-data-viz              && npm install && npm run dev
cd interactive-museum       && npm install && npm run dev
cd holographic-os           && npm install && npm run dev
cd dna-visualization        && npm install && npm run dev   # Angular CLI, http://localhost:4210
```

For the landing page:

```bash
cd landing
npm run dev    # serves landing/public on http://localhost:5180
```

## Deploying

Each app self-publishes to its own subpath:

```bash
cd three-webgl-showcase     && npm run deploy
cd music-visualizer         && npm run deploy
cd gsap-animations-showcase && npm run deploy
cd shader-lab               && npm run deploy
cd physics-playground       && npm run deploy
cd immersive-story          && npm run deploy
cd car-configurator         && npm run deploy
cd cyber-portfolio          && npm run deploy   # Next.js static export → out/
cd svg-motion-lab           && npm run deploy
cd infinite-universe        && npm run deploy
cd ai-data-viz              && npm run deploy
cd interactive-museum       && npm run deploy
cd holographic-os           && npm run deploy
cd dna-visualization        && npm run deploy
```

To publish the landing page:

```bash
cd landing && npm install && npm run deploy
```

The first time you run `npm install` inside `landing/`, the `gh-pages` CLI
will be installed locally.
