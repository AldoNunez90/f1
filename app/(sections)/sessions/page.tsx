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

  // 1. INICIALIZACIÓN DIRECTA DESDE LA URL (Cero renders en cascada)
  const [selectedYear, setSelectedYear] = useState<number | null>(() => {
    const urlYear = searchParams.get("year");
    return urlYear ? Number(urlYear) : 2026;
  });
  
  const [selectedGroup, setSelectedGroup] = useState<string | null>(() => {
    const urlYear = searchParams.get("year");
    const urlMeetingKey = searchParams.get("meeting_key");
    return urlYear && urlMeetingKey ? `${urlYear}-${urlMeetingKey}` : null;
  });

  // Guardamos solo la key de la sesión que viene por URL para buscarla cuando carguen los datos
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
      endpoint: 'sessions',
      queryParams: { year: selectedYear ? selectedYear : 2026 }
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

  // 2. ESTADO DERIVADO DURANTE EL RENDERIZADO
  // Si tenemos una urlSessionKey activa pero no hemos seleccionado manualmente una sesión,
  // la derivamos directamente de la lista de sesiones ya cargada.
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

  const [now, setNow] = useState<number>(() => Date.now());

  const nextSession = useMemo(() => {
    const validSessions = sessions
      .filter((session) => session.date_start)
      .sort(
        (a, b) => new Date(a.date_start!).getTime() - new Date(b.date_start!).getTime(),
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

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const countdown = useMemo(() => {
    if (!nextSession?.date_start) return 'No disponible';

    const targetTime = new Date(nextSession.date_start).getTime();
    const diff = targetTime - now;

    if (diff <= 0) return 'Finalizada';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, [nextSession, now]);

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
    // Forzamos limpiar la sesión derivada de la URL si vuelve atrás
    if (urlSessionKey) {
      const url = new URL(window.location.href);
      url.search = "";
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleBackToSessions = () => {
    setSelectedSession(null);
    // Si venía de la URL, limpiamos los params para que no se quede estancado en detalles
    if (urlSessionKey) {
      const url = new URL(window.location.href);
      url.searchParams.delete("session_key");
      window.history.replaceState({}, "", url.toString());
      // Forzamos un reinicio local para que activeSession pase a ser null
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            🎯 Sesiones
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {activeSession
              ? `Resultados:`
              : selectedGroup && groupedSessions[selectedGroup]
                ? `Sesiones en ${groupedSessions[selectedGroup][0].location}`
                : `Total de eventos: ${sortedGroupKeys.length}`}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            name="yearChampionship"
            id="yearChampionship"
            onChange={(e) => {
              setSelectedYear(Number(e.target.value));
              setSelectedGroup(null);
              setSelectedSession(null);
            }}
            value={selectedYear || 2026}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-600 outline-none transition cursor-pointer"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
          </select>
        </div>
      </div>

      {!selectedGroup && !activeSession && nextSession && selectedYear === 2026 ? (
        <section className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex flex-col gap-4 ">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">Próxima sesión</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {formatSessionType(nextSession.session_name)}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div onClick={() => handleSelectionGroup(`${nextSession.year}-${nextSession.meeting_key}`)} className="rounded-2xl dark:bg-green-500/30 bg-gray-100 text-center p-4 hover:ring-2 hover:ring-cyan-500 transition-all ring-roup cursor-pointer">
                <p className="uppercase tracking-[0.2em]">
                  {nextSession.circuit_name || nextSession.location || 'Lugar desconocido'}
                </p>
                <p className="text-sm mt-2 text-cyan-800 dark:text-cyan-400">Ver datos</p>
              </div>
              <div className="rounded-2xl bg-green-500/20 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Cuenta regresiva</p>
                <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{countdown}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-gray-800 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Horario local</p>
                <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{formatDateTimeWithOffset(nextSession.date_start, nextSession.gmt_offset)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-gray-800 p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Hora Argentina</p>
                <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{formatArgentinaDateTime(nextSession.date_start)}</p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activeSession ? (
        <SessionDetailsView session={activeSession} onBack={handleBackToSessions} />
      ) : selectedGroup && groupedSessions[selectedGroup] ? (
        <div className="space-y-6">
          <button onClick={handleBackToGroups} className="flex items-center gap-2 text-cyan-600 hover:text-cyan-500 font-bold transition group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver a eventos
          </button>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative flex items-center justify-center">
              {circuitInfo && (
                <Image alt="circuit map" src={`/circuitsMaps/${circuitInfo.circuit_code}.avif`} width={900} height={900} />
              )}
            </div>
            <div className="relative flex items-center justify-center">
              {circuitInfo && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Información del circuito</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1"><strong>Nombre:</strong> {circuitInfo.circuit_name}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1"><strong>Longitud:</strong> {circuitInfo.circuit_length} km</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1"><strong>Primer GP:</strong> {circuitInfo.first_grand_prix}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1"><strong>Número de vueltas:</strong> {circuitInfo.number_of_laps}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1"><strong>Vuelta rápida:</strong> {circuitInfo.fastest_lap_time}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1"><strong>Distancia de carrera:</strong> {circuitInfo.race_distance} km</p>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedSessions[selectedGroup].map((session: Session, idx: number) => (
              <SessionCard
                key={idx}
                {...session}
                onClick={session.is_cancelled ? undefined : () => setSelectedSession(session)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedGroupKeys.map((key) => {
            const group = groupedSessions[key];
            const firstSession = group[0];
            return (
              <div
                key={key}
                onClick={firstSession.is_cancelled ? undefined : () => handleSelectionGroup(key)}
                className={firstSession.is_cancelled ? "cursor-not-allowed bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-transparent flex flex-col" : "cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all ring-roup bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-transparent flex flex-col"}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs text-cyan-600 uppercase tracking-widest bg-cyan-50 dark:bg-cyan-900/10 px-2 py-1 rounded">{formatDate(firstSession.date_start)}</span>
                  <span className="text-2xl" title={firstSession.country_name}>
                    <Image src={getCountryFlag(firstSession.country_code)} alt={firstSession.country_name} width={32} height={24} />
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{firstSession.location}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 italic">{firstSession.circuit_short_name}</p>
                  </div>
                  <div className="relative max-w-30">
                    <Image
                      alt="circuit map"
                      src={`/circuitsMaps/${firstSession.location.toLowerCase()}.svg` || `/circuitsMaps/${firstSession.circuit_short_name.toLowerCase()}.svg`}
                      width={500}
                      height={500}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {firstSession.is_cancelled ? <p className="text-xs text-cyan-600 tracking-widest px-2 py-1 rounded">Sesión Cancelada</p> : <p>{group.length} Sesiones</p>}
                  </span>
                  <span className="text-cyan-600 group-hover:translate-x-1 transition-transform font-bold text-sm">Ver detalles →</span>
                </div>
              </div>
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