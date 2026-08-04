import { NextRequest, NextResponse } from 'next/server';
import { getEngineByIdOrSlug } from '@/lib/f1-db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const engine = await getEngineByIdOrSlug(id);

    if (!engine) {
      return NextResponse.json({ error: 'Motor no encontrado' }, { status: 404 });
    }

    return NextResponse.json(engine);
  } catch (error) {
    console.error('Error fetching engine details:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos del motor' },
      { status: 500 }
    );
  }
}