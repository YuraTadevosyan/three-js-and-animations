import { createFileRoute } from '@tanstack/react-router';
import { ExamplePage } from '@/components/ExamplePage';
import { LazyScene } from '@/components/three/LazyScene';
import source from '@/components/three/DragScene.tsx?raw';

export const Route = createFileRoute('/examples/drag')({
  component: DragPage,
});

function DragPage() {
  return (
    <ExamplePage
      title="Draggable Objects"
      description="Drei's PivotControls wrap each mesh with translate gizmos. Drag any object along the X/Y/Z axes; an HTML overlay (rendered via <Html />) shows which body is currently being moved."
      seoDescription="Three meshes with on-axis transform gizmos via Drei PivotControls — a tactile 3D editing experience."
      path="/examples/drag"
      tags={['PivotControls', 'Gizmos', 'HTML overlay']}
      sourceCode={source}
      filename="DragScene.tsx"
    >
      <LazyScene
        loader={() => import('@/components/three/DragScene')}
        height="h-[75vh]"
        label="Calibrating gizmos…"
      />
    </ExamplePage>
  );
}
