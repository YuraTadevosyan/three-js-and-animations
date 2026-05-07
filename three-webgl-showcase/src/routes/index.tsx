import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowRight, Info, Sparkles } from 'lucide-react';

import { SEO } from '@/components/seo/SEO';
import { Button } from '@/components/ui/button';
import { LazyScene } from '@/components/three/LazyScene';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <SEO
        title="Interactive Three.js + WebGL Showcase"
        description="A performance-tuned showcase of Three.js, WebGL shaders, instancing, post-processing, scroll-driven scenes, and physics — built with React, TanStack Router, and Tailwind CSS."
        path="/"
      />

      <section className="container grid gap-8 py-10 md:grid-cols-[1.1fr_1fr] md:py-16">
        <div className="flex flex-col justify-center gap-6 animate-fade-in">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-secondary/40 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" /> three-webgl-showcase
          </span>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Interactive 3D on the open web —{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              fast, accessible, indexable.
            </span>
          </h1>
          <p className="max-w-xl text-pretty text-muted-foreground md:text-lg">
            Seven hand-crafted Three.js + WebGL examples — particles, custom
            GLSL, instancing, post-processing, scroll-driven scenes, and rigid-
            body physics. Built with React 18, TanStack Router &amp; Query,
            Tailwind, and shadcn/ui. Tuned for Core Web Vitals and SEO with
            code-splitting, lazy canvases, and per-route metadata.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/examples">
                View examples <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">
                <Info /> About the stack
              </Link>
            </Button>
          </div>
        </div>

        <LazyScene
          loader={() => import('@/components/three/HeroScene')}
          eager
          height="h-[420px] md:h-[520px]"
          label="Loading hero scene…"
        />
      </section>
    </>
  );
}
