'use client';

import { useEffect, useState, useCallback } from 'react';

interface UseF1DataOptions {
  endpoint: string;
  queryParams?: Record<string, string | number>;
  refetchInterval?: number; // en ms, solo se ejecuta si se requiere recarga automática explícita
}

interface UseF1DataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useF1Data<T = unknown>(options: UseF1DataOptions): UseF1DataReturn<T> {
  const { endpoint, queryParams, refetchInterval = 0 } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const buildUrl = useCallback(() => {
    let url = `/api/f1/${endpoint}`;

    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      url += `?${params.toString()}`;
    }

    return url;
  },[endpoint, queryParams]);

  const fetchData = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(buildUrl());

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    },
    [buildUrl]
  );

  useEffect(() => {
    const initialFetchTimer = setTimeout(() => {
      fetchData();
    }, 0);

    let intervalId: NodeJS.Timeout | undefined;
    if (refetchInterval > 0) {
      intervalId = setInterval(fetchData, refetchInterval);
    }

    return () => {
      clearTimeout(initialFetchTimer);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchData, refetchInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
