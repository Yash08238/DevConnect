import { useEffect, useCallback } from 'react';

export default function useInfiniteScroll(callback, hasMore, loading) {
  const handleScroll = useCallback(() => {
    if (!hasMore || loading) return;

    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 100
    ) {
      callback();
    }
  }, [callback, hasMore, loading]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
}
