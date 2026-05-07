import { createFileRoute } from '@tanstack/react-router';
import { ExamplePage } from '@/components/ExamplePage';
import { LazyScene } from '@/components/three/LazyScene';
import source from '@/components/three/TrailScene.tsx?raw';

export const Route = createFileRoute('/examples/trail')({
  component: TrailPage,
});

function TrailPage() {
  return (
    <ExamplePage
      title="Cursor Trail"
      description="600 points stored in a ring buffer. Each frame, the head index advances and assumes the cursor's world position; per-vertex colors lerp from violet (head) to cyan (tail) by age, drawn additively for a glow."
      seoDescription="600-point ring-buffer cursor trail with age-lerped per-vertex colors and additive blending."
      path="/examples/trail"
      tags={['Ring buffer', 'Vertex colors', 'Pointer']}
      sourceCode={source}
      filename="TrailScene.tsx"
    >
      <LazyScene
        loader={() => import('@/components/three/TrailScene')}
        height="h-[75vh]"
        label="Allocating trail buffer…"
      />
    </ExamplePage>
  );
}
