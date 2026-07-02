import { NextResponse } from 'next/server';
import { fetchFiaDocumentSummaries } from '@/lib/services/fiaService';

export async function GET() {
  try {
    const documents = await fetchFiaDocumentSummaries(5);

    return NextResponse.json(
      { success: true, documents },
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
