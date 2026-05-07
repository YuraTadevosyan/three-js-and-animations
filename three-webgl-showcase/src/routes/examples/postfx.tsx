import { createFileRoute } from '@tanstack/react-router';
import { ExamplePage } from '@/components/ExamplePage';
import { LazyScene } from '@/components/three/LazyScene';
import source from '@/components/three/PostFxScene.tsx?raw';

export const Route = createFileRoute('/examples/postfx')({
  component: PostFxPage,
});

function PostFxPage() {
  return (
    <ExamplePage
      title="Post-processing"
      description="Mip-mapped bloom, subtle chromatic aberration, and vignette stacked in an EffectComposer pipeline. Emissive, non-tone-mapped materials drive the bloom."
      seoDescription="Bloom, chromatic aberration, and vignette via the postprocessing EffectComposer."
      path="/examples/postfx"
      tags={['EffectComposer', 'Bloom', 'HDR']}
      sourceCode={source}
      filename="PostFxScene.tsx"
    >
      <LazyScene
        loader={() => import('@/components/three/PostFxScene')}
        height="h-[70vh]"
        label="Compiling effect chain…"
      />
    </ExamplePage>
  );
}
