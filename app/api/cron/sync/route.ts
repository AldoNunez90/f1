import { NextResponse } from 'next/server';
import { syncF1Data } from '@/lib/cron/syncF1Data';

export async function POST() {
  try {
    await syncF1Data();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error triggering manual F1 sync:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
