'use client';

import { useCallback, useEffect, useState } from 'react';
import type { VideoItem } from '@/lib/services/videoService';

interface UseVideoFeedReturn {
  data: VideoItem[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useVideoFeed(): UseVideoFeedReturn {
  const [data, setData] = useState<VideoItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/videos');
      if (!response.ok) {
        throw new Error(`Video API error: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.videos ?? []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return {
    data,
    loading,
    error,
    refetch: fetchVideos,
  };
}
