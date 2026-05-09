import { MusicVisualizerApp } from '@/components/MusicVisualizerApp';

export function HomePage() {
  return (
    <main className="container mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-10">
      <section className="space-y-3 animate-fade-in">
        <h1 className="text-balance text-3xl font-bold tracking-tight text-zinc-900 md:text-5xl dark:text-white">
          Audio-reactive{' '}
          <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-300">
            music visualizer
          </span>
        </h1>
        <p className="max-w-2xl text-pretty text-sm text-zinc-600 md:text-base dark:text-white/60">
          Drop in any local track. A 1024-bin FFT splits it into bass, mid, and
          high bands that drive a custom GLSL wave-distortion shader, a 2,400-
          point particle aura, and a camera that pulses on every detected beat.
        </p>
      </section>

      <MusicVisualizerApp />
    </main>
  );
}
