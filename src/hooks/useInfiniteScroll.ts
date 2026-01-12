import { useEffect, useRef } from 'react';

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
  rootMargin = '200px',
  threshold = 0.1,
  enabled = true,
}: UseInfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Don't setup observer if disabled or no more pages
    if (!enabled || !hasNextPage) {
      return;
    }

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        // Trigger fetch when sentinel is visible and not already fetching
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    // Observe the sentinel element
    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observerRef.current.observe(currentSentinel);
    }

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasNextPage, isFetchingNextPage, fetchNextPage, rootMargin, threshold]);

  return sentinelRef;
}