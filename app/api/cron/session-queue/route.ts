import { NextResponse } from 'next/server';
import { getTestDb } from '@/lib/db/connection';
import { fetchF1Data } from '@/lib/services/f1Service';
import { rescheduleAll, markProcessedAndMaybeAdvance } from '@/lib/cron/sessionScheduler';

/**
 * POST body: { action: 'upsert' | 'markProcessed', payload: any }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    const db = await getTestDb();
    const coll = db.collection('sessionqueues');

    if (action === 'upsert') {
      const { meetingKey, year, sessions } = payload;

      const now = new Date();
      const update = {
        $set: {
          meeting_key: meetingKey,
          year,
          sessions: (sessions || []).map((s: any) => ({ ...s, processed: false })),
          processedSessions: [],
          lastUpdated: now,
        },
      };

      await coll.updateOne({ meeting_key: meetingKey, year }, update, { upsert: true });
      const doc = await coll.findOne({ meeting_key: meetingKey, year });

      // Reschedule server timers after upsert
      try { await rescheduleAll(); } catch (err) { console.warn('Failed to reschedule after upsert:', err); }

      return NextResponse.json({ ok: true, doc });
    }

    if (action === 'markProcessed') {
      const { session_key, meetingKey, year } = payload;

      try {
        const saved = await markProcessedAndMaybeAdvance(meetingKey, year, session_key);
        return NextResponse.json({ ok: true, doc: saved });
      } catch (err: any) {
        return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error session-queue handler:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
