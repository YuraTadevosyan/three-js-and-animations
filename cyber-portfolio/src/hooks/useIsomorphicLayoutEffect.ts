import { useEffect, useLayoutEffect } from 'react';

/**
 * useLayoutEffect warns during SSR. We statically export, so the server pass
 * has no layout to measure — fall back to useEffect there.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
