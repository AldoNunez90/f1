'use client';

import { useEffect, useState, useCallback } from 'react';
import { useF1Context } from '@/lib/context/F1Context';

interface UseF1DataOptions {
  endpoint: string;
  queryParams?: Record<string, string | number>;
  refetchInterval?: number;
}

interface UseF1DataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useF1Data<T = unknown>(options: UseF1DataOptions): UseF1DataReturn<T> {
  const { endpoint, queryParams, refetchInterval = 0 } = options;
  const { getCache, setCache } = useF1Context();

  const queryString = queryParams ? JSON.stringify(queryParams) : '';
  const cacheKey = `${endpoint}-${queryString}`;

  const cachedData = getCache(cacheKey) as T | undefined;

  const [data, setData] = useState<T | null>(cachedData || null);
  const [loading, setLoading] = useState<boolean>(!cachedData);
  const [error, setError] = useState<Error | null>(null);

  // Patron oficial de React: Sincronizar el estado durante el RENDER si cambia la clave de caché
  const [prevCacheKey, setPrevCacheKey] = useState<string>(cacheKey);
  if (prevCacheKey !== cacheKey) {
    setPrevCacheKey(cacheKey);
    setData(cachedData || null);
    setLoading(!cachedData);
    setError(null);
  }

  const buildUrl = useCallback(() => {
  let url = `/api/f1/${endpoint}`;

  if (queryString) {
    const paramsObj = JSON.parse(queryString) as Record<string, string | number>;
    const params = new URLSearchParams();
    Object.entries(paramsObj).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    url += `?${params.toString()}`;
  }

  return url;
}, [endpoint, queryString]);

  const fetchData = useCallback(
    async (ignoreCache = false) => {
      // Si ya está en caché y no forzamos refetch, no hacemos nada
      const existing = getCache(cacheKey) as T | undefined;
      if (existing && !ignoreCache) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(buildUrl());

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const result = await response.json();

        setData(result.data);
        setCache(cacheKey, result.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    },
    [buildUrl, cacheKey, getCache, setCache]
  );

  useEffect(() => {
    let isMounted = true;

    // Solo pedimos a la red si NO tenemos los datos en caché
    const existing = getCache(cacheKey);
    if (!existing) {
      // Envolvemos en una macro-tarea para evitar setState síncrono directo en la pila del efecto
      const timer = setTimeout(() => {
        if (isMounted) {
          fetchData(false);
        }
      }, 0);

      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }

    let intervalId: NodeJS.Timeout | undefined;
    if (refetchInterval > 0) {
      intervalId = setInterval(() => {
        if (isMounted) {
          fetchData(true);
        }
      }, refetchInterval);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [cacheKey, fetchData, getCache, refetchInterval]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
  };
}