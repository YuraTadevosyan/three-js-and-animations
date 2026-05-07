import { createFileRoute } from '@tanstack/react-router';
import { ExamplePage } from '@/components/ExamplePage';
import { LazyScene } from '@/components/three/LazyScene';
import source from '@/components/three/ShaderScene.tsx?raw';

export const Route = createFileRoute('/examples/shader')({
  component: ShaderPage,
});

function ShaderPage() {
  return (
    <ExamplePage
      title="Custom GLSL Shader"
      description="A 128×128 plane displaced in the vertex shader and shaded by a two-color ramp in the fragment shader. Loaded as raw GLSL via Vite's ?raw import."
      seoDescription="Vertex and fragment shaders driving a procedural wave plane with animated color ramp."
      path="/examples/shader"
      tags={['GLSL', 'ShaderMaterial', 'Vertex displacement']}
      sourceCode={source}
      filename="ShaderScene.tsx"
    >
      <LazyScene
        loader={() => import('@/components/three/ShaderScene')}
        height="h-[70vh]"
        label="Compiling shader…"
      />
    </ExamplePage>
  );
}
