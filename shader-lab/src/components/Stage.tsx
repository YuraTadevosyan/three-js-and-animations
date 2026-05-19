import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { DEMO_BY_ID } from '@/lib/demos';
import type { Params } from '@/lib/types';

interface StageProps {
  activeId: string;
  prevId: string | null;
  activeParams: Params;
  prevParams: Params | null;
  onTransitionComplete: () => void;
}

const TRANSITION_SECONDS = 0.55;

/**
 * Renders the active demo and (during a switch) the outgoing demo, cross-fading
 * via shared opacity refs that the demos sample inside their own useFrame loops.
 * Transition state lives in refs so we don't re-render the tree every frame.
 */
export function Stage({
  activeId,
  prevId,
  activeParams,
  prevParams,
  onTransitionComplete,
}: StageProps) {
  const activeOpacity = useRef({ current: prevId ? 0 : 1 });
  const prevOpacity   = useRef({ current: prevId ? 1 : 0 });
  const progress      = useRef(prevId ? 0 : 1);
  const completedRef  = useRef(false);

  // Reset progress whenever a new transition starts.
  useEffect(() => {
    if (prevId) {
      progress.current = 0;
      activeOpacity.current.current = 0;
      prevOpacity.current.current   = 1;
      completedRef.current = false;
    }
  }, [activeId, prevId]);

  useFrame((_, dt) => {
    if (!prevId || completedRef.current) return;
    progress.current = Math.min(1, progress.current + dt / TRANSITION_SECONDS);
    // Smooth cubic ease-in-out.
    const t = progress.current;
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    activeOpacity.current.current = eased;
    prevOpacity.current.current   = 1 - eased;
    if (progress.current >= 1) {
      completedRef.current = true;
      onTransitionComplete();
    }
  });

  const ActiveComp = DEMO_BY_ID[activeId]?.Component;
  const PrevComp   = prevId ? DEMO_BY_ID[prevId]?.Component : null;

  return (
    <>
      {/* Outgoing demo, fading out — keyed so React unmounts cleanly when prev clears. */}
      {PrevComp && prevParams && (
        <PrevComp key={`prev-${prevId}`} params={prevParams} opacityRef={prevOpacity.current} />
      )}
      {ActiveComp && (
        <ActiveComp key={`active-${activeId}`} params={activeParams} opacityRef={activeOpacity.current} />
      )}
    </>
  );
}
