/**
 * An in-memory document vault.
 *
 * Backs both the File Vault window and the terminal's `ls`/`cd`/`cat`, so the
 * two stay in sync by construction. Paths are POSIX-ish and always absolute.
 */

export type FileExt = 'md' | 'txt' | 'log' | 'json' | 'glsl'

export interface FileNode {
  kind: 'file'
  name: string
  path: string
  ext: FileExt
  size: number
  modified: string
  content: string
}

export interface FolderNode {
  kind: 'folder'
  name: string
  path: string
  /** Hue offset so each folder reads as its own colour in the vault. */
  hue: number
  children: FsNode[]
}

export type FsNode = FileNode | FolderNode

function file(name: string, ext: FileExt, modified: string, content: string): Omit<FileNode, 'path'> {
  return { kind: 'file', name, ext, modified, content, size: content.length }
}

const RAW: Array<{ name: string; hue: number; files: Array<Omit<FileNode, 'path'>> }> = [
  {
    name: 'System',
    hue: 0,
    files: [
      file(
        'kernel.md',
        'md',
        '2026-08-05',
        `# HOLO-KERNEL 4.2

The compositor draws every surface as a projection rather than a bitmap.
Windows are volumes with a depth index; the shader behind them reads that
index to decide how much of the lattice shows through.

## Subsystems

- novad          conversational agent, local intent matcher (16 intents)
- volumetric     the fullscreen projection pass (WebGL2 / GLSL ES 3.00)
- lattice        wireframe geometry projector
- atmos-sim      atmospheric model, 4 stations
- vault          document index (you are reading it)

## Notes

Everything on this machine is synthesised at runtime. There are no image
files, no audio files and no network calls anywhere in the bundle.`,
      ),
      file(
        'projection.glsl',
        'glsl',
        '2026-08-06',
        `// Excerpt — the volumetric floor pass.
// Full source lives in src/gl/background.ts

float grid(vec2 p, float density) {
    vec2 g = abs(fract(p * density) - 0.5);
    float line = min(g.x, g.y);
    float w = fwidth(line) * 1.4;
    return 1.0 - smoothstep(0.0, w, line);
}

// The floor is a single plane raymarched from the fragment ray. Distance
// fades the grid out before precision falls apart near the horizon.
vec3 floorPass(vec2 uv, float t) {
    float horizon = 0.06;
    if (uv.y > horizon) return vec3(0.0);
    float z = 1.0 / max(horizon - uv.y, 1e-4);
    vec2 p = vec2(uv.x * z, z + t * 0.55);
    float g = grid(p, 0.5);
    return vec3(g) * exp(-z * 0.045);
}`,
      ),
      file(
        'boot.log',
        'log',
        '2026-08-07',
        `[0.000] holo-kernel 4.2 — cold start
[0.014] webgl2 context acquired
[0.031] lattice projector online
[0.052] volumetric pass compiled (2 programs)
[0.088] atmos-sim: 4 stations registered
[0.104] vault: indexed 12 documents
[0.132] novad: intent table loaded (16 intents)
[0.140] telemetry-agent: sampling at 10 Hz
[0.161] compositor: surfaces ready
[0.180] shell: handing off to user`,
      ),
    ],
  },
  {
    name: 'Projects',
    hue: -22,
    files: [
      file(
        'holographic-os.md',
        'md',
        '2026-08-07',
        `# Holographic OS

A futuristic desktop environment that runs entirely in a browser tab.

## What's real vs. simulated

Real:
  - the window manager (drag, resize, snap, focus, z-order)
  - the WebGL projection and the wireframe projector
  - the frame-rate counter in the System Monitor
  - the file vault and terminal (same tree, one source of truth)

Simulated, deterministically and offline:
  - CPU / GPU / memory / thermal / network telemetry
  - the atmospheric model behind the weather app
  - NOVA, which pattern-matches intents rather than calling a model

## Stack

Preact + @preact/signals for state, OGL for WebGL, interact.js for the
drag and resize gestures, Tailwind for the glass chrome.`,
      ),
      file(
        'showcase-index.md',
        'md',
        '2026-08-02',
        `# Sibling showcases

This desktop is one app in a portfolio of independent builds, each one
deliberately on a stack the others don't use:

  three-webgl-showcase   React + three.js + TanStack Router
  music-visualizer       R3F + Web Audio FFT
  gsap-animations        GSAP + ScrollTrigger
  shader-lab             raw GLSL ES
  physics-playground     Matter.js
  immersive-story        GSAP + Lenis
  car-configurator       R3F + drei + GLB
  cyber-portfolio        Next.js static export
  svg-motion-lab         Vue 3 + anime.js + KUTE + Lottie
  infinite-universe      R3F + simplex noise
  ai-data-viz            Svelte 5 + D3
  interactive-museum     Babylon.js 9 + SolidJS
  holographic-os         Preact + signals + OGL   <- you are here`,
      ),
    ],
  },
  {
    name: 'Logs',
    hue: 26,
    files: [
      file(
        'session.log',
        'log',
        '2026-08-07',
        `[04:17:02] session opened
[04:17:02] projector: lattice 'torus' bound
[04:21:44] atmos-sim: helios -> partly cloudy
[04:26:10] vault: viewer opened kernel.md
[04:31:55] novad: intent 'system.status' matched
[04:38:20] compositor: 3 surfaces, 0 dropped frames
[04:44:07] atmos-sim: helios -> rain (intensity 0.55)
[04:51:33] telemetry: gpu burst 62% (render job)`,
      ),
      file(
        'telemetry.json',
        'json',
        '2026-08-07',
        `{
  "sampler": { "rate_hz": 10, "window_s": 18, "buffer": "Float32Array(180)" },
  "channels": [
    "cpu", "gpu", "ram", "vram",
    "netDown", "netUp", "gpuTemp", "power", "fps"
  ],
  "hardware": {
    "cpu": "8-core / holo-arch",
    "ram_gb": 64,
    "vram_gb": 24
  },
  "note": "Every channel except fps is synthesised from seeded value noise."
}`,
      ),
    ],
  },
  {
    name: 'Notes',
    hue: -44,
    files: [
      file(
        'shortcuts.txt',
        'txt',
        '2026-08-06',
        `Keyboard
--------
  Alt + Tab        cycle windows on this desk
  Alt + 1 / 2 / 3  switch virtual desktop
  Alt + M          minimise focused window
  Alt + W          close focused window
  Alt + D          minimise everything on this desk
  Alt + L          lock the screen
  Ctrl/Cmd + K     launcher
  Esc              dismiss the launcher

Pointer
-------
  drag a titlebar to a screen edge   snap left / right
  drag to a corner                   snap to quadrant
  drag to the top edge               maximise
  double-click a titlebar            maximise / restore
  drag any window border             resize
  drag a desktop icon                rearrange the desktop

Right-click
-----------
  a titlebar     minimise, pin on top, send to another desk, close
  a dock tile    new window, jump to an open one, close all
  empty desktop  open apps, change scene, tidy icons, lock
  an icon        open, tidy icons`,
      ),
      file(
        'nova.md',
        'md',
        '2026-08-05',
        `# Talking to NOVA

NOVA is a local intent matcher — no model, no network. It scores your
message against a keyword table and runs the best match, which means it
can actually operate the desktop rather than just describe it.

Things it responds to:

  "open the monitor"        launches an app
  "how's the gpu?"          reads live telemetry
  "what's the weather"      reads the atmospheric model
  "switch to vantage ridge" moves the weather station
  "go to desk 2"            switches virtual desktop
  "lock the screen"         sleeps the projection
  "close everything"        minimises all surfaces
  "who built this"          project info
  "help"                    the full intent list`,
      ),
    ],
  },
]

