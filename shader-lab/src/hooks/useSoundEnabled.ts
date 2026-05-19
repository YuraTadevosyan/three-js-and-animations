import { useCallback, useState } from 'react';
import { sound } from '@/lib/sound';

/**
 * React-side mirror of the singleton's enabled flag — used only by the toggle
 * button so it can re-render. All `sound.*()` calls elsewhere read the
 * singleton directly without subscribing.
 */
export function useSoundEnabled() {
  const [enabled, setEnabled] = useState(sound.enabled);
  const toggle = useCallback(() => {
    const next = !sound.enabled;
    sound.setEnabled(next);
    setEnabled(next);
  }, []);
  return { enabled, toggle };
}
