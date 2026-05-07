import { createFileRoute } from '@tanstack/react-router';
import { ExamplePage } from '@/components/ExamplePage';
import { LazyScene } from '@/components/three/LazyScene';
import source from '@/components/three/HoloScene.tsx?raw';

export const Route = createFileRoute('/examples/holo')({
  component: HoloPage,
});

function HoloPage() {
  return (
    <ExamplePage
      title="Holographic Shader"
      description="A custom GLSL fresnel shader gives the outer shell a rim glow that intensifies at glancing angles, with animated scanlines and a slow vertical sweep. The wireframe core inside provides depth cues."
      seoDescription="Custom GLSL fresnel + scanline shader applied to a glowing icosahedron with a wireframe core."
      path="/examples/holo"
      tags={['GLSL', 'Fresnel', 'Additive']}
      sourceCode={source}
      filename="HoloScene.tsx"
    >
      <LazyScene
        loader={() => import('@/components/three/HoloScene')}
        height="h-[70vh]"
        label="Energizing hologram…"
      />
    </ExamplePage>
  );
}
