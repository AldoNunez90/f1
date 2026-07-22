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
  console.log("--> ¿Me ejecuto en servidor o cliente?", typeof window === "undefined" ? "SERVIDOR" : "CLIENTE");
  const [now, setNow] = useState<number>(() => Date.now());

  // Traer los datos de la temporada actual (2026)
  const sessionConfig = useMemo(() => ({
    endpoint: "sessions",
    queryParams: { year: 2026 },
  }), []);

  const { data, loading, error, refetch } = useF1Data<Session[]>(sessionConfig);

  const sessions = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  // Timer para actualizar la cuenta regresiva en el hilo del navegador
  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => window.clearInterval(timerId);
  }, []);

  // 1. RESOLUCIÓN DE BUG DE REACT: El useMemo solo calcula la sesión lógica
  const nextSession = useMemo(() => {
    if (sessions.length === 0) return null;

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

    return (
      liveSession ||
      validSessions.find((session) => new Date(session.date_start!).getTime() > now) ||
      validSessions[0]
    );
  }, [sessions, now]);

  // Lógica de cálculo de la cuenta regresiva
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

  // 2. RENDER CONDICIONAL SEGURO (Fuera de hooks y memorizaciones)
  if (loading) {
    return (
      <div className="min-h-77.5 sm:min-h-55 flex items-center justify-center">
        <LoadingGrid />
      </div>
    );
  }
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;
  if (!nextSession) return null;

  const sessionUrl = `/sessions?year=${nextSession.year}&meeting_key=${nextSession.meeting_key}&session_key=${nextSession.session_key}`;

  return (
    // OPTIMIZACIÓN CLS: Garantizamos una altura mínima reservada de renderizado
    <section className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 shadow-xs min-h-77.5 sm:min-h-55">
      <div className="flex flex-col gap-4">
        <div>
          {/* OPTIMIZACIÓN ACCESIBILIDAD Y CONTRASTE: Cyan legible en tema claro y oscuro */}
          <p className="text-sm uppercase tracking-[0.3em] font-extrabold text-cyan-700 dark:text-cyan-400">
            Próxima sesión
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {formatSessionType(nextSession.session_name)}
          </h2>
        </div>

        {/* OPTIMIZACIÓN ESTRUCTURA HTML: 
            Convertimos el Link en el contenedor plano de los datos semánticos, usando divs estilizados puros */}
        <Link 
          href={sessionUrl}
          className="group block rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 p-4 hover:ring-2 hover:ring-cyan-500 transition-all cursor-pointer"
          aria-label={`Ver detalles de la próxima sesión en ${nextSession.circuit_name || nextSession.location}`}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            
            <div className="rounded-xl dark:bg-green-500/10 bg-gray-100/80 text-center p-3 flex flex-col justify-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] font-bold">Ubicación</p>
              <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white truncate">
                {nextSession.circuit_name || nextSession.location || "Lugar desconocido"}
              </p>
            </div>

            <div className="rounded-xl bg-green-500/10 dark:bg-green-500/20 p-3 text-center flex flex-col justify-center border border-green-500/10">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-[0.2em] font-bold">
                Cuenta regresiva
              </p>
              <p className="mt-1 text-sm font-extrabold text-gray-950 dark:text-white">
                {countdown}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-gray-800/40 p-3 text-center flex flex-col justify-center border border-gray-100/50 dark:border-gray-700/20">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] font-bold">
                Horario local
              </p>
              <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                {formatDateTimeWithOffset(nextSession.date_start, nextSession.gmt_offset)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-gray-800/40 p-3 text-center flex flex-col justify-center border border-gray-100/50 dark:border-gray-700/20">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] font-bold">
                Hora Argentina
              </p>
              <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                {formatArgentinaDateTime(nextSession.date_start)}
              </p>
            </div>
            
          </div>
          <div className="mt-3 text-center text-xs font-bold text-cyan-700 dark:text-cyan-400 group-hover:underline">
            Ver cronograma de todo el fin de semana →
          </div>
        </Link>
      </div>
    </section>
  );
}