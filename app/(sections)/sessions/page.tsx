"use client";

import { useF1Data } from "@/lib/hooks/useF1Data";
import { SessionCard } from "@/app/components/cards/SessionCard";
import { LoadingGrid } from "@/app/components/common/Loading";
import { ErrorMessage, EmptyState } from "@/app/components/common/Error";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getCountryFlag,
  formatDate,
  formatDateTimeWithOffset,
  formatArgentinaDateTime,
  formatSessionType,
} from "@/lib/utils/formatters";
import Image from "next/image";
import SessionDetailsView from "@/app/components/cards/SessionDetailsView";
import { circuits } from "@/lib/data/circuits";
import { Countdown } from "@/app/components/cards/Countdown";

export interface Session {
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

function SessionsContent() {
  const searchParams = useSearchParams();

  const [selectedYear, setSelectedYear] = useState<number | null>(() => {
    const urlYear = searchParams.get("year");
    return urlYear ? Number(urlYear) : 2026;
  });

  const [selectedGroup, setSelectedGroup] = useState<string | null>(() => {
    const urlYear = searchParams.get("year");
    const urlMeetingKey = searchParams.get("meeting_key");
    return urlYear && urlMeetingKey ? `${urlYear}-${urlMeetingKey}` : null;
  });

  const [urlSessionKey] = useState<number | null>(() => {
    const sessionKey = searchParams.get("session_key");
    return sessionKey ? Number(sessionKey) : null;
  });

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    const handleReset = () => {
      setSelectedGroup(null);
      setSelectedSession(null);
    };

    window.addEventListener("resetSessionsView", handleReset);
    return () => window.removeEventListener("resetSessionsView", handleReset);
  }, []);

  const sessionConfig = useMemo(() => {
    return {
      endpoint: "sessions",
      queryParams: { year: selectedYear ? selectedYear : 2026 },
    };
  }, [selectedYear]);

  const { data, loading, error, refetch } = useF1Data(sessionConfig);

  const sessions = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const groupedSessions = useMemo(() => {
    return sessions.reduce(
      (acc: Record<string, Session[]>, session: Session) => {
        const key = `${session.year}-${session.meeting_key}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(session);
        return acc;
      },
      {},
    );
  }, [sessions]);

  const activeSession = useMemo(() => {
    if (selectedSession) return selectedSession;
    if (urlSessionKey && sessions.length > 0) {
      return sessions.find((s) => s.session_key === urlSessionKey) || null;
    }
    return null;
  }, [selectedSession, urlSessionKey, sessions]);

  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groupedSessions).sort((a, b) => {
      const dateA = new Date(groupedSessions[a][0].date_start || 0).getTime();
      const dateB = new Date(groupedSessions[b][0].date_start || 0).getTime();
      return dateA - dateB;
    });
  }, [groupedSessions]);

  // Estado con timestamp estático para no violar la pureza durante el render
  const [now] = useState<number>(() => Date.now());

  const nextSession = useMemo(() => {
    const validSessions = sessions
      .filter((session) => session.date_start)
      .sort(
        (a, b) =>
          new Date(a.date_start!).getTime() - new Date(b.date_start!).getTime(),
      );

    const liveSession = validSessions.find((session) => {
      const start = new Date(session.date_start!).getTime();
      const end = session.date_end ? new Date(session.date_end).getTime() : null;
      return start <= now && (end === null || now <= end);
    });

    return (
      liveSession ||
      validSessions.find(
        (session) => new Date(session.date_start!).getTime() > now,
      ) ||
      validSessions[0]
    );
  }, [sessions, now]);

  const circuitInfo = useMemo(() => {
    if (!selectedGroup || !groupedSessions[selectedGroup]) return null;
    const circuitShortName = groupedSessions[selectedGroup][0].circuit_short_name;
    return circuits.find((circuit) => circuit.circuit_short_name === circuitShortName);
  }, [selectedGroup, groupedSessions]);

  if (loading && !activeSession) return <LoadingGrid />;
  if (error && !activeSession) return <ErrorMessage message={error.message} onRetry={refetch} />;

  if (sessions.length === 0) {
    return <EmptyState title="Sin sesiones" description="No hay datos de sesiones disponibles" />;
  }

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setSelectedSession(null);
    if (urlSessionKey) {
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleBackToSessions = () => {
    setSelectedSession(null);
    if (urlSessionKey) {
      const url = new URL(window.location.href);
      url.searchParams.delete("session_key");
      window.history.replaceState({}, "", url.toString());
      window.location.reload();
    }
  };

  const handleSelectionGroup = (key: string) => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
    setSelectedGroup(key);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            🎯 Sesiones
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
            {activeSession
              ? `Resultados:`
              : selectedGroup && groupedSessions[selectedGroup]
                ? `Sesiones en ${groupedSessions[selectedGroup][0].location}`
                : `Total de eventos: ${sortedGroupKeys.length}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="yearChampionship"
            className="text-gray-700 dark:text-gray-300 font-semibold text-sm"
          >
            Año:
          </label>
          <select
            name="yearChampionship"
            id="yearChampionship"
            onChange={(e) => {
              setSelectedYear(Number(e.target.value));
              setSelectedGroup(null);
              setSelectedSession(null);
            }}
            value={selectedYear || 2026}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-600 outline-hidden transition cursor-pointer font-semibold text-sm"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
          </select>
        </div>
      </header>

      {/* 1. SECCIÓN PRÓXIMA SESIÓN */}
      {!selectedGroup && !activeSession && nextSession && selectedYear === 2026 ? (
        <section className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-xs min-h-77.5 sm:min-h-55">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] font-bold text-cyan-700 dark:text-cyan-400">
                Próxima sesión
              </p>
              <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {formatSessionType(nextSession.session_name)}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button
                onClick={() =>
                  handleSelectionGroup(`${nextSession.year}-${nextSession.meeting_key}`)
                }
                className="rounded-2xl dark:bg-green-500/10 bg-gray-100 text-center p-4 hover:ring-2 hover:ring-cyan-500 transition-all cursor-pointer border border-transparent dark:border-green-500/20"
                aria-label={`Ver datos del evento en ${
                  nextSession.circuit_name || nextSession.location
                }`}
              >
                <p className="uppercase tracking-[0.2em] font-bold text-gray-950 dark:text-white text-xs">
                  {nextSession.circuit_name ||
                    nextSession.location ||
                    "Lugar desconocido"}
                </p>
                <p className="text-sm mt-2 text-cyan-800 dark:text-cyan-400 font-semibold">
                  Ver datos
                </p>
              </button>
              <div className="rounded-2xl bg-green-500/10 dark:bg-green-500/20 p-4 border border-green-500/10">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-[0.2em] font-bold">
                  Cuenta regresiva
                </p>
                <p className="mt-2 text-sm font-bold text-gray-950 dark:text-white">
                  <Countdown targetDate={nextSession.date_start} />
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-[0.2em] font-bold">
                  Horario local
                </p>
                <p className="mt-2 text-sm font-bold text-gray-950 dark:text-white">
                  {formatDateTimeWithOffset(
                    nextSession.date_start,
                    nextSession.gmt_offset,
                  )}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-[0.2em] font-bold">
                  Hora Argentina
                </p>
                <p className="mt-2 text-sm font-bold text-gray-950 dark:text-white">
                  {formatArgentinaDateTime(nextSession.date_start)}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activeSession ? (
        <SessionDetailsView session={activeSession} onBack={handleBackToSessions} />
      ) : selectedGroup && groupedSessions[selectedGroup] ? (
        <div className="space-y-6">
          <button
            onClick={handleBackToGroups}
            className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 hover:text-cyan-600 font-bold transition group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>{" "}
            Volver a eventos
          </button>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-gray-800/40 p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="relative w-full aspect-square max-w-112.5 mx-auto overflow-hidden rounded-xl">
              {circuitInfo && (
                <Image
                  alt="Mapa del circuito de carrera"
                  src={`/circuitsMaps/${circuitInfo.circuit_code}.avif`}
                  fill
                  sizes="(max-width: 768px) 100vw, 450px"
                  className="object-contain"
                  priority
                />
              )}
            </div>
            <div className="flex items-center justify-center w-full">
              {circuitInfo && (
                <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 w-full shadow-xs">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-700">
                    Información del circuito
                  </h3>
                  <div className="space-y-2.5 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Nombre:</strong> {circuitInfo.circuit_name}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Longitud:</strong> {circuitInfo.circuit_length} km
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Primer GP:</strong> {circuitInfo.first_grand_prix}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Número de vueltas:</strong> {circuitInfo.number_of_laps}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Vuelta rápida:</strong> {circuitInfo.fastest_lap_time}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>Distancia de carrera:</strong> {circuitInfo.race_distance} km
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedSessions[selectedGroup].map((session: Session) => (
              <SessionCard
                key={session.session_key}
                {...session}
                onClick={
                  session.is_cancelled ? undefined : () => setSelectedSession(session)
                }
              />
            ))}
          </div>
        </div>
      ) : (
        /* 2. GRILLA PRINCIPAL DE EVENTOS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-150">
          {sortedGroupKeys.map((key) => {
            const group = groupedSessions[key];
            const firstSession = group[0];
            return (
              <article
                key={key}
                onClick={
                  firstSession.is_cancelled ? undefined : () => handleSelectionGroup(key)
                }
                className={
                  firstSession.is_cancelled
                    ? "cursor-not-allowed bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 flex flex-col"
                    : "cursor-pointer hover:translate-y-1 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 flex flex-col"
                }
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs text-cyan-700 dark:text-cyan-400 font-bold uppercase tracking-widest bg-cyan-50 dark:bg-cyan-900/10 px-2 py-1 rounded">
                    {formatDate(firstSession.date_start)}
                  </span>
                  <div className="relative w-8 h-6 overflow-hidden rounded-xs border border-gray-100 dark:border-gray-700">
                    <Image
                      src={getCountryFlag(firstSession.country_code)}
                      alt={`Bandera de ${firstSession.country_name || "N/A"}`}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {firstSession.location}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 italic">
                      {firstSession.circuit_short_name}
                    </p>
                  </div>
                  <div className="relative w-24 h-24 overflow-hidden shrink-0 bg-slate-50/50 dark:bg-gray-900/40 rounded-lg p-1 border border-gray-100 dark:border-gray-800/50">
                    <Image
                      alt={`Esquema del circuito de ${firstSession.location}`}
                      src={
                        `/circuitsMaps/${firstSession.location?.toLowerCase()}.svg` ||
                        `/circuitsMaps/${firstSession.circuit_short_name?.toLowerCase()}.svg`
                      }
                      fill
                      sizes="96px"
                      className="object-contain p-1"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 w-full">
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {firstSession.is_cancelled ? (
                      <span className="text-xs text-red-600 dark:text-red-400 font-bold tracking-wider uppercase">
                        Cancelado
                      </span>
                    ) : (
                      <span>{group.length} Sesiones</span>
                    )}
                  </div>
                  {!firstSession.is_cancelled && (
                    <span className="text-cyan-700 dark:text-cyan-400 font-bold text-sm hover:underline">
                      Ver detalles →
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<LoadingGrid />}>
      <SessionsContent />
    </Suspense>
  );
}