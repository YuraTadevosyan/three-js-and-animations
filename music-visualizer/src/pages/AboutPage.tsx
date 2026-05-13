import {
  Atom,
  AudioLines,
  Code2,
  Disc3,
  Hexagon,
  Image as ImageIcon,
  Keyboard,
  Layers,
  Music,
  Palette,
  Route,
  Sparkles,
  Type,
  Wand2,
  Waypoints,
  Zap,
  type LucideIcon,
} from 'lucide-react';

interface Tech {
  name: string;
  description: string;
  icon: LucideIcon;
  href?: string;
}

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

const features: Feature[] = [
  {
    title: 'Four ways to feed it audio',
    icon: AudioLines,
    description:
      'Drag-and-drop a file, paste a public URL, use your microphone (live FFT, no playback), or have the page synthesize a short demo track in-browser with OfflineAudioContext.',
  },
  {
    title: 'Six geometries × six palettes',
    icon: Hexagon,
    description:
      'Icosahedron, tetrahedron, torus, cone, capsule, and torus knot — each with its own color identity that adapts to light or dark mode, plus tuned per-shape displacement so thin shapes don’t buckle on heavy bass.',
  },
  {
    title: 'Record straight to .webm',
    icon: Disc3,
    description:
      'The WebGL canvas stream is muxed with the analyser audio via MediaRecorder and downloaded as a single .webm. One button, no server, full quality.',
  },
  {
    title: 'Keyboard, drag-drop, fullscreen',
    icon: Keyboard,
    description:
      'Space, ←/→, ↑/↓, M, L, F, R cover transport. Drop an audio file anywhere on the player to load it. Fullscreen hands the canvas the whole viewport.',
  },
  {
    title: 'Cover art + ID3 tags',
    icon: ImageIcon,
    description:
      'For MP3s with ID3v2 tags, title, artist, and embedded cover art surface in the now-playing pill — parsed locally with jsmediatags, no upload.',
  },
  {
    title: 'Custom palette override',
    icon: Palette,
    description:
      'Three color swatches in Settings replace the shader’s low/mid/high uniforms with whatever you pick. Stored per-browser in localStorage, applies across all shapes.',
  },
  {
    title: 'Survives navigation',
    icon: Route,
    description:
      'The audio element lives above the hash router. Switch to this page mid-track and back — playback continues, your timeline position is preserved.',
  },
  {
    title: 'Beat-synced everything',
    icon: Waypoints,
    description:
      'A refractory beat detector on the bass band pulses the shader displacement, kicks the camera zoom, and brightens the particle aura. No external beat-tracking library.',
  },
];

const technologies: Tech[] = [
  {
    name: 'React 18',
    description:
      'Component model with concurrent rendering and Suspense for lazy-loading the WebGL scene.',
    icon: Code2,
    href: 'https://react.dev',
  },
  {
    name: 'TypeScript',
    description:
      'Strict types across hooks, components, and shader uniforms for end-to-end safety.',
    icon: Type,
    href: 'https://www.typescriptlang.org',
  },
  {
    name: 'Vite 5',
    description:
      'Dev server, bundler, and `?raw` GLSL imports. Deployed under a GitHub Pages subpath via `base`.',
    icon: Zap,
    href: 'https://vitejs.dev',
  },
  {
    name: 'Three.js',
    description:
      'WebGL scene graph: six switchable geometries, a point-cloud aura, custom shader material, and fog.',
    icon: Atom,
    href: 'https://threejs.org',
  },
  {
    name: 'React Three Fiber',
    description:
      'Declarative R3F renderer that mounts Three.js objects as React components inside a Canvas.',
    icon: Layers,
    href: 'https://r3f.docs.pmnd.rs',
  },
  {
    name: '@react-three/postprocessing',
    description:
      'Composer pipeline for mip-mapped bloom and vignette, with per-theme intensity so light mode doesn’t blow out.',
    icon: Sparkles,
    href: 'https://github.com/pmndrs/react-postprocessing',
  },
  {
    name: 'GLSL shaders',
    description:
      'Vertex shader with simplex-noise displacement and a per-model uDisplacementScale; fragment shader with fresnel rim, scanlines, and a tri-stop palette.',
    icon: Wand2,
  },
  {
    name: 'Web Audio API',
    description:
      'A single AnalyserNode (1024-bin FFT) fed by either a MediaElementSource (files / URLs) or a MediaStreamSource (mic). Powers band averages, the beat detector, and a recording tap.',
    icon: AudioLines,
    href: 'https://developer.mozilla.org/docs/Web/API/Web_Audio_API',
  },
  {
    name: 'MediaRecorder + captureStream',
    description:
      'canvas.captureStream(60) is combined with the analyser’s MediaStreamAudioDestinationNode and recorded to .webm (VP9/Opus, with VP8/MP4 fallback).',
    icon: Disc3,
    href: 'https://developer.mozilla.org/docs/Web/API/MediaRecorder',
  },
  {
    name: 'OfflineAudioContext',
    description:
      'Synthesizes the in-browser demo track — kick + offbeat hi-hat + saw arpeggio + triangle pad, soft-limited and encoded to WAV by a hand-rolled 30-line encoder.',
    icon: Music,
    href: 'https://developer.mozilla.org/docs/Web/API/OfflineAudioContext',
  },
  {
    name: 'jsmediatags',
    description:
      'Reads ID3v1/v2 tags out of dropped MP3 files to surface title, artist, and embedded cover art — no network round-trip.',
    icon: ImageIcon,
    href: 'https://github.com/aadsm/jsmediatags',
  },
  {
    name: 'Tailwind CSS',
    description:
      'Utility-first styling with class-based dark mode, a custom fade-in keyframe, and inline `dark:` variants across every component.',
    icon: Palette,
    href: 'https://tailwindcss.com',
  },
];

export function AboutPage() {
  return (
    <main className="container mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 pb-12">
      <section className="space-y-3 animate-fade-in">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-zinc-900 md:text-5xl dark:text-white">
          About
        </h1>
        <p className="max-w-2xl text-pretty text-sm text-zinc-600 md:text-base dark:text-white/60">
          A self-contained, audio-reactive music visualizer built on the web
          audio + WebGL stacks. Every byte of audio is decoded, analysed, and
          rendered locally — there is no backend, nothing leaves your browser.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl dark:text-white">
          What it does
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <li
              key={f.title}
              className="rounded-lg border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-md border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                  <f.icon className="size-4 text-violet-500 dark:text-violet-300" />
                </span>
                <h3 className="font-semibold text-zinc-900 dark:text-white">
                  {f.title}
                </h3>
              </div>
              <p className="text-sm text-zinc-600 dark:text-white/60">
                {f.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl dark:text-white">
          Built with
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {technologies.map((t) => {
            const Wrapper = t.href ? 'a' : 'div';
            const wrapperProps = t.href
              ? {
                  href: t.href,
                  target: '_blank',
                  rel: 'noreferrer noopener',
                }
              : {};
            return (
              <li key={t.name}>
                <Wrapper
                  {...wrapperProps}
                  className="group block h-full rounded-lg border border-black/10 bg-white/70 p-4 shadow-sm backdrop-blur-sm transition-colors hover:border-violet-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:shadow-none dark:hover:border-violet-400/40 dark:hover:bg-white/10"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-md border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
                      <t.icon className="size-4 text-violet-500 dark:text-violet-300" />
                    </span>
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      {t.name}
                    </h3>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-white/60">
                    {t.description}
                  </p>
                </Wrapper>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
