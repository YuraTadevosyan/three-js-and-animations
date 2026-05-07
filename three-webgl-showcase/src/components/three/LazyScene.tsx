import { Suspense, lazy, type ComponentType } from 'react';
import { useInView } from '@/hooks/useInView';
import { CanvasFallback } from './CanvasFallback';

type SceneModule = { default: ComponentType };

interface LazySceneProps {
  loader: () => Promise<SceneModule>;
  className?: string;
  label?: string;
  height?: string;
  eager?: boolean;
}

export function LazyScene({
  loader,
  className,
  label,
  height = 'h-[70vh]',
  eager = false,
}: LazySceneProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '300px' });
  const Scene = lazy(loader);

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden rounded-lg ${height} ${className ?? ''}`}
    >
      {(eager || inView) ? (
        <Suspense fallback={<CanvasFallback label={label} />}>
          <Scene />
        </Suspense>
      ) : (
        <CanvasFallback label={label ?? 'Scene will load when visible'} />
      )}
    </div>
  );
}
