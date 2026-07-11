'use client';

import { useCallback, useEffect, useState } from 'react';

export interface NewsItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  img?: string;
}

interface UseRssFeedReturn {
  data: NewsItem[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRssFeed(): UseRssFeedReturn {
  const [data, setData] = useState<NewsItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/rss/latmotorsport');

      if (!response.ok) {
        throw new Error(`RSS API error: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    data,
    loading,
    error,
    refetch: fetchNews,
  };
}
