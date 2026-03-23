import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollProps {
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  rootMargin?: string;
  threshold?: number;
  enabled?: boolean;
}

export function useInfiniteScroll({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  rootMargin = '600px',
  threshold = 0,
  enabled = true,
}: UseInfiniteScrollProps): React.RefCallback<HTMLDivElement> {
  const stateRef = useRef({ hasNextPage, isFetchingNextPage, fetchNextPage });
  useEffect(() => {
    stateRef.current = { hasNextPage, isFetchingNextPage, fetchNextPage };
  });

  const sentinelRef = useCallback((el: HTMLDivElement | null) => {
    if (!el || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const { hasNextPage, isFetchingNextPage, fetchNextPage } = stateRef.current;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    
    return () => observer.disconnect();
  }, [enabled, rootMargin, threshold]);

  return sentinelRef;
}