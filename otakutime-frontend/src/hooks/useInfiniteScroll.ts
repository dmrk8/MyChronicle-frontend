import { useEffect, useRef } from 'react';

interface UseInfiniteScrollProps {
  callback: () => void;
  isLoading: boolean;
  hasNextPage: boolean;
  container?: HTMLElement | null;
  threshold?: number;
}

export function useInfiniteScroll({
  callback,
  isLoading,
  hasNextPage,
  container,
  threshold = 200,
}: UseInfiniteScrollProps) {
  const callbackRef = useRef(callback);
  const isFetchingRef = useRef(false);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Reset fetching flag when loading completes
  useEffect(() => {
    if (!isLoading) {
      isFetchingRef.current = false;
    }
  }, [isLoading]);

  useEffect(() => {
    if (!hasNextPage) return;

    const target = container || window;
    let ticking = false;

    const handleScroll = () => {
      // Prevent multiple calls per scroll
      if (ticking) return;
      
      ticking = true;
      requestAnimationFrame(() => {
        // Don't trigger if already fetching, loading, or no more pages
        if (isFetchingRef.current || isLoading || !hasNextPage) {
          ticking = false;
          return;
        }

        const scrollPosition = container
          ? container.scrollTop + container.clientHeight
          : window.innerHeight + window.scrollY;

        const bottomPosition = container
          ? container.scrollHeight
          : document.documentElement.scrollHeight;

        // Trigger when within threshold pixels of bottom
        if (scrollPosition >= bottomPosition - threshold) {
          isFetchingRef.current = true;
          callbackRef.current();
        }

        ticking = false;
      });
    };

    // Check on mount in case already at bottom
    handleScroll();

    target.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      target.removeEventListener('scroll', handleScroll);
    };
  }, [isLoading, hasNextPage, container, threshold]);
}
