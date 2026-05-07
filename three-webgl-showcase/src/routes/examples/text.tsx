import { createFileRoute } from '@tanstack/react-router';
import { ExamplePage } from '@/components/ExamplePage';
import { LazyScene } from '@/components/three/LazyScene';
import source from '@/components/three/Text3DScene.tsx?raw';

export const Route = createFileRoute('/examples/text')({
  component: TextPage,
});

function TextPage() {
  return (
    <ExamplePage
      title="3D Text"
      description="Three lines of SDF text (via troika-three-text under Drei's <Text>) float and rotate toward the cursor. SDF means the glyphs stay crisp at any zoom level, with a single draw call per line."
      seoDescription="SDF-rendered text in 3D space with cursor-tracked rotation, floating motion, and crisp outlines at any zoom."
      path="/examples/text"
      tags={['SDF', 'Troika', 'Typography']}
      sourceCode={source}
      filename="Text3DScene.tsx"
    >
      <LazyScene
        loader={() => import('@/components/three/Text3DScene')}
        height="h-[70vh]"
        label="Loading typography…"
      />
    </ExamplePage>
  );
}
