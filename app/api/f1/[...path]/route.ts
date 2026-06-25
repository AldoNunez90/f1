import { NextRequest, NextResponse } from 'next/server';
import { fetchF1Data, isValidEndpoint } from '@/lib/services/f1Service';

/**
 * Dynamic API route handler para Open F1
 * Soporta: /api/f1/drivers, /api/f1/races, /api/f1/sessions, etc.
 * Con query parameters: /api/f1/laps?session_key=123
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    // Construir el endpoint desde los params dinámicos
    const {path} = await params;
    const endpoint = (path || []).join('/');

    if (!endpoint) {
      return NextResponse.json(
        {
          error: 'No endpoint specified',
          available: [
            'drivers',
            'races',
            'sessions',
            'laps',
            'intervals',
            'pit_stops',
            'weather',
            'position',
            'qualifying',
            'race_control_events',
            'session_result',
          ],
          usage: '/api/f1/[endpoint]?[queryParams]',
        },
        { status: 400 }
      );
    }

    // Validar endpoint
    if (!isValidEndpoint(endpoint)) {
      return NextResponse.json(
        {
          error: `Unknown endpoint: ${endpoint}`,
          available: [
            'drivers',
            'races',
            'sessions',
            'laps',
            'intervals',
            'pit_stops',
            'weather',
            'position',
            'qualifying',
            'race_control_events',
            'session_result',
          ],
        },
        { status: 400 }
      );
    }

    // Obtener query parameters
    const queryParams: Record<string, string | number> = {};
    request.nextUrl.searchParams.forEach((value, key) => {
      // Intentar convertir a número si es posible
      queryParams[key] = /^\d+$/.test(value) ? parseInt(value, 10) : value;
    });

    // Fetch data con caché
    const data = await fetchF1Data(endpoint, Object.keys(queryParams).length > 0 ? queryParams : undefined);

    return NextResponse.json(
      {
        success: true,
        endpoint,
        queryParams: Object.keys(queryParams).length > 0 ? queryParams : null,
        data,
        cached: true,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error in F1 API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to fetch F1 data',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
