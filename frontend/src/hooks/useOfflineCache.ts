'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useOfflineCache<T>(key: string, fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);
  // Store fetcher in a ref to avoid it being a dependency (it changes every render)
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const loadCached = useCallback(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }, [key]);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const value = await fetcherRef.current();
      if (!mountedRef.current) return;
      setData(value);
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // quota exceeded, ignore
      }
    } catch (e: any) {
      if (!mountedRef.current) return;
      const cached = loadCached();
      if (cached !== null) {
        setData(cached);
        setError(
          typeof navigator !== 'undefined' && navigator?.onLine === false
            ? 'Offline: showing cached data.'
            : 'Failed to fetch: showing cached data.',
        );
      } else {
        setError(e?.message || 'Failed to fetch data.');
      }
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
    }
  }, [key, loadCached]);

  useEffect(() => {
    mountedRef.current = true;
    run();
    return () => {
      mountedRef.current = false;
    };
  }, [run]);

  return { data, loading, error, reload: run };
}
