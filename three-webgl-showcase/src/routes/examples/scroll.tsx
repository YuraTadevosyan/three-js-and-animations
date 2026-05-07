import { createFileRoute } from '@tanstack/react-router';
import { ExamplePage } from '@/components/ExamplePage';
import { LazyScene } from '@/components/three/LazyScene';
import source from '@/components/three/ScrollScene.tsx?raw';

export const Route = createFileRoute('/examples/scroll')({
  component: ScrollPage,
});

function ScrollPage() {
  return (
    <ExamplePage
      title="Scroll-driven Storytelling"
      description="Drei's ScrollControls virtualizes 3 pages of scroll inside the canvas. The camera is interpolated through four key positions — the same pattern used for product launches and case studies."
      seoDescription="Camera fly-through bound to scroll progress with Drei ScrollControls — a storytelling pattern for product pages."
      path="/examples/scroll"
      tags={['ScrollControls', 'Camera lerp', 'Storytelling']}
      sourceCode={source}
      filename="ScrollScene.tsx"
    >
      <LazyScene
        loader={() => import('@/components/three/ScrollScene')}
        height="h-[80vh]"
        label="Wiring scroll proxy…"
      />
    </ExamplePage>
  );
}
