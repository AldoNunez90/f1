"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useF1Data } from "@/lib/hooks/useF1Data";
import { LoadingGrid } from "@/app/components/common/Loading";
import { ErrorMessage } from "@/app/components/common/Error";
import {
  formatSessionType,
  formatDateTimeWithOffset,
  formatArgentinaDateTime,
} from "@/lib/utils/formatters";

// Reutilizamos la interfaz
interface Session {
  session_key?: number;
  session_name?: string;
  session_type?: string;
  meeting_key?: number;
  date_start?: string;
  date_end?: string;
  gmt_offset?: string;
  location?: string;
  circuit_name?: string;
  country_code?: string;
  circuit_short_name?: string;
  country_name?: string;
  is_open?: boolean;
  is_cancelled?: boolean;
  year?: number;
  round?: number;
}

export default function NextSessionWidget() {
  const [now, setNow] = useState<number>(() => Date.now());

  // Traer los datos de la temporada actual (2026)
  const sessionConfig = useMemo(() => ({
    endpoint: "sessions",
    queryParams: { year: 2026 },
  }), []);

  const { data, loading, error, refetch } = useF1Data(sessionConfig);

  const sessions = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  // Buscamos la próxima sesión activa o futura
  const nextSession = useMemo(() => {
    const validSessions = sessions
      .filter((session) => session.date_start)
      .sort(
        (a, b) =>
          new Date(a.date_start!).getTime() - new Date(b.date_start!).getTime()
      );

    const liveSession = validSessions.find((session) => {
      const start = new Date(session.date_start!).getTime();
      const end = session.date_end ? new Date(session.date_end).getTime() : null;
      return start <= now && (end === null || now <= end);
    });

     if (loading) return <LoadingGrid />;
     if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;
     if (!nextSession) return null;

   

    return (
      liveSession ||
      validSessions.find((session) => new Date(session.date_start!).getTime() > now) ||
      validSessions[0]
    );
  }, [sessions, now, error, loading, refetch]);

  // Timer para actualizar la cuenta regresiva
  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timerId);
  }, []);

  // Lógica del countdown
  const countdown = useMemo(() => {
    if (!nextSession?.date_start) return "No disponible";

    const targetTime = new Date(nextSession.date_start).getTime();
    const diff = targetTime - now;

    if (diff <= 0) return "Finalizada";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, [nextSession, now]);

  if (loading) return <LoadingGrid />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;
  if (!nextSession) return null;

    const sessionUrl = `/sessions?year=${nextSession.year}&meeting_key=${nextSession.meeting_key}&session_key=${nextSession.session_key}`;

  return (
    <section className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Próxima sesión</p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formatSessionType(nextSession.session_name)}
          </h2>
        </div>
        <Link 
            href={sessionUrl}
            className="rounded-2xl dark:bg-green-500/30 bg-gray-100 text-center p-4 hover:ring-2 hover:ring-cyan-500 transition-all cursor-pointer block"
          >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Nota: quitamos el onClick ya que en la Home no manejas el estado de grupos de la página de sesiones */}
          <div className="rounded-2xl dark:bg-green-500/30 bg-gray-100 text-center p-4">
            <p className="uppercase tracking-[0.2em] text-gray-900 dark:text-white font-medium">
              {nextSession.circuit_name || nextSession.location || "Lugar desconocido"}
            </p>
          </div>

          <div className="rounded-2xl bg-green-500/20 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">
              Cuenta regresiva
            </p>
            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
              {countdown}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-gray-800 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">
              Horario local
            </p>
            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
              {formatDateTimeWithOffset(nextSession.date_start, nextSession.gmt_offset)}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-gray-800 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">
              Hora Argentina
            </p>
            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
              {formatArgentinaDateTime(nextSession.date_start)}
            </p>
          </div>
        </div>
        </Link>
      </div>
    </section>
  );
}