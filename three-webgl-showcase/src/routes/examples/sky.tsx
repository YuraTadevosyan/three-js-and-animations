import { createFileRoute } from '@tanstack/react-router';
import { ExamplePage } from '@/components/ExamplePage';
import { LazyScene } from '@/components/three/LazyScene';
import source from '@/components/three/SkyScene.tsx?raw';

export const Route = createFileRoute('/examples/sky')({
  component: SkyPage,
});

function SkyPage() {
  return (
    <ExamplePage
      title="Atmospheric Sky"
      description="Three.js' built-in Sky shader simulates Rayleigh + Mie scattering. The sun position traces a slow arc; volumetric clouds from @react-three/drei sit underneath."
      seoDescription="Three.js Sky shader with an animated sun position and volumetric clouds — atmospheric scattering driven by Rayleigh and Mie coefficients."
      path="/examples/sky"
      tags={['Atmospheric', 'Volumetric', 'Sky shader']}
      sourceCode={source}
      filename="SkyScene.tsx"
    >
      <LazyScene
        loader={() => import('@/components/three/SkyScene')}
        height="h-[75vh]"
        label="Computing scattering…"
      />
    </ExamplePage>
  );
}
