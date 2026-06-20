'use client';

import dynamic from 'next/dynamic';

// WebGL touches `window`/`document`, so it must stay out of the SSR/export
// pass. Loading it client-only also keeps three.js out of the initial bundle.
const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => null,
});

export function SceneCanvas() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Scene />
    </div>
  );
}
