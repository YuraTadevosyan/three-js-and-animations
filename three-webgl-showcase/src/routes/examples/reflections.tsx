import { createFileRoute } from '@tanstack/react-router';
import { ExamplePage } from '@/components/ExamplePage';
import { LazyScene } from '@/components/three/LazyScene';
import source from '@/components/three/ReflectionsScene.tsx?raw';

export const Route = createFileRoute('/examples/reflections')({
  component: ReflectionsPage,
});

function ReflectionsPage() {
  return (
    <ExamplePage
      title="Reflective Floor"
      description="Drei's MeshReflectorMaterial renders the scene into an offscreen target each frame, then samples it back as a depth-aware blurred reflection — the classic showroom look without a custom shader."
      seoDescription="Real-time blurred reflections via Drei's MeshReflectorMaterial — a render-to-texture technique that gives a showroom feel."
      path="/examples/reflections"
      tags={['Render target', 'Reflections', 'Drei']}
      sourceCode={source}
      filename="ReflectionsScene.tsx"
    >
      <LazyScene
        loader={() => import('@/components/three/ReflectionsScene')}
        height="h-[70vh]"
        label="Building reflection target…"
      />
    </ExamplePage>
  );
}
