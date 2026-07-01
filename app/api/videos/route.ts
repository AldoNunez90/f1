import { NextResponse } from 'next/server';
import { fetchLatestVideos } from '@/lib/services/videoService';

export async function GET() {
  try {
    const videos = await fetchLatestVideos();

    return NextResponse.json(
      {
        success: true,
        videos,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to load videos feed',
        details: message,
      },
      { status: 500 },
    );
  }
}
