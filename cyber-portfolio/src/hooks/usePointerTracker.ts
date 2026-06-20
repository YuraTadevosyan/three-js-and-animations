'use client';

import { useEffect } from 'react';
import { useScene } from '@/store/useScene';

/**
 * Mount once at the app root. Feeds a normalised pointer (-1 → 1 per axis)
 * into the scene store so the camera rig + workspace can parallax to it
 * without any per-component DOM listeners. Touch is mapped too, so mobile
 * gets a gentle gyroscope-free parallax as you drag.
 */
export function usePointerTracker() {
  const setPointer = useScene((s) => s.setPointer);

  useEffect(() => {
    const update = (clientX: number, clientY: number) => {
      const x = (clientX / window.innerWidth) * 2 - 1;
      const y = (clientY / window.innerHeight) * 2 - 1;
      setPointer(x, y);
    };

    const onMouse = (e: MouseEvent) => update(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) update(t.clientX, t.clientY);
    };

    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
    };
  }, [setPointer]);
}
