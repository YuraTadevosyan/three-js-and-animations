import { createFileRoute } from '@tanstack/react-router';
import { ExamplePage } from '@/components/ExamplePage';
import { LazyScene } from '@/components/three/LazyScene';
import source from '@/components/three/ModelScene.tsx?raw';

export const Route = createFileRoute('/examples/model')({
  component: ModelPage,
});

function ModelPage() {
  return (
    <ExamplePage
      title="Material Showcase"
      description="An icosahedron with subdivision-driven smooth distortion, a studio environment map for realistic reflections, and orbit controls constrained to a comfortable zoom range."
      seoDescription="High-poly icosahedron with a distortion material, environment lighting, and orbit controls."
      path="/examples/model"
      tags={['PBR', 'Environment map', 'Distortion']}
      sourceCode={source}
      filename="ModelScene.tsx"
    >
      <LazyScene
        loader={() => import('@/components/three/ModelScene')}
        height="h-[70vh]"
        label="Loading model…"
      />
    </ExamplePage>
  );
}
