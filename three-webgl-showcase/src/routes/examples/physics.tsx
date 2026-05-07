import { createFileRoute } from '@tanstack/react-router';
import { ExamplePage } from '@/components/ExamplePage';
import { LazyScene } from '@/components/three/LazyScene';
import source from '@/components/three/PhysicsScene.tsx?raw';

export const Route = createFileRoute('/examples/physics')({
  component: PhysicsPage,
});

function PhysicsPage() {
  return (
    <ExamplePage
      title="Physics with Rapier"
      description="A WASM-powered physics world from @react-three/rapier. Bodies spawn every 700ms with restitution and friction tuned for satisfying bounces; the arena is capped at 30 active bodies."
      seoDescription="Real-time rigid-body physics with @react-three/rapier — falling cubes and spheres bouncing inside a walled arena."
      path="/examples/physics"
      tags={['Rapier', 'WASM', 'Rigid bodies']}
      sourceCode={source}
      filename="PhysicsScene.tsx"
    >
      <LazyScene
        loader={() => import('@/components/three/PhysicsScene')}
        height="h-[75vh]"
        label="Booting physics world…"
      />
    </ExamplePage>
  );
}
