import { useEffect, useRef, useState } from 'react';

export function useInView<T extends Element = HTMLDivElement>(
  options: IntersectionObserverInit = { rootMargin: '200px' },
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      options,
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, options]);

  return { ref, inView };
}
