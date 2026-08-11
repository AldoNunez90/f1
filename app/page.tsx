"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import Image from "next/image";
import { useSessionQueue } from "@/lib/hooks/useSessionQueue";
import { useF1Data } from "@/lib/hooks/useF1Data";
import { useRssFeed } from "@/lib/hooks/useRssFeed";
import { useVideoFeed } from "@/lib/hooks/useVideoFeed";
import { VideoCard } from "@/app/components/cards/VideoCard";
import {
  formatSessionType,
  formatDateTimeWithOffset,
  formatArgentinaDateTime,
} from "@/lib/utils/formatters";
import { Countdown } from "@/app/components/cards/Countdown";
import { CircuitAnimation } from "./components/circuits/CircuitAnimation";
import { circuitsPaths } from "@/lib/data/circuitsPaths";
import { circuits } from "@/lib/data/circuits";
import { getCircuitAnimationDuration } from "@/lib/utils/circuitUtils";

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

const driversConfig = {
  endpoint: "drivers",
  queryParams: { session_key: "latest" },
};

const sessionsConfig = {
  endpoint: "sessions",
  queryParams: { year: 2026 },
};

function formatNewsDate(dateString?: string) {
  if (!dateString) return "Reciente";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? "Reciente"
    : date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function sanitizeDescription(description?: string) {
  if (!description) return "Ver noticia completa en la fuente original.";
  return description.replace(/<[^>]+>/g, "").trim();
}

// Función para normalizar nombres a slugs, para búsquedas consistentes.
const toSlug = (name?: string) =>
  name?.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export default function Home() {
  const { data: drivers, loading: driversLoading } = useF1Data(driversConfig);
  const { data: dataSessions, loading: sessionsLoading } = useF1Data(sessionsConfig);
  const { data: news, loading: newsLoading, error: newsError } = useRssFeed();
  const { data: videos, loading: videosLoading, error: videosError } = useVideoFeed();
  const [now] = useState(() => Date.now());

  const sessions: Session[] = useMemo(
    () => (Array.isArray(dataSessions) ? (dataSessions as Session[]) : []),
    [dataSessions]
  );

  // Hook tipado limpiamente sin necesidad de cast 'as any'
  const { sessionQueue, liveSessionKey } = useSessionQueue(sessions, now);

  const driverCount = Array.isArray(drivers) ? drivers.length : 0;
  const raceCount = 2;
  const sessionCount = sessions.length;
  const newsItems = Array.isArray(news) ? news.slice(0, 3) : [];

  const videoItems = Array.isArray(videos)
    ? [...videos]
        .sort(
          (a, b) =>
            (Date.parse(b.published || "") || 0) -
            (Date.parse(a.published || "") || 0)
        )
        .slice(0, 3)
    : [];

  // --- LÓGICA DE RESOLUCIÓN DE LA SESIÓN MOSTRADA ---
  const nextSession = useMemo(() => {
    const source =
      sessionQueue && sessionQueue.length > 0
        ? sessionQueue
        : sessions.filter((s) => s.date_start);

    const validSessions = source
      .slice()
      .sort((a, b) => new Date(a.date_start!).getTime() - new Date(b.date_start!).getTime());

    // Si la queue detecta una sesión en vivo por el marker
    const liveFromMarker = liveSessionKey
      ? validSessions.find((s) => s.session_key === liveSessionKey)
      : undefined;

    const liveSession =
      liveFromMarker ||
      validSessions.find((session) => {
        const start = new Date(session.date_start!).getTime();
        const end = session.date_end ? new Date(session.date_end).getTime() : null;
        return start <= now && (end === null || now <= end);
      });

    return (
      liveSession ||
      validSessions.find((session) => new Date(session.date_start!).getTime() > now) ||
      validSessions[0]
    );
  }, [sessions, sessionQueue, liveSessionKey, now]);

  // Chequeo explícito de estado EN VIVO para styling
  const isLiveNow = useMemo(() => {
    if (!nextSession?.date_start) return false;
    if (liveSessionKey && nextSession.session_key === liveSessionKey) return true;
    const start = new Date(nextSession.date_start).getTime();
    const end = nextSession.date_end ? new Date(nextSession.date_end).getTime() : null;
    return start <= now && (end === null || now <= end);
  }, [nextSession, liveSessionKey, now]);

  const sections = [
    {
      title: "Sesiones",
      description: "Prácticas, clasificaciones y carreras",
      href: "/sessions",
      count: sessionCount,
      color: "from-purple-600 to-purple-800",
      icon: "/sessionsImg.webp",
      loading: sessionsLoading,
    },
    {
      title: "Campeonatos",
      description: "Campeonatos de pilotos y equipos actualizados",
      href: "/championship",
      count: raceCount,
      color: "from-red-600 to-red-800",
      icon: "/banderaCuadros.webp",
      loading: driversLoading,
    },
    {
      title: "Pilotos",
      description: "Conoce a todos los pilotos de la temporada",
      href: "/drivers",
      count: driverCount,
      color: "from-blue-600 to-blue-800",
      icon: "/cascoDrivers.webp",
      loading: driversLoading,
    },
    {
      title: "Equipos",
      description: "Información completa de todos los equipos",
      href: "/teams",
      count: Math.ceil(driverCount / 2),
      color: "from-green-600 to-green-800",
      icon: "/teamsImg.webp",
      loading: driversLoading,
    },
  ];

  // Obtener trazado SVG y calcular duración según 'circuits.es'
  const circuitData = useMemo(() => {
    if (!nextSession) return null;

    // 1. Unificar la búsqueda: encontrar el `circuitInfo` que coincida con la sesión actual.
    const circuitInfo = circuits.find(
      (c) =>
        c.circuit_name === nextSession.circuit_name ||
        c.circuit_short_name === nextSession.location ||
        c.circuit_short_name === nextSession.circuit_short_name
    );

    // 2. Probar candidatos a slugs para mapear con el dataset local de circuitsPaths
    const slugCandidates = [
      toSlug(circuitInfo?.circuit_short_name),
      toSlug(circuitInfo?.circuit_name),
      toSlug(nextSession.circuit_short_name),
      toSlug(nextSession.circuit_name),
      toSlug(nextSession.location),
    ].filter((s): s is string => Boolean(s));

    // Ahora comprobamos contra circuitsPaths
    const matchedSlug = slugCandidates.find((slug) => circuitsPaths[slug]);

    if (!matchedSlug) return null;

    // 3. Calcular la duración dinámicamente
    const animationDuration = getCircuitAnimationDuration(
      circuitInfo?.fastest_lap_time,
      circuitInfo?.circuit_length
    );

    return {
      slug: matchedSlug,
      animationDuration,
    };
  }, [nextSession]);

  return (
    <div className="space-y-12">
      {/* Hero Section - AHORA VISIBLE EN MOBILE */}
      <section className="min-h-96 relative overflow-hidden rounded-2xl py-8 md:py-12 text-white flex justify-center md:justify-end items-center">
        {/* Imagen de fondo (ahora visible siempre) */}
        <div className="absolute inset-0">
          <Image
            src="/landingImgAlfaRomeo.webp"
            alt="F1 HUB - Hero Background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center z-0"
          />
        </div>

        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-black/30 z-0 pointer-events-none" />
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-cyan-800 opacity-20 blur-3xl z-0"></div>

        {/* Contenedor de texto - Quitamos el hidden */}
        <div className="flex relative z-10 flex-col max-w-lg m-5 bg-slate-900/80 md:bg-gray-600/30 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center md:text-left shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">F1 HUB</h1>
          <p className="text-slate-200 text-base md:text-lg mb-8 leading-relaxed font-medium">
            F1 HUB es una plataforma interactiva para los fanáticos de la Fórmula 1. Al iniciar sesión con tu cuenta de Google, podrás armar tu Garaje personalizado guardando a tus pilotos y escuderías favoritas, y participar en nuestro Prode para pronosticar los resultados de las clasificaciones y carreras de la temporada.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="/perfil"
              className="px-6 py-3 border-2 border-cyan-400 text-cyan-50 bg-cyan-900/50 font-bold rounded-lg hover:bg-cyan-500 hover:text-slate-900 hover:border-cyan-500 transition text-center shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              Acceder con Google →
            </Link>
            <Link
              href="/sessions"
              className="px-6 py-3 bg-slate-800/80 border-2 border-slate-600 text-white font-bold rounded-lg hover:bg-slate-700 hover:border-slate-500 transition text-center"
            >
              Resultados por sesiones
            </Link>
          </div>
        </div>
      </section>

      {/* --- WIDGET SESIÓN ACTIVA O PRÓXIMA --- */}
      {!sessionsLoading && nextSession ? (
        <section
          className={`relative overflow-hidden rounded-3xl border p-6 md:p-8 shadow-2xl text-white transition-colors ${
            isLiveNow
              ? "bg-slate-950 border-red-800/80"
              : "bg-slate-900 border-slate-800"
          }`}
        >
          {/* Ambient Glow dinámico */}
          <div
            className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl pointer-events-none ${
              isLiveNow ? "bg-red-600/15" : "bg-cyan-500/10"
            }`}
          />

          <div className="flex flex-col gap-6">
            {/* Header del Widget */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isLiveNow ? "bg-red-400" : "bg-cyan-400"
                      }`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isLiveNow ? "bg-red-500" : "bg-cyan-500"
                      }`}
                    ></span>
                  </span>
                  <p
                    className={`text-xs uppercase tracking-[0.25em] font-extrabold ${
                      isLiveNow ? "text-red-400" : "text-cyan-400"
                    }`}
                  >
                    {isLiveNow ? "En Vivo Ahora" : "Próxima Sesión"}
                  </p>
                </div>
                <h2 className="mt-1 text-3xl font-black tracking-tight text-white">
                  {formatSessionType(nextSession.session_name)}
                </h2>
              </div>

              <div className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/50">
                <span className="text-lg">🏎️</span>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Circuito
                  </p>
                  <p className="text-sm font-bold text-slate-200">
                    {nextSession.circuit_short_name ||
                      nextSession.circuit_name ||
                      nextSession.location ||
                      "Lugar desconocido"}
                  </p>
                </div>
              </div>
            </div>

            {/* Grid de Métricas + Animación */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Información y Horarios */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-4 backdrop-blur-sm">
                  <p
                    className={`text-[10px] uppercase tracking-[0.2em] font-extrabold mb-1 ${
                      isLiveNow ? "text-red-400" : "text-cyan-400"
                    }`}
                  >
                    {isLiveNow ? "Tiempo Transcurrido / Estado" : "Cuenta Regresiva"}
                  </p>
                  <div className="text-2xl font-black tracking-tight text-white">
                    <Countdown targetDate={nextSession.date_start} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-950/40 border border-slate-800/80 p-3.5">
                    <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400">
                      Horario Local
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-200">
                      {formatDateTimeWithOffset(
                        nextSession.date_start,
                        nextSession.gmt_offset
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-950/40 border border-slate-800/80 p-3.5">
                    <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-slate-400">
                      Hora Argentina
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-200">
                      {formatArgentinaDateTime(nextSession.date_start)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenedor del Trazado SVG Real */}
              <div className="lg:col-span-5 h-48 w-full flex items-center justify-center p-3 bg-slate-950/90 rounded-2xl border border-slate-800 shadow-inner relative overflow-hidden">
                {circuitData ? (
                  <CircuitAnimation
                    slug={circuitData.slug}
                    circuitName={nextSession.circuit_name || "Circuito"}
                    duration={circuitData.animationDuration}
                  />
                ) : (
                  <span className="text-xs text-slate-600 font-mono">
                    Trazado no disponible
                  </span>
                )}
              </div>
            </div>

            {/* Enlace de Acción */}
            <Link
              href={`/sessions?year=${nextSession.year}&meeting_key=${nextSession.meeting_key}`}
              className={`mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-xl border text-sm font-bold transition-all group ${
                isLiveNow
                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
              }`}
            >
              <span>Ver cronograma completo del evento</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </section>
      ) : sessionsLoading ? (
        <div className="h-64 bg-slate-900/50 rounded-3xl animate-pulse border border-slate-800" />
      ) : null}

      {/* Stats Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Estadísticas Generales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="text-cyan-500 dark:text-cyan-600 font-semibold hover:underline text-sm"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition hover:bg-gray-300 cursor-pointer">
                <Image
                  src={section.icon}
                  alt={section.title}
                  width={300}
                  height={300}
                />
                {section.loading ? (
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {section.count} {section.title.toLocaleLowerCase()}
                    </p>
                    <p className="text-xl">{"Ver todo →"} </p>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* News Section */}
      <section className="p-5 shadow-xl rounded-3xl bg-yellow-400/20 dark:bg-yellow-400/60">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Novedades
            </h2>
            <p className="text-gray-600 dark:text-gray-100 mt-2">
              Últimas noticias de Fórmula 1 combinadas desde varios RSS de alto interés.
            </p>
          </div>
          <Link
            href="/novedades"
            className="text-2xl md:text-sm text-center items-center rounded-full border border-cyan-600 px-5 py-3 font-semibold text-cyan-600 transition dark:text-white dark:bg-gray-900 hover:bg-cyan-600 hover:text-white"
          >
            Ver más novedades
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {newsLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-56 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700"
              />
            ))
          ) : newsError ? (
            <div className="rounded-3xl bg-red-50 p-6 text-red-700 dark:bg-red-900/30 dark:text-red-200">
              No se pudieron cargar las novedades. Intenta de nuevo más tarde.
            </div>
          ) : (
            newsItems.map((item) => (
              <a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-3xl border border-gray-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:border-cyan-400 dark:border-gray-800 dark:bg-slate-950"
              >
                <div className="flex h-full flex-col justify-between gap-6">
                  <div className="relative w-full h-48 overflow-hidden rounded-xl">
                    <Image
                      src={item.img || "/landingImgAlfaRomeo.png"}
                      alt={item.title}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      fill
                      className="object-cover rounded-2xl"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {sanitizeDescription(item.description).slice(0, 140)}
                      {item.description && item.description.length > 140 ? "..." : ""}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span>{formatNewsDate(item.pubDate)}</span>
                    <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                      Ver noticia →
                    </span>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      </section>

      {/* Videos Section */}
      <section className="max-w-6xl mx-auto rounded-3xl bg-white dark:bg-gray-900 p-8 shadow-xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Últimos videos
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
              La última publicación de cada uno de los canales configurados en video feed.
            </p>
          </div>
          <div>
            <Link
              href="/novedades#videos"
              className="inline-flex items-center rounded-full border border-cyan-600 px-5 py-3 text-sm font-semibold text-cyan-600 transition hover:bg-cyan-600 hover:text-white"
            >
              Ver más videos
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {videosLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-700"
              />
            ))
          ) : videosError ? (
            <div className="rounded-3xl bg-red-50 p-6 text-red-700 dark:bg-red-900/30 dark:text-red-200">
              No se pudieron cargar los videos. Intenta de nuevo más tarde.
            </div>
          ) : (
            videoItems.map((video) => (
              <VideoCard
                key={video.channelId}
                title={video.title}
                link={video.link}
                channelName={video.channelName}
                published={video.published}
                description={video.description}
                thumbnail={video.thumbnail}
              />
            ))
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Características
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                ⚡
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Actualización automática
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Datos sincronizados desde que se publican en la web oficial de F1
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                💾
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Almacenado en MongoDB
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Acceso rápido sin latencia de API
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                🔄
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Sincronización Automática
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sin necesidad de actualizar manualmente
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                🎨
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Diseño Responsivo
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Funciona en cualquier dispositivo
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                📊
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Cards Interactivas
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Información organizada y visualmente atractiva
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                🔐
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Type-Safe
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                TypeScript para mayor confiabilidad
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}