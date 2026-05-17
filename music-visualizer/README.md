# Music Visualizer

Audio-reactive WebGL visualizer built with **React 18**, **Three.js** via
**@react-three/fiber**, and a custom **GLSL** wave-distortion shader. A
1024-bin FFT splits any track into bass / mid / high bands that drive
geometry displacement, a 2,400-particle aura, bloom postprocessing, and a
beat-synced camera.

**Live demo:** <https://yuratadevosyan.github.io/three-js-and-animations/music-visualizer/>

Part of [`three-js-and-animations`](../README.md) — see all showcases at the
[index page](https://yuratadevosyan.github.io/three-js-and-animations/).

## Features

- **Four audio inputs** — drag-and-drop a file, paste a public URL, use the
  microphone (live FFT, no playback), or have the page synthesize a short
  demo track in-browser via `OfflineAudioContext`.
- **Six geometries** — icosahedron, tetrahedron, torus, cone, capsule, and
  torus knot, each with per-shape displacement tuning so thin shapes don't
  buckle on heavy bass.
- **Custom palette** — three color swatches in Settings replace the shader's
  low / mid / high uniforms; stored per-browser in `localStorage`.
- **Record to .webm** — the WebGL canvas stream is muxed with analyser audio
  via `MediaRecorder` and downloaded as a single file. One button, no
  server, full quality.
- **ID3 cover art** — for MP3s with ID3v2 tags, title, artist, and embedded
  cover art surface in the now-playing pill, parsed locally with
  `jsmediatags` (no upload).
- **Keyboard transport** — `Space` play/pause, `←/→` seek ±5s, `↑/↓` volume,
  `M` mute, `L` loop, `F` fullscreen, `R` restart.
- **Light + dark themes** — flash-free theme resolution at boot, bloom /
  vignette / particle opacity all retune per theme.
- **Reduced-motion aware** — `prefers-reduced-motion` reduces camera shake
  and drops particle aura updates.
- **Survives navigation** — audio element lives above the hash router;
  switching to the About page mid-track keeps playback and timeline
  position intact.

## Stack

| Layer            | Choice                                                                |
| ---------------- | --------------------------------------------------------------------- |
| Build            | Vite 5 (es2020 target)                                                |
| UI runtime       | React 18 + TypeScript (strict)                                        |
| 3D / WebGL       | three 0.169 + @react-three/fiber                                      |
| Postprocessing   | @react-three/postprocessing (Bloom, Vignette via `postprocessing`)    |
| Shaders          | Custom GLSL via Vite `?raw` imports                                   |
| Audio            | Web Audio API — `AnalyserNode`, `MediaElementSource`, `MediaStreamSource` |
| Recording        | `MediaRecorder` + `canvas.captureStream()`                            |
| ID3 parsing      | jsmediatags                                                           |
| Styling          | Tailwind CSS                                                          |
| Icons            | lucide-react                                                          |

## Audio pipeline

```
┌─────────────────┐    ┌───────────────┐    ┌────────────────┐
│ <audio> / mic / │ →  │  AnalyserNode │ →  │ 1024-bin FFT   │
│ generated track │    │  smoothing.82 │    │ (Uint8 freq)   │
└─────────────────┘    └───────────────┘    └────────┬───────┘
                                                     │
                              ┌──────────────────────┴──────────────┐
                              │ Band averages: bass / mid / high    │
                              │ Level + adaptive beat detector      │
                              │ (energy / mean ratio > 1.32, 280ms  │
                              │  refractory)                        │
                              └──────────────────────┬──────────────┘
                                                     ▼
                              ┌─────────────────────────────────────┐
                              │ Uniforms → GLSL wave-distortion     │
                              │ Points aura + camera pulse on beat  │
                              │ Bloom intensity scaled by level     │
                              └─────────────────────────────────────┘
```

See [`src/hooks/useAudioAnalyser.ts`](./src/hooks/useAudioAnalyser.ts) for
the analyser and beat detector, and
[`src/shaders/visualizer.vert.glsl`](./src/shaders/visualizer.vert.glsl) /
[`visualizer.frag.glsl`](./src/shaders/visualizer.frag.glsl) for the
displacement + color shader.

## Project layout

```
src/
├── App.tsx                       hash-routed shell (HomePage / AboutPage)
├── components/
│   ├── MusicVisualizerApp.tsx    transport, settings, file/URL/mic loaders
│   ├── MusicVisualizerScene.tsx  R3F scene, lazy-loaded
│   ├── CanvasFallback.tsx        SSR / lazy fallback
│   ├── Header.tsx · Footer.tsx · ThemeToggle.tsx · Slider.tsx · Button.tsx
├── contexts/
│   ├── AudioProvider.tsx         lifts audio state above the router
│   └── AudioContext.ts
├── hooks/
│   ├── useAudioAnalyser.ts       FFT + beat detection + ID3 parsing
│   ├── useRecorder.ts            MediaRecorder wrapper
│   ├── useHashRoute.ts
│   ├── useTheme.ts
│   ├── useKeyboardShortcuts.ts
│   └── useReducedMotion.ts
├── shaders/
│   ├── visualizer.vert.glsl      band-driven vertex displacement
│   └── visualizer.frag.glsl      gradient mix by frequency band
├── lib/
│   ├── sampleTrack.ts            OfflineAudioContext demo synthesis
│   └── audioFormat.ts · cn.ts
└── pages/
    ├── HomePage.tsx
    └── AboutPage.tsx
```

## Local development

```bash
npm install
npm run dev          # vite dev server
npm run build        # tsc -b && vite build → dist/
npm run preview      # serve dist/ locally
npm run typecheck    # tsc -b --noEmit
npm run lint
```

## Deployment

Publishes to the `gh-pages` branch under
`/three-js-and-animations/music-visualizer/`:

```bash
npm run deploy
```

The script runs `predeploy` (build) then
`gh-pages -d dist -e music-visualizer`, so it lands in its own subfolder
and doesn't clobber the sibling apps.

## Keyboard shortcuts

| Key         | Action          |
| ----------- | --------------- |
| `Space`     | Play / pause    |
| `← / →`     | Seek −5s / +5s  |
| `↑ / ↓`     | Volume up / down|
| `M`         | Mute            |
| `L`         | Toggle loop     |
| `F`         | Fullscreen      |
| `R`         | Restart track   |

## License

Private / portfolio project — see the root [README](../README.md).
