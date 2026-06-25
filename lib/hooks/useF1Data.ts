'use client';

import { useEffect, useState } from 'react';

interface UseF1DataOptions {
  endpoint: string;
  queryParams?: Record<string, string | number>;
  refetchInterval?: number; // en ms, solo se ejecuta si está en fin de semana de carrera
}

interface UseF1DataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para consumir datos de la API de F1
 *
 * @example
 * const { data, loading, error } = useF1Data({
 *   endpoint: 'drivers',
 * });
 *
 * const { data, loading, error } = useF1Data({
 *   endpoint: 'laps',
 *   queryParams: { session_key: 9158 },
 * });
 */
export function useF1Data<T = unknown>(options: UseF1DataOptions): UseF1DataReturn<T> {
  const { endpoint, queryParams, refetchInterval = 300000 } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const buildUrl = () => {
    let url = `/api/f1/${endpoint}`;

    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      url += `?${params.toString()}`;
    }

    return url;
  };

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();

    // Setup auto-refetch si se especifica intervalo
    if (refetchInterval > 0) {
      const interval = setInterval(fetchData, refetchInterval);
      return () => clearInterval(interval);
    }
  }, [endpoint, JSON.stringify(queryParams), refetchInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
