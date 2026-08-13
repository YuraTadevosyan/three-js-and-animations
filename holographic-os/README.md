# holographic-os

A futuristic desktop environment that runs entirely in a browser tab.

Glass windows you can drag, resize and snap to the screen edges. Folders that
hinge open in 3D. A dock that magnifies under the pointer. Live GPU, thermal and
network graphs. A weather system with four climates and its own sky. And NOVA,
an assistant that *operates* the desktop rather than describing it — all
projected over a volumetric WebGL lattice.

**Live:** <https://yuratadevosyan.github.io/three-js-and-animations/holographic-os/>

## Stack

| | |
| --- | --- |
| UI | [Preact](https://preactjs.com/) 10 + [`@preact/signals`](https://preactjs.com/guide/v10/signals/) |
| WebGL | [OGL](https://github.com/oframe/ogl) — the fullscreen projection and the wireframe projector |
| Gestures | [interact.js](https://interactjs.io/) — window drag and resize |
| Styling | Tailwind v3, HSL custom-property theming |
| Build | Vite 8, TypeScript 6 |

Preact, signals, OGL and interact.js are all new to this repo — it is the first
app here that isn't built on React, Vue, Svelte or Solid, and the first to use a
WebGL library other than three.js or Babylon.

## What's real, and what's simulated

Worth being explicit, because a desktop full of live graphs invites the
assumption that something is being measured.

**Real:**

- The window manager — drag, resize, focus, z-order, minimise/maximise and
  Aero-style edge snapping, with a ghost preview of where a window will land.
- The WebGL projection (GLSL ES 3.00) and the wireframe projector you can spin.
- The frame-rate counter in the System Monitor — reported by the actual render
  loop, so it reacts to real load on your machine.
- The document vault, shared byte-for-byte between the File Vault window and the
  terminal's `ls` / `cd` / `cat`.

**Simulated, offline and deterministically seeded:**

- CPU, GPU, memory, thermal, power and network telemetry — seeded value noise
  with a burst model, so opening a window really does spike the GPU graph.
- The atmospheric model — a weighted Markov chain over conditions, with
  temperature, pressure and wind drifting on noise. Four stations, each with its
  own climate personality.
- NOVA — a keyword intent matcher with about a dozen intents. No model, no
  network. The upside of that trade: it can actually open windows, read the
  telemetry and retune the projection.

**No network requests, no image files and no audio files ship with the build.**

## The surfaces

| App | What it does |
| --- | --- |
| **NOVA** | Local intent matcher. Ask it to open a surface, read telemetry, check the sky, or retune the projection. |
| **System Monitor** | Gauges, scrolling traces, per-core bars, a process table and a sensors page. |
| **File Vault** | Grid and list views over the document tree, with search, breadcrumbs and 3D folders. |
| **Atmospherics** | Current conditions over a live canvas sky, a 24-hour curve and a 7-day outlook. |
| **Shell** | ~18 commands over the same filesystem, plus `neofetch`, `scene`, `hue` and `ask`. |
| **Holo Projector** | Four procedurally generated wireframe solids, spun with the pointer. |
| **Settings** | Every control writes straight into a live shader uniform, plus auto-lock. |
| **About** | What you're looking at. |

## Controls

| | |
| --- | --- |
| Drag a desktop icon | Rearrange the desktop (Settings → Reset icons to undo) |
| Right-click | Context menu — on a titlebar, dock tile, icon or empty desktop |
| Drag a titlebar | Move a window |
| …to a screen edge | Snap left / right |
| …to a corner | Snap to a quadrant |
| …to the top edge | Maximise |
| Double-click a titlebar | Maximise / restore |
| Drag any border | Resize |
| `Alt` + `Tab` | Cycle windows on this desk |
| `Alt` + `1` / `2` / `3` | Switch virtual desktop |
| `Alt` + `M` / `W` / `D` | Minimise / close focused, minimise all |
| `Alt` + `L` | Lock the screen |
| `Ctrl`/`Cmd` + `K` | Launcher |
| `Esc` | Dismiss the launcher |

## Desktop features

**Three virtual desktops.** Windows carry a workspace and stay *mounted* when
their desk is hidden — switching away and back preserves terminal scrollback and
a half-typed message to NOVA. The switcher in the top bar shows how many surfaces
each desk is holding, so a busy desk is visible without going there. The dock
dims rather than clears for an app parked one desk over, and clicking it pulls
the window across instead of pretending the app is closed.

**Context menus everywhere** — titlebar, dock tile, desktop icon, empty desktop.
They are described as data and rendered by one component at the root, so a menu
escapes the `overflow: hidden` of whatever surface opened it and always stacks
above the window layer.

**Keep on top.** Pinned windows float in a z-band above unpinned ones, far enough
that focus order can never let an ordinary window cross it, and still below the
shell chrome.

**Lock screen.** Idle auto-lock (off / 1 / 3 / 10 min, default 3) or `Alt`+`L`.
The plate is translucent rather than opaque — the projection keeps running
behind it, which is the point of a holographic desktop going to sleep. Nothing
is closed; every surface is exactly where you left it.

## Notes on the build

**Windows are driven directly during a gesture.** interact.js fires at pointer
rate; routing that through signals would re-render every window on every mouse
move. Each window keeps its live rect in a ref, writes `transform` straight to
the element, and commits to the store once on release. The store is the source
of truth everywhere else — snapping, maximising and viewport reflow all go
through it, and an effect syncs the DOM back whenever geometry changes from
outside a gesture.

**Graphs never touch the VDOM.** The telemetry sampler runs at 10 Hz into
fixed-length `Float32Array` ring buffers. Charts read those buffers on their own
rAF loop through a shared `useCanvas` hook, which also handles DPR and
`ResizeObserver`. The numeric readouts subscribe to a signal; the traces do not.

**Canvas can't parse `var()`.** Every chart colour is resolved from the
canvas element's own computed style into a literal `hsl()` once per mount, and
re-resolved only when the global hue moves. Because it reads from the element
rather than the root, a chart inside a hue-shifted window inherits that window's
tint — each app overrides `--primary` on its own root, so one custom property
re-tints an entire window.

**Entrance animations never touch `transform`.** CSS animations outrank inline
styles in the cascade, and these run with `fill-mode: both` — so a keyframe
animating `transform` permanently overrides the inline `translate3d` that
positions a window, pinning every surface to the top-left. Windows are therefore
a positioning shell wrapping an animated chrome layer, and the launcher is
centred by a flex wrapper rather than `-translate-x-1/2`. There is a warning
comment above the keyframes in `tailwind.config.js`.

**Minimised windows stay mounted** (`visibility: hidden`, so they leave the tab
order) — terminal scrollback and a half-typed message to NOVA survive being
parked.

**The shader is one fullscreen triangle** with three scenes behind a uniform.
The floor grid is analytically antialiased with `fwidth`, so cells fade to a
flat wash near the horizon instead of tearing into moiré. Chromatic aberration
costs two extra taps, so only the lattice scene — where you can actually see the
fringe — pays for it. Device pixel ratio is capped at 1.75; a 4K panel would
otherwise triple the fragment cost for no visible gain.

**interact.js's published types** only resolve with `skipLibCheck` on (its
`index.d.ts` re-exports a package npm never installs). Every app in this repo
already sets it, so no shim is needed — but that's why it's load-bearing here.

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm run build
npm run deploy     # publishes dist/ to gh-pages under /holographic-os
```

Requires WebGL2.
