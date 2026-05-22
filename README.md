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
| [`landing`](./landing) | [/](https://yuratadevosyan.github.io/three-js-and-animations/) | Static HTML / CSS / JS |

## Repo layout

```
.
├── landing/                    static index page (HTML/CSS/JS)
├── three-webgl-showcase/       Three.js + WebGL gallery
├── music-visualizer/           Audio-reactive R3F scene
├── gsap-animations-showcase/   GSAP motion patterns
├── shader-lab/                 GLSL shader experimentation lab
└── physics-playground/         Matter.js + GSAP physics UI playground
```

## Hosting model

GitHub Pages serves the `gh-pages` branch:

- `/three-js-and-animations/` → landing page (from `landing/public/`)
- `/three-js-and-animations/<app>/` → that app's `dist/` output

Each app uses the [`gh-pages`](https://www.npmjs.com/package/gh-pages) CLI
with `-e <app>` to publish into its own subfolder, so deploys don't clobber
the others. The landing page deploys with `--add` so it merges into the root
without touching the app subfolders.

## Local development

Each app is independent:

```bash
cd three-webgl-showcase     && npm install && npm run dev
cd music-visualizer         && npm install && npm run dev
cd gsap-animations-showcase && npm install && npm run dev
cd shader-lab               && npm install && npm run dev
cd physics-playground       && npm install && npm run dev
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
```

To publish the landing page:

```bash
cd landing && npm install && npm run deploy
```

The first time you run `npm install` inside `landing/`, the `gh-pages` CLI
will be installed locally.
