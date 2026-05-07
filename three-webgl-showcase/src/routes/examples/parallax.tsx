import { createFileRoute } from '@tanstack/react-router';
import { ExamplePage } from '@/components/ExamplePage';
import { LazyScene } from '@/components/three/LazyScene';
import source from '@/components/three/ParallaxScene.tsx?raw';

export const Route = createFileRoute('/examples/parallax')({
  component: ParallaxPage,
});

function ParallaxPage() {
  return (
    <ExamplePage
      title="Cursor Parallax"
      description="18 colored cards distributed over six depth planes drift opposite the cursor with MathUtils.lerp damping. Closer layers move more, far layers less — a depth cue the brain reads instantly."
      seoDescription="18 layered cards drift in 3D space with cursor-driven parallax — depth-scaled offsets and damped lerp give a tactile, magazine-style feel."
      path="/examples/parallax"
      tags={['Interaction', 'Parallax', 'Lerp']}
      sourceCode={source}
      filename="ParallaxScene.tsx"
    >
      <LazyScene
        loader={() => import('@/components/three/ParallaxScene')}
        height="h-[70vh]"
        label="Layering cards…"
      />
    </ExamplePage>
  );
}
