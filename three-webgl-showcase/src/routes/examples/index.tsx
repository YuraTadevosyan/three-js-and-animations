import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowRight,
  Atom,
  Boxes,
  Box,
  Cloud,
  Layers,
  Move3d,
  MousePointer2,
  MoveDown,
  Orbit,
  Sparkle,
  Sparkles,
  Type,
  Wand2,
  Zap,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

import { SEO } from '@/components/seo/SEO';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/examples/')({
  component: ExamplesIndex,
});

interface Demo {
  to:
    | '/examples/particles'
    | '/examples/shader'
    | '/examples/model'
    | '/examples/instances'
    | '/examples/postfx'
    | '/examples/scroll'
    | '/examples/physics'
    | '/examples/reflections'
    | '/examples/text'
    | '/examples/sky'
    | '/examples/parallax'
    | '/examples/holo'
    | '/examples/drag'
    | '/examples/trail';
  title: string;
  description: string;
  icon: LucideIcon;
  tag: string;
}

const demos: Demo[] = [
  {
    to: '/examples/particles',
    title: 'GPU Particles',
    description:
      '6,000 particles in a galactic spiral, additive blending, single draw call.',
    icon: Sparkles,
    tag: 'BufferGeometry',
  },
  {
    to: '/examples/shader',
    title: 'Custom GLSL Shader',
    description:
      'Vertex + fragment shaders driving a procedural wave plane with animated color ramp.',
    icon: Wand2,
    tag: 'GLSL',
  },
  {
    to: '/examples/model',
    title: 'Material Showcase',
    description:
      'High-poly icosahedron with a distortion material, environment lighting, and orbit controls.',
    icon: Box,
    tag: 'PBR',
  },
  {
    to: '/examples/instances',
    title: 'Instanced Mesh + Raycasting',
    description:
      '1,600 cubes as a single InstancedMesh with per-instance hover and color animation.',
    icon: Boxes,
    tag: 'Instancing',
  },
  {
    to: '/examples/postfx',
    title: 'Post-processing',
    description:
      'Mip-mapped bloom, chromatic aberration, and vignette stacked in an EffectComposer pipeline.',
    icon: Zap,
    tag: 'EffectComposer',
  },
  {
    to: '/examples/scroll',
    title: 'Scroll-driven 3D',
    description:
      'Drei ScrollControls binds 3 pages of scroll to a camera fly-through across four key positions.',
    icon: MoveDown,
    tag: 'Storytelling',
  },
  {
    to: '/examples/physics',
    title: 'Physics with Rapier',
    description:
      'WASM rigid-body physics: cubes and spheres spawn into a walled arena and bounce in real time.',
    icon: Atom,
    tag: 'Rapier (WASM)',
  },
  {
    to: '/examples/reflections',
    title: 'Reflective Floor',
    description:
      'Render-to-texture floor reflection with depth-aware blur — the showroom look without a custom shader.',
    icon: Layers,
    tag: 'Render target',
  },
  {
    to: '/examples/text',
    title: '3D Text',
    description:
      'SDF-rendered text in 3D space with cursor tracking, floating motion, and crisp outlines at any zoom.',
    icon: Type,
    tag: 'SDF text',
  },
  {
    to: '/examples/sky',
    title: 'Atmospheric Sky',
    description:
      'Three.js Sky shader with an animated sun position and volumetric clouds — Rayleigh + Mie scattering.',
    icon: Cloud,
    tag: 'Atmospheric',
  },
  {
    to: '/examples/parallax',
    title: 'Cursor Parallax',
    description:
      '18 layered cards drift in 3D with depth-scaled, damped cursor parallax — magazine-style motion.',
    icon: MousePointer2,
    tag: 'Interaction',
  },
  {
    to: '/examples/holo',
    title: 'Holographic Shader',
    description:
      'Custom GLSL fresnel + scanline shader on an icosahedron, with a wireframe core for depth.',
    icon: Sparkle,
    tag: 'Fresnel',
  },
  {
    to: '/examples/drag',
    title: 'Draggable Objects',
    description:
      'On-axis transform gizmos via Drei PivotControls — translate cubes, spheres, and cones in 3D.',
    icon: Move3d,
    tag: 'Gizmos',
  },
  {
    to: '/examples/trail',
    title: 'Cursor Trail',
    description:
      '600-point ring buffer follows the cursor; per-vertex colors lerp from head to tail by age.',
    icon: Orbit,
    tag: 'Ring buffer',
  },
];

function ExamplesIndex() {
  return (
    <>
      <SEO
        title="Examples"
        description="A collection of Three.js and WebGL examples — particles, custom GLSL shaders, instancing, post-processing, scroll-driven scenes, and physics."
        path="/examples"
      />
      <section className="container space-y-8 py-10 md:py-16">
        <header className="space-y-3 animate-fade-in">
          <h1 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">
            Examples
          </h1>
          <p className="max-w-2xl text-muted-foreground md:text-lg">
            Each example is a standalone, code-split route. Scenes are
            lazy-mounted with{' '}
            <code className="rounded bg-muted px-1">IntersectionObserver</code>
            , so visiting this index doesn&apos;t load any 3D code.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {demos.map((d) => (
            <Card key={d.to} className="group transition-colors hover:bg-accent/30">
              <CardHeader>
                <div className="mb-2 flex items-center justify-between">
                  <d.icon className="size-5 text-violet-400" aria-hidden />
                  <span className="rounded-full border border-border/60 bg-secondary/40 px-2 py-0.5 text-xs text-muted-foreground">
                    {d.tag}
                  </span>
                </div>
                <CardTitle>{d.title}</CardTitle>
                <CardDescription>{d.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" size="sm">
                  <Link to={d.to}>
                    Open example <ArrowRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
