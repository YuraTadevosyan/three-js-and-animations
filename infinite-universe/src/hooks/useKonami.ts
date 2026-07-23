import { useEffect, useRef } from 'react';
import { KONAMI_SEQUENCE } from '@/lib/config';

/** Fires `onUnlock` when the Konami code is typed. A hidden warp trigger. */
export function useKonami(onUnlock: () => void): void {
  const progress = useRef(0);
  const cb = useRef(onUnlock);
  cb.current = onUnlock;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const expected = KONAMI_SEQUENCE[progress.current];
      if (key === expected) {
        progress.current += 1;
        if (progress.current === KONAMI_SEQUENCE.length) {
          progress.current = 0;
          cb.current();
        }
      } else {
        // Allow a mismatched key to still start a fresh sequence.
        progress.current = key === KONAMI_SEQUENCE[0] ? 1 : 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
