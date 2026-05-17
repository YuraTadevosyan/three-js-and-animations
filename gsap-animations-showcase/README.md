# GSAP Animations Showcase

A curated gallery of **17 high-performance GSAP patterns** — scroll
reveals, FLIP layouts, text splits, magnetic cursors, page transitions —
built with **React 19**, **Tailwind CSS**, and **shadcn/ui**. Each demo is
isolated, lazy-loaded, and viewable in light or dark mode with its source
code visible inline.

**Live demo:** <https://yuratadevosyan.github.io/three-js-and-animations/gsap-animations-showcase/>

Part of [`three-js-and-animations`](../README.md) — see all showcases at the
[index page](https://yuratadevosyan.github.io/three-js-and-animations/).

## Demo index

Each demo lives at
`/gsap-animations-showcase/#/animations/<slug>` on the live site (the app
uses `HashRouter`).

| #  | Demo                | Slug               | Tags                              |
| -- | ------------------- | ------------------ | --------------------------------- |
| 01 | Hero Reveal         | `hero-reveal`      | Timeline · Stagger · Hero         |
| 02 | Magnetic Buttons    | `magnetic-buttons` | Pointer · quickTo · Interactive   |
| 03 | Scroll Reveal       | `scroll-reveal`    | ScrollTrigger · Stagger           |
| 04 | Parallax Scene      | `parallax-scene`   | ScrollTrigger · Parallax          |
| 05 | Horizontal Scroll   | `horizontal-scroll`| ScrollTrigger · Pin · Scrub       |
| 06 | Animated Text Split | `text-split`       | Text · Stagger · Filter           |
| 07 | Morphing Cards      | `morphing-cards`   | FLIP · Layout                     |
| 08 | Animated Counter    | `animated-counter` | ScrollTrigger · Counter           |
| 09 | Infinite Marquee    | `image-marquee`    | Loop · Marquee · modifiers        |
| 10 | FLIP Gallery        | `flip-gallery`     | FLIP · Gallery                    |
| 11 | SVG Draw            | `svg-draw`         | SVG · ScrollTrigger · Stroke      |
| 12 | Page Transition     | `page-transition`  | Transition · Clip-path            |
| 13 | Custom Cursor       | `cursor-follower`  | Pointer · quickTo · Cursor        |
| 14 | 3D Card Tilt        | `card-tilt-3d`     | 3D · Pointer · Hover              |
| 15 | Stagger Loaders     | `stagger-loader`   | Loop · Stagger · Loader           |
| 16 | Wave Hover Text     | `wave-text`        | Text · Hover · Stagger            |
| 17 | Bento Grid Reveal   | `bento-reveal`     | ScrollTrigger · Grid · Reveal     |

Direct links: open
[`#/animations`](https://yuratadevosyan.github.io/three-js-and-animations/gsap-animations-showcase/#/animations)
for the full grid, or append any slug above as `#/animations/<slug>` for
a single demo with its source visible.

## Stack

| Layer        | Choice                                              |
| ------------ | --------------------------------------------------- |
| Build        | Vite 8 (es2020 target, manual chunks)               |
| UI runtime   | React 19 + TypeScript (strict)                      |
| Routing      | react-router-dom v7 (lazy routes via `React.lazy`)  |
| Animation    | GSAP 3 + ScrollTrigger + Flip                       |
| Styling      | Tailwind CSS + tailwindcss-animate                  |
| Components   | shadcn/ui primitives (`Card`, `Button`)             |
| Icons        | lucide-react                                        |
| Linting      | ESLint flat config + typescript-eslint              |

## Performance

- **Lazy-loaded demos** — every example in the registry is a
  `React.lazy()` import, so the initial bundle ships only the gallery
  shell and code-splits each demo on demand.
- **Manual vendor chunks** — `gsap` and react vendor code split into
  their own chunks (`vite.config.ts`), so the demo gallery shares the
  GSAP runtime across all examples without re-downloading.
- **`gsap.quickTo`** for pointer-tracking demos (Magnetic Buttons,
  Custom Cursor) to keep updates on the GSAP ticker without per-frame
  `to()` allocations.
- **ScrollTrigger cleanup** — demos register and kill their triggers in
  `useGSAP` cleanup hooks so route changes don't leak listeners.
- **`prefers-reduced-motion`** honored: motion-heavy demos shorten or
  skip on users with the reduced-motion preference set.

## Project layout

```
src/
├── App.tsx
├── main.tsx
├── animations/
│   ├── registry.ts                  metadata + lazy() imports for all demos
│   └── examples/                    one file per demo (see table above)
├── pages/
│   ├── Home.tsx                     landing hero
│   ├── Animations.tsx               demo grid
│   ├── About.tsx
│   └── NotFound.tsx
├── components/
│   ├── AnimationPage.tsx            single-demo wrapper with source view
│   ├── SourceCode.tsx               syntax-highlighted source panel
│   ├── ThemeProvider.tsx
│   ├── layout/                      Navbar · Footer · Layout
│   └── ui/                          shadcn primitives (button, card)
└── lib/utils.ts                     cn() helper
```

Adding a new demo:

1. Create `src/animations/examples/MyDemo.tsx` exporting a default
   component.
2. Append an entry to [`src/animations/registry.ts`](./src/animations/registry.ts)
   with a `slug`, `title`, `description`, `tags`, and
   `lazy(() => import('@/animations/examples/MyDemo'))`.

That's it — the route, gallery card, and source-code panel all derive
from the registry.

## Local development

```bash
npm install
npm run dev          # vite dev server
npm run build        # tsc -b && vite build → dist/
npm run preview      # serve dist/ locally
npm run lint
```

## Deployment

Publishes to the `gh-pages` branch under
`/three-js-and-animations/gsap-animations-showcase/`:

```bash
npm run deploy
```

The script runs `vite build` then
`gh-pages -d dist -e gsap-animations-showcase`, so it lands in its own
subfolder and doesn't clobber the sibling apps.

## License

Private / portfolio project — see the root [README](../README.md).
