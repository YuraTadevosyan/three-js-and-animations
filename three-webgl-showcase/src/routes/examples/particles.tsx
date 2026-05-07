import { createFileRoute } from '@tanstack/react-router';
import { ExamplePage } from '@/components/ExamplePage';
import { LazyScene } from '@/components/three/LazyScene';
import source from '@/components/three/ParticlesScene.tsx?raw';

export const Route = createFileRoute('/examples/particles')({
  component: ParticlesPage,
});

function ParticlesPage() {
  return (
    <ExamplePage
      title="GPU Particles"
      description="A galactic spiral built from 6,000 points. The buffer is generated once on the CPU, uploaded to the GPU, and animated by rotating the container — keeping per-frame work near zero."
      seoDescription="6,000 particles arranged in a galactic spiral, rendered with additive blending and a single draw call."
      path="/examples/particles"
      tags={['BufferGeometry', 'Additive blending', 'Single draw call']}
      sourceCode={source}
      filename="ParticlesScene.tsx"
    >
      <LazyScene
        loader={() => import('@/components/three/ParticlesScene')}
        height="h-[70vh]"
        label="Loading particles…"
      />
    </ExamplePage>
  );
}