const ROOT_PATH = '/vault'

/** Folders and files get their absolute paths stitched in at build time. */
function buildTree(): FolderNode {
  const children: FsNode[] = RAW.map((group) => {
    const folderPath = `${ROOT_PATH}/${group.name}`
    return {
      kind: 'folder',
      name: group.name,
      path: folderPath,
      hue: group.hue,
      children: group.files.map((f) => ({ ...f, path: `${folderPath}/${f.name}` })),
    } satisfies FolderNode
  })

  return { kind: 'folder', name: 'vault', path: ROOT_PATH, hue: 0, children }
}

export const ROOT: FolderNode = buildTree()

export function getNode(path: string): FsNode | null {
  const clean = normalizePath(path)
  if (clean === ROOT_PATH) return ROOT
  if (!clean.startsWith(`${ROOT_PATH}/`)) return null

  const parts = clean.slice(ROOT_PATH.length + 1).split('/').filter(Boolean)
  let node: FsNode = ROOT
  for (const part of parts) {
    if (node.kind !== 'folder') return null
    const next: FsNode | undefined = node.children.find((c) => c.name === part)
    if (!next) return null
    node = next
  }
  return node
}

export function getFolder(path: string): FolderNode {
  const node = getNode(path)
  return node && node.kind === 'folder' ? node : ROOT
}

/** Resolves `.`, `..` and collapses duplicate separators. */
export function normalizePath(path: string): string {
  const absolute = path.startsWith('/') ? path : `${ROOT_PATH}/${path}`
  const out: string[] = []
  for (const part of absolute.split('/')) {
    if (!part || part === '.') continue
    if (part === '..') out.pop()
    else out.push(part)
  }
  return `/${out.join('/')}` || '/'
}

/** Resolves a possibly-relative path against a working directory. */
export function resolvePath(cwd: string, target: string): string {
  if (!target || target === '.') return cwd
  if (target.startsWith('/')) return normalizePath(target)
  return normalizePath(`${cwd}/${target}`)
}

export function breadcrumbs(path: string): Array<{ name: string; path: string }> {
  const clean = normalizePath(path)
  const parts = clean.split('/').filter(Boolean)
  return parts.map((name, i) => ({ name, path: `/${parts.slice(0, i + 1).join('/')}` }))
}

export function parentPath(path: string): string {
  const clean = normalizePath(path)
  if (clean === ROOT_PATH) return ROOT_PATH
  return clean.slice(0, clean.lastIndexOf('/')) || ROOT_PATH
}

export function allFiles(node: FsNode = ROOT, acc: FileNode[] = []): FileNode[] {
  if (node.kind === 'file') acc.push(node)
  else node.children.forEach((c) => allFiles(c, acc))
  return acc
}

export function searchFiles(query: string): FileNode[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return allFiles().filter(
    (f) => f.name.toLowerCase().includes(q) || f.content.toLowerCase().includes(q),
  )
}

export const FILE_COUNT = allFiles().length
