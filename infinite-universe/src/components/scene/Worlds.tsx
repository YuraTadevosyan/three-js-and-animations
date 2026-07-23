import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { UNIVERSE } from '@/lib/config';
import { worldFromSlot, type WorldDesc } from '@/lib/worldgen';
import { useUniverse } from '@/state/universeStore';
import { World } from './World';
import { Connections } from './Connections';

/**
 * Streaming pool. The universe is generated per integer slot ahead of the
 * camera; a fixed window of slots is kept alive and slides forward as we
 * travel, so a couple dozen worlds create the illusion of an endless cosmos.
 * Slot → world is a pure, cached function, so streaming is seamless.
 */
export function Worlds() {
  const { shared, focus, setFocus } = useUniverse();
  const [startSlot, setStartSlot] = useState(-UNIVERSE.slotsBehind);
  const lastStart = useRef(startSlot);
  const cache = useRef<Map<number, WorldDesc>>(new Map());

  const getDesc = useCallback((slot: number) => {
    let d = cache.current.get(slot);
    if (!d) {
      d = worldFromSlot(slot);
      cache.current.set(slot, d);
    }
    return d;
  }, []);

  const planetGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 3), []);
  const ringGeo = useMemo(() => new THREE.RingGeometry(1.25, 2.4, 96, 1), []);
  useEffect(
    () => () => {
      planetGeo.dispose();
      ringGeo.dispose();
    },
    [planetGeo, ringGeo],
  );

  useFrame(() => {
    if (shared.paused) return; // freeze the window while scanning a world
    const slot0 = Math.round(-shared.camZ / UNIVERSE.slotSpacing);
    shared.charted = Math.max(shared.charted, slot0);
    const start = slot0 - UNIVERSE.slotsBehind;
    if (start !== lastStart.current) {
      lastStart.current = start;
      setStartSlot(start);
      // Drop cached worlds well outside the window to bound memory.
      const lo = start - 8;
      const hi = start + UNIVERSE.poolSize + 8;
      for (const k of cache.current.keys()) {
        if (k < lo || k > hi) cache.current.delete(k);
      }
    }
  });

  const descs = useMemo(
    () => Array.from({ length: UNIVERSE.poolSize }, (_, i) => getDesc(startSlot + i)),
    [startSlot, getDesc],
  );

  const focusedSlot = focus?.slot ?? null;

  return (
    <>
      <Connections descs={descs} />
      {descs.map((desc, i) => (
        <World
          key={i}
          desc={desc}
          planetGeo={planetGeo}
          ringGeo={ringGeo}
          focusedSlot={focusedSlot}
          onSelect={setFocus}
        />
      ))}
    </>
  );
}
