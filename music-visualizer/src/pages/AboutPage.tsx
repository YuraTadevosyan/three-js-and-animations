import {
  Atom,
  AudioLines,
  Code2,
  Layers,
  Palette,
  Sparkles,
  Type,
  Wand2,
  Zap,
  type LucideIcon,
} from 'lucide-react';

interface Tech {
  name: string;
  description: string;
  icon: LucideIcon;
  href?: string;
}

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
      'Fast dev server and build tooling. GLSL files load via the ?raw import suffix.',
    icon: Zap,
    href: 'https://vitejs.dev',
  },
  {
    name: 'Three.js',
    description:
      'WebGL scene graph: icosahedron geometry, point clouds, and a custom shader material.',
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
      'Composer pipeline for mip-mapped bloom and a vignette pass on top of the visualizer.',
    icon: Sparkles,
    href: 'https://github.com/pmndrs/react-postprocessing',
  },
  {
    name: 'GLSL shaders',
    description:
      'Vertex shader with simplex-noise displacement; fragment shader with fresnel rim, scanlines, and a tri-stop palette.',
    icon: Wand2,
  },
  {
    name: 'Web Audio API',
    description:
      '1024-bin FFT AnalyserNode in front of a MediaElementSource. Bass/mid/high bands and a refractory beat detector feed the shader uniforms each frame.',
    icon: AudioLines,
    href: 'https://developer.mozilla.org/docs/Web/API/Web_Audio_API',
  },
  {
    name: 'Tailwind CSS',
    description:
      'Utility-first styling with class-based dark mode and a custom fade-in animation.',
    icon: Palette,
    href: 'https://tailwindcss.com',
  },
];

export function AboutPage() {
  return (
    <main className="container mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-12">
      <section className="space-y-3 animate-fade-in">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-zinc-900 md:text-5xl dark:text-white">
          Built with
        </h1>
        <p className="max-w-2xl text-pretty text-sm text-zinc-600 md:text-base dark:text-white/60">
          A small stack of well-known web tools. Audio decoding, FFT, and
          rendering all happen in the browser — no backend, no uploads.
        </p>
      </section>

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
                  <h2 className="font-semibold text-zinc-900 dark:text-white">
                    {t.name}
                  </h2>
                </div>
                <p className="text-sm text-zinc-600 dark:text-white/60">
                  {t.description}
                </p>
              </Wrapper>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
