import { NextResponse } from 'next/server';
import { fetchLatestNewsItems } from '@/lib/services/rssService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedLimit = Number.parseInt(searchParams.get('limit') ?? '3', 10);
    const safeLimit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? requestedLimit : 3;

    const items = await fetchLatestNewsItems(safeLimit);

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
