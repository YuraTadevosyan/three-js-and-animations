import { useEffect, useState } from 'react';

function readHash(): string {
  if (typeof window === 'undefined') return '#/';
  return window.location.hash || '#/';
}

export function useHashRoute(): string {
  const [hash, setHash] = useState(readHash);

  useEffect(() => {
    const onHash = () => setHash(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  return hash;
}
