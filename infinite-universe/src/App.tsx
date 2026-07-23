import { UniverseProvider } from '@/state/universeStore';
import { Universe } from '@/components/Universe';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export default function App() {
  const reducedMotion = useReducedMotion();
  return (
    <UniverseProvider reducedMotion={reducedMotion}>
      <Universe />
    </UniverseProvider>
  );
}
