import { createFileRoute } from '@tanstack/react-router';
import {
  Boxes,
  Code2,
  FileCode,
  Gauge,
  Layers,
  Palette,
  Route as RouteIcon,
  Search,
  Shield,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import { SEO } from '@/components/seo/SEO';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

interface Tech {
  icon: LucideIcon;
  name: string;
  role: string;
  description: string;
}

const stack: Tech[] = [
  {
    icon: Code2,
    name: 'React 18 + TypeScript',
    role: 'UI runtime',
    description:
      'Strict TypeScript, StrictMode-safe components, suspense for code-split scenes.',
  },
  {
    icon: Layers,
    name: 'Vite 5',
    role: 'Build tool',
    description:
      'ES2020 target, manual chunks for three / r3f / tanstack, and Brotli + gzip pre-compression.',
  },
  {
    icon: RouteIcon,
    name: 'TanStack Router',
    role: 'Routing',
    description:
      'File-based, fully type-safe routes with intent-based prefetching and per-route code splitting.',
  },
  {
    icon: Boxes,
    name: 'TanStack Query',
    role: 'Data layer',
    description:
      'Cache-aware data fetching wired into the router context, devtools loaded only in dev.',
  },
  {
    icon: Sparkles,
    name: 'Three.js + react-three-fiber + drei',
    role: '3D / WebGL',
    description:
      'Declarative scene graph, helpers for lighting, controls, scroll, and post-processing.',
  },
  {
    icon: FileCode,
    name: 'Custom GLSL',
    role: 'Shaders',
    description:
      'Vertex + fragment shaders authored as .glsl files and imported via Vite ?raw.',
  },
  {
    icon: Gauge,
    name: '@react-three/postprocessing',
    role: 'Effects',
    description:
      'EffectComposer pipeline: mip-blur Bloom, ChromaticAberration, Vignette.',
  },
  {
    icon: Shield,
    name: '@react-three/rapier',
    role: 'Physics',
    description:
      'WASM rigid-body physics. Loaded only on the physics route to keep other bundles small.',
  },
  {
    icon: Palette,
    name: 'Tailwind CSS + shadcn/ui',
    role: 'Styling',
    description:
      'Utility-first styling with CSS variables for theming, plus shadcn primitives (Button, Card).',
  },
  {
    icon: Search,
    name: 'react-helmet-async',
    role: 'SEO',
    description:
      'Per-route title, description, canonical, Open Graph, and Twitter cards. JSON-LD in index.html.',
  },
];

const performanceWins = [
  'Per-route code splitting + intent-based prefetch on link hover.',
  'IntersectionObserver-gated canvases — scenes mount only when visible.',
  'DPR clamps (max 1.75) and powerPreference: high-performance on every Canvas.',
  'prefers-reduced-motion honored at CSS and useFrame level.',
  'Brotli + gzip output, manual chunks for three / r3f / tanstack.',
  'Devtools dynamic-imported only in development.',
];

const seoWins = [
  'Per-route <SEO /> with title, description, canonical, OG, Twitter.',
  'JSON-LD WebSite schema in index.html for rich-result eligibility.',
  'robots.txt, sitemap.xml, web manifest, theme-color.',
  'Crawlable <noscript> fallback content for the doc itself.',
  'Skip-to-content link, semantic landmarks, aria-live loading states.',
];

function AboutPage() {
  return (
    <>
      <SEO
        title="About — Stack &amp; Architecture"
        description="The technologies behind this Three.js showcase: React, TanStack Router/Query, Vite, Tailwind, shadcn/ui, react-three-fiber, postprocessing, Rapier, and the SEO + performance choices that ship them."
        path="/about"
      />

      <section className="container space-y-10 py-10 md:py-16">
        <header className="space-y-3 animate-fade-in">
          <h1 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">
            About the stack
          </h1>
          <p className="max-w-2xl text-muted-foreground md:text-lg">
            A breakdown of the technologies powering each example, plus the
            performance and SEO choices that make a 3D-heavy SPA usable.
          </p>
        </header>

        <div>
          <h2 className="mb-4 text-2xl font-bold tracking-tight">
            Technologies
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stack.map((t) => (
              <Card key={t.name}>
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <t.icon className="size-5 text-violet-400" aria-hidden />
                    <span className="rounded-full border border-border/60 bg-secondary/40 px-2 py-0.5 text-xs text-muted-foreground">
                      {t.role}
                    </span>
                  </div>
                  <CardTitle className="text-base">{t.name}</CardTitle>
                  <CardDescription>{t.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="size-5 text-violet-400" /> Performance
              </CardTitle>
              <CardDescription>
                Choices that keep TTI low and the framerate high.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {performanceWins.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="size-5 text-violet-400" /> SEO
              </CardTitle>
              <CardDescription>
                Making a 3D SPA crawlable and shareable.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {seoWins.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
