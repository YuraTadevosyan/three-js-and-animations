import { Canvas } from '@react-three/fiber';
import { useCallback, useMemo, useState } from 'react';
import * as THREE from 'three';
import { DEMOS, DEMO_BY_ID, defaultParamsFor } from '@/lib/demos';
import type { ParamValue, Params } from '@/lib/types';
import { Stage } from '@/components/Stage';
import { DemoSwitcher } from '@/components/DemoSwitcher';
import { ControlPanel } from '@/components/ControlPanel';
import { StatusBar } from '@/components/StatusBar';
import { AboutPanel } from '@/components/AboutPanel';

export default function App() {
  // Each demo keeps its own parameter set so switching back restores the user's tweaks.
  const [paramsByDemo, setParamsByDemo] = useState<Record<string, Params>>(() =>
    Object.fromEntries(DEMOS.map((d) => [d.id, defaultParamsFor(d)])),
  );
  const [activeId, setActiveId] = useState<string>(DEMOS[0].id);
  const [prevId, setPrevId]     = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  const activeDemo  = DEMO_BY_ID[activeId];
  const activeParams = paramsByDemo[activeId];
  const prevParams   = prevId ? paramsByDemo[prevId] : null;

  const handleSelect = useCallback(
    (id: string) => {
      if (id === activeId || prevId) return; // ignore during transition
      setPrevId(activeId);
      setActiveId(id);
    },
    [activeId, prevId],
  );

  const handleParamChange = useCallback(
    (key: string, value: ParamValue) => {
      setParamsByDemo((prev) => ({
        ...prev,
        [activeId]: { ...prev[activeId], [key]: value },
      }));
    },
    [activeId],
  );

  const handleReset = useCallback(() => {
    setParamsByDemo((prev) => ({
      ...prev,
      [activeId]: defaultParamsFor(activeDemo),
    }));
  }, [activeId, activeDemo]);

  const handleTransitionComplete = useCallback(() => {
    setPrevId(null);
  }, []);

  const glConfig = useMemo(
    () => ({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance' as const,
      stencil: false,
      depth: true,
    }),
    [],
  );

  return (
    <div className="fixed inset-0 bg-ink-950 text-ink-100">
      <Canvas
        className="!fixed inset-0"
        gl={glConfig}
        dpr={[1, Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 1)]}
        camera={{ position: [0, 0, 3.2], fov: 50, near: 0.1, far: 50 }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#05060a'), 1);
        }}
      >
        <Stage
          activeId={activeId}
          prevId={prevId}
          activeParams={activeParams}
          prevParams={prevParams}
          onTransitionComplete={handleTransitionComplete}
        />
      </Canvas>

      {/* Subtle vignette overlay for depth without darkening the demos. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(140% 90% at 50% 40%, transparent 55%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      <DemoSwitcher activeId={activeId} onSelect={handleSelect} onAboutClick={() => setAboutOpen(true)} />
      <ControlPanel
        key={activeId}
        title={activeDemo.name}
        subtitle={activeDemo.tagline}
        accent={activeDemo.accent}
        controls={activeDemo.controls}
        values={activeParams}
        onChange={handleParamChange}
        onReset={handleReset}
      />
      <StatusBar demoName={activeDemo.name} accent={activeDemo.accent} />
      <AboutPanel open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
