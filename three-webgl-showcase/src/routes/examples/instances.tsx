import { createFileRoute } from '@tanstack/react-router';
import { ExamplePage } from '@/components/ExamplePage';
import { LazyScene } from '@/components/three/LazyScene';
import source from '@/components/three/InstancesScene.tsx?raw';

export const Route = createFileRoute('/examples/instances')({
  component: InstancesPage,
});

function InstancesPage() {
  return (
    <ExamplePage
      title="Instanced Mesh + Raycasting"
      description="1,600 cubes rendered with InstancedMesh in a single draw call. Per-instance position, color, and raycast hover are updated each frame — hover the grid to highlight a cube."
      seoDescription="A 40×40 grid of instanced cubes (1,600 instances) animated as a single draw call, with per-instance raycast hover."
      path="/examples/instances"
      tags={['InstancedMesh', 'Raycasting', 'Performance']}
      sourceCode={source}
      filename="InstancesScene.tsx"
    >
      <LazyScene
        loader={() => import('@/components/three/InstancesScene')}
        height="h-[70vh]"
        label="Allocating instance buffers…"
      />
    </ExamplePage>
  );
}
