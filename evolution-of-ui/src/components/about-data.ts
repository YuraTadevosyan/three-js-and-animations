/**
 * What this page is built with, for the About dialog. Versions come from
 * package.json at build time, so they can't drift from what's installed.
 */

import pkg from '../../package.json'

const dev = pkg.devDependencies as Record<string, string>
/** "^1.20.1" → "1.20" */
const ver = (name: string): string => dev[name]?.replace(/^[^\d]*/, '').split('.').slice(0, 2).join('.') ?? ''

export interface Tech {
  name: string
  version?: string
  /** What it does on this page specifically, not what it is in general. */
  role: string
  href: string
}

export interface TechGroup {
  title: string
  items: Tech[]
}

export const TECH: TechGroup[] = [
  {
    title: 'Framework & build',
    items: [
      {
        name: 'Qwik',
        version: ver('@builder.io/qwik'),
        role: 'Resumable components. The whole page arrives as HTML; a handler’s code downloads the first time you use it.',
        href: 'https://qwik.dev/',
      },
      {
        name: 'Qwik City',
        version: ver('@builder.io/qwik-city'),
        role: 'Static site generation: the one route is rendered at build time, all six eras included.',
        href: 'https://qwik.dev/docs/guides/static-site-generation/',
      },
      {
        name: 'Vite',
        version: ver('vite'),
        role: 'Dev server and build. A small plugin also emits lake.svg, generated from the same code that draws it in the browser.',
        href: 'https://vite.dev/',
      },
      {
        name: 'TypeScript',
        version: ver('typescript'),
        role: 'Strict, everywhere: components, the terminal, the audio engine, the tests.',
        href: 'https://www.typescriptlang.org/',
      },
      {
        name: 'Tailwind CSS',
        version: ver('tailwindcss'),
        role: 'Tokens for the museum chrome only. Each era has its own hand-written stylesheet.',
        href: 'https://v3.tailwindcss.com/',
      },
    ],
  },
  {
    title: 'Graphics',
    items: [
      {
        name: 'WebGPU',
        role: 'One device, two canvases: the 1980 CRT and the 2040 hologram.',
        href: 'https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API',
      },
      {
        name: 'WGSL',
        role: 'Three hand-written shaders: the CRT, the hologram’s instanced sprites, and a compute shader for its spring physics.',
        href: 'https://www.w3.org/TR/WGSL/',
      },
      {
        name: 'Canvas 2D',
        role: 'The 80×25 text mode under the CRT, Paint, 16-colour dithering, and the hologram when WebGPU isn’t there.',
        href: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API',
      },
      {
        name: 'SVG',
        role: 'Every Windows 95 icon, Minesweeper’s counters, and the lake photo itself, generated from a seed.',
        href: 'https://developer.mozilla.org/en-US/docs/Web/SVG',
      },
    ],
  },
  {
    title: 'Motion & style',
    items: [
      {
        name: 'CSS scroll-driven animations',
        role: 'A view timeline drives one number, --t, from 0 to 7. Every transition on the page is a calc() of it.',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations',
      },
      {
        name: '@property',
        role: 'Typed custom properties. --t is a <number> so it can animate; the year counter is an <integer> fed to a CSS counter.',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@property',
      },
      {
        name: 'color-mix(), clamp(), sin()',
        role: 'The Web 2.0 gloss draining into Material indigo, the CRT tearing, every eased fade.',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix',
      },
      {
        name: 'clip-path, backdrop-filter',
        role: 'The web seen through Internet Explorer, Material’s ink flood, and 2025’s frosted glass.',
        href: 'https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter',
      },
    ],
  },
  {
    title: 'Sound & voice',
    items: [
      {
        name: 'Web Audio API',
        role: 'Everything you hear is synthesised: one song in six arrangements, every click, beep and chime.',
        href: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API',
      },
      {
        name: 'Web Speech API',
        role: 'Talk to NEXUS in 2040, and hear it answer.',
        href: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API',
      },
    ],
  },
  {
    title: 'Platform',
    items: [
      {
        name: 'Pointer Events',
        role: 'Dragging windows, painting, orbiting the hologram, pushing its points, the light on the glass.',
        href: 'https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events',
      },
      {
        name: '<dialog>',
        role: 'This panel: focus, Esc and the backdrop come with the element.',
        href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog',
      },
      {
        name: 'localStorage',
        role: 'Your note, your painting, your read messages and switches, between visits.',
        href: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
      },
    ],
  },
  {
    title: 'Checked without a browser',
    items: [
      {
        name: 'esbuild + Node',
        version: ver('esbuild'),
        role: 'npm test: the terminal, Minesweeper, the audio engine on a strict fake AudioContext, the hologram’s framing.',
        href: 'https://esbuild.github.io/',
      },
      {
        name: 'Dawn',
        role: 'Chrome’s WebGPU implementation, run from Node to compile and execute every shader.',
        href: 'https://dawn.googlesource.com/dawn',
      },
      {
        name: 'ESLint + eslint-plugin-qwik',
        version: ver('eslint'),
        role: 'Catches values a Qwik handler can’t serialise, before the browser would.',
        href: 'https://qwik.dev/docs/advanced/eslint/',
      },
    ],
  },
]

/** What each decade is actually made of. */
export const ERA_TECH: { year: number; name: string; tech: string }[] = [
  { year: 1980, name: 'DOS', tech: 'Text mode on Canvas 2D → WGSL CRT shader on WebGPU (or a DOM <pre>), a square-wave PC speaker' },
  { year: 1995, name: 'Windows 95', tech: 'Qwik components, a Pointer Events window manager, Paint on Canvas 2D with Bayer dithering, SVG icons, FM synthesis' },
  { year: 2005, name: 'Web 2.0', tech: 'Gradients, box-reflect and clip-path to the IE viewport; color-mix() drains the gloss' },
  { year: 2015, name: 'Material', tech: 'A growing clip-path circle(), shadows as elevation, ripples from Pointer Events' },
  { year: 2025, name: 'Glass', tech: 'backdrop-filter over the real page behind it, pointer-tracked radial light, 3D transforms' },
  { year: 2040, name: 'Sci-fi UI', tech: 'WebGPU compute + instanced rendering, Web Speech, a Canvas 2D fallback' },
]

/** Deliberately absent. */
export const WITHOUT = ['UI kits', 'animation libraries', '3D engines', 'math libraries', 'image files', 'audio files']
