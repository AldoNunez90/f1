import { getF1Db } from '@/lib/db/connection';
import { fetchF1Data } from '@/lib/services/f1Service';
import { syncF1Data } from './syncF1Data';

interface SessionItem {
  session_key: number;
  session_name?: string;
  session_type?: string;
  meeting_key?: number;
  date_start?: string;
  date_end?: string;
  processed?: boolean;
  year?: number;
}

interface SessionQueueDoc {
  meeting_key?: number;
  year?: number;
  sessions: SessionItem[];
  processedSessions: number[];
  lastUpdated?: Date;
}

const timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

const SESSION_END_GRACE_PERIOD_MS = 5 * 60 * 1000; // 5 minutos de gracia

function timerKey(meetingKey: number | undefined, year: number | undefined, sessionKey: number) {
  return `${year}::${meetingKey}::${sessionKey}`;
}

/**
 * Devuelve la duración estimada de una sesión en milisegundos.
 * Esta lógica está alineada con f1Service para consistencia.
 */
function getSessionDurationMs(sessionType?: string): number {
  switch (sessionType) {
    case 'Race':
      return 2 * 60 * 60 * 1000; // 2 horas
    case 'Qualifying':
    case 'SprintQualifying':
      return 60 * 60 * 1000; // 1 hora
    case 'Sprint':
      return 60 * 60 * 1000; // 1 hora (35 min de carrera + vueltas + post)
    case 'Practice':
      return 75 * 60 * 1000; // 75 minutos
    default:
      return 90 * 60 * 1000; // Fallback generoso de 90 minutos
  }
}

async function markProcessedAndMaybeAdvance(meetingKey: number | undefined, year: number | undefined, session_key: number): Promise<SessionQueueDoc | null> {
  const db = await getF1Db();
  const coll = db.collection('sessionqueues');

  const doc = (await coll.findOne({ meeting_key: meetingKey, year })) as SessionQueueDoc | null;
  if (!doc) throw new Error('No queue found');

  const processedSet = new Set<number>((doc.processedSessions || []).map((n) => Number(n)));
  processedSet.add(Number(session_key));

  const sessionsArr: SessionItem[] = (doc.sessions || []).map((s) => ({ ...s, processed: s.session_key === session_key ? true : s.processed }));

  const newDoc: SessionQueueDoc = { ...doc, sessions: sessionsArr, processedSessions: Array.from(processedSet), lastUpdated: new Date() };

  const allProcessed = sessionsArr.length > 0 && sessionsArr.every((s) => s.processed || processedSet.has(s.session_key));

  if (allProcessed) {
    try {
      const qYear = typeof year !== 'undefined' ? year : new Date().getFullYear();
      const sessionsAll = await fetchF1Data('sessions', { year: qYear });
      if (Array.isArray(sessionsAll)) {
        const meetingsMap = new Map<number, SessionItem[]>();
        (sessionsAll as SessionItem[]).forEach((s) => {
          const mk = s.meeting_key ?? 0;
          if (!meetingsMap.has(mk)) meetingsMap.set(mk, []);
          const arr = meetingsMap.get(mk)!;
          arr.push(s as SessionItem);
        });

        const meetingKeys = Array.from(meetingsMap.keys()).sort((a, b) => a - b);
        const idx = meetingKeys.indexOf(doc.meeting_key ?? -1);
        const nextIdx = idx >= 0 ? idx + 1 : 0;

        if (nextIdx < meetingKeys.length) {
          const nextMeetingKey = meetingKeys[nextIdx];
          const nextSessions = meetingsMap.get(nextMeetingKey) || [];
          newDoc.meeting_key = nextMeetingKey;
          newDoc.sessions = nextSessions.map((s) => ({ ...s, processed: false }));
          newDoc.processedSessions = [];
          newDoc.lastUpdated = new Date();
        } else {
          newDoc.lastUpdated = new Date();
        }
      }
    } catch (err) {
      console.warn('Failed to advance to next meeting:', err);
    }
  }

  await coll.updateOne({ meeting_key: meetingKey, year }, { $set: { sessions: newDoc.sessions, processedSessions: newDoc.processedSessions, meeting_key: newDoc.meeting_key, lastUpdated: newDoc.lastUpdated } });

  const saved = (await coll.findOne({ meeting_key: newDoc.meeting_key, year })) as SessionQueueDoc | null;
  // After updating DB, reschedule timers for this meeting document
  await scheduleForDoc(saved);

  return saved;
}

async function scheduleForDoc(doc: SessionQueueDoc | null) {
  if (!doc || !Array.isArray(doc.sessions)) return;

  const nowTs = Date.now();
  const meetingKey = doc.meeting_key;
  const year = doc.year;

  for (const session of doc.sessions) {
    if (!session.date_start) continue;
    const key = session.session_key ?? -1;
    const tKey = timerKey(meetingKey, year, key);

    // skip if already processed
    const processed = (doc.processedSessions || []).map((n) => Number(n));
    if (processed.includes(Number(key))) continue;

    // clear existing timer if present
    if (timers.has(tKey)) {
      clearTimeout(timers.get(tKey)!);
      timers.delete(tKey);
    }

    const startTs = new Date(session.date_start).getTime();
    const durationMs = getSessionDurationMs(session.session_type);
    const msUntil = Math.max(0, startTs + durationMs + SESSION_END_GRACE_PERIOD_MS - nowTs);

    const to = setTimeout(async () => {
      try {
        // run sync
        await syncF1Data();
      } catch (err) {
        console.warn('Server sync failed for session scheduler:', err);
      }

      try {
        await markProcessedAndMaybeAdvance(meetingKey, year, key);
      } catch (err) {
        console.warn('Failed to mark processed from scheduler:', err);
      }

      timers.delete(tKey);
    }, msUntil);

    timers.set(tKey, to);
  }
}

export async function rescheduleAll() {
  // clear all timers
  for (const t of timers.values()) clearTimeout(t);
  timers.clear();

  const db = await getF1Db();
  const coll = db.collection('sessionqueues');
  const cursor = coll.find({});
  const docs = await cursor.toArray();

  await Promise.all(docs.map((d) => scheduleForDoc(d as unknown as SessionQueueDoc)));
}

export async function initSessionScheduler() {
  try {
    await rescheduleAll();
    console.log('Session scheduler initialized');
  } catch (err) {
    console.error('Failed initializing session scheduler:', err);
  }
}

export { markProcessedAndMaybeAdvance };
