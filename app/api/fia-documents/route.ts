import { NextResponse } from 'next/server';
import { fetchFiaDocumentSummaries } from '@/lib/services/fiaService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') ?? '10', 10);
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 10;

    const { documents, total } = await fetchFiaDocumentSummaries({
      limit: safeLimit,
      skip: (safePage - 1) * safeLimit,
    });

    return NextResponse.json(
      { success: true, documents, total, page: safePage, limit: safeLimit },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { success: false, error: 'Unable to load FIA documents', details: message },
      { status: 500 },
    );
  }
}
