"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface SessionShape {
  session_key?: number;
  session_name?: string;
  session_short_name?: string;
  session_type?: string;
  meeting_key?: number;
  date_start?: string;
  date_end?: string;
  gmt_offset?: string;
  location?: string;
  circuit_name?: string;
  circuit_short_name?: string;
  year?: number;
}

export function useSessionQueue(sessions: SessionShape[], nowTs: number) {
  const [serverQueue, setServerQueue] = useState<SessionShape[] | null>(null);
  const [processedSessions, setProcessedSessions] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem("f1_processed_sessions");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [liveSessionKey, setLiveSessionKey] = useState<number | undefined>(undefined);
  const timersRef = useRef<number[]>([]);

  function getSyncDelayMs(sessionType?: string) {
    const practiceMs = 1.5 * 60 * 60 * 1000;
    const raceMs = 2 * 60 * 60 * 1000;
    if (!sessionType) return practiceMs;
    if (sessionType.toLowerCase().includes("race")) return raceMs;
    return practiceMs;
  }

  // Compute the queue from sessions (pure, memoized)
  const { computedQueue, meetingKey, year } = useMemo(() => {
    // `nowTs` must be provided by the caller to keep this hook pure during render
    const valid = (sessions || [])
      .filter((s) => s && s.date_start)
      .slice()
      .sort((a, b) => new Date(a.date_start!).getTime() - new Date(b.date_start!).getTime());

    const upcoming = valid.find((s) => new Date(s.date_start!).getTime() > nowTs) || valid[0];
    const mKey = upcoming?.meeting_key;
    const y = upcoming?.year;
    const queue = valid.filter((s) => s.meeting_key === mKey && s.year === y);

    return { computedQueue: queue, meetingKey: mKey, year: y };
  }, [sessions, nowTs]);

  // Persist computed queue to server (upsert) when it changes
  useEffect(() => {
    if (!computedQueue || computedQueue.length === 0) return;

    (async () => {
      try {
        const res = await fetch("/api/cron/session-queue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "upsert", payload: { meetingKey, year, sessions: computedQueue } }),
        });

        const json = await res.json();
        if (json && json.ok && json.doc && Array.isArray(json.doc.sessions)) {
          // update server queue if server responded (async)
          setServerQueue(json.doc.sessions as SessionShape[]);
        }
      } catch (e) {
        console.warn("Failed to persist session queue:", e);
      }
    })();
  }, [computedQueue, meetingKey, year]);

  // Schedule timers based on the effective queue (serverQueue preferred)
  useEffect(() => {
    // clear previous timers
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];

    const effectiveQueue = serverQueue && serverQueue.length > 0 ? serverQueue : computedQueue;
    if (!effectiveQueue || effectiveQueue.length === 0) return;

    const nowTs = Date.now();

    effectiveQueue.forEach((session) => {
      if (!session.date_start) return;
      const key = session.session_key ?? -1;
      if (processedSessions.includes(key)) return;

      const startTs = new Date(session.date_start).getTime();
      const effectiveEnd = session.date_end ? new Date(session.date_end).getTime() : null;
      if (startTs <= nowTs && (effectiveEnd === null || nowTs <= effectiveEnd)) {
        setLiveSessionKey(key);
      }

      const delayMs = getSyncDelayMs(session.session_type);
      const scheduledTime = startTs + delayMs;
      const msUntil = Math.max(0, scheduledTime - nowTs);

      const id = window.setTimeout(async () => {
        try {
          await fetch("/api/cron/sync", { method: "POST" });
        } catch (err) {
          console.warn("Failed to trigger sync:", err);
        }

        // Tell server this session was processed
        try {
          const res = await fetch("/api/cron/session-queue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "markProcessed", payload: { session_key: key, meetingKey: session.meeting_key, year: session.year } }),
          });

          const json = await res.json();
          if (json && json.ok && json.doc) {
            const serverProcessed = Array.isArray(json.doc.processedSessions) ? json.doc.processedSessions : [];
            setProcessedSessions(serverProcessed);
            try { localStorage.setItem("f1_processed_sessions", JSON.stringify(serverProcessed)); } catch {}
            if (Array.isArray(json.doc.sessions)) {
              setServerQueue(json.doc.sessions as SessionShape[]);
            }
          } else {
            const next = Array.isArray(processedSessions) ? [...processedSessions, key] : [key];
            setProcessedSessions(next);
            try { localStorage.setItem("f1_processed_sessions", JSON.stringify(next)); } catch {}
          }
        } catch (err) {
          console.warn("Failed to mark processed on server:", err);
          const next = Array.isArray(processedSessions) ? [...processedSessions, key] : [key];
          setProcessedSessions(next);
          try { localStorage.setItem("f1_processed_sessions", JSON.stringify(next)); } catch {}
        }
      }, msUntil);

      timersRef.current.push(id);
    });

    return () => timersRef.current.forEach((id) => clearTimeout(id));
  }, [computedQueue, serverQueue, processedSessions]);

  const sessionQueue = serverQueue && serverQueue.length > 0 ? serverQueue : computedQueue;

  return {
    sessionQueue,
    processedSessions,
    liveSessionKey,
  };
}
