import { NextResponse } from 'next/server';
import { fetchLatMotorsportRssItems } from '@/lib/services/rssService';

export async function GET() {
  try {
    const items = await fetchLatMotorsportRssItems(3);

    return NextResponse.json(
      {
        success: true,
        items,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Unable to load RSS feed',
        details: message,
      },
      { status: 500 }
    );
  }
}
