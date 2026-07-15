"use client";

import Link from "next/link";
import { useF1Data } from "@/lib/hooks/useF1Data";
import { useRssFeed } from "@/lib/hooks/useRssFeed";
import { useVideoFeed } from "@/lib/hooks/useVideoFeed";
import Image from "next/image";
import { VideoCard } from "@/app/components/cards/VideoCard";
import { useEffect, useState, useMemo } from "react";
import {
  formatSessionType,
  formatDateTimeWithOffset,
  formatArgentinaDateTime,
} from "@/lib/utils/formatters";

// Mantenemos la interfaz para el tipado local de las sesiones
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

export default function Home() {
  const { data: drivers, loading: driversLoading } = useF1Data(driversConfig);
  const { data: dataSessions, loading: sessionsLoading } =
    useF1Data(sessionsConfig);
  const { data: news, loading: newsLoading, error: newsError } = useRssFeed();
  const {
    data: videos,
    loading: videosLoading,
    error: videosError,
  } = useVideoFeed();

  // Estado para controlar el tiempo actual del countdown
  const [now, setNow] = useState<number>(() => Date.now());

  const sessions: Session[] = useMemo(
    () => (Array.isArray(dataSessions) ? dataSessions : []),
    [dataSessions],
  );
  const driverCount = Array.isArray(drivers) ? drivers.length : 0;
  const raceCount = 2;
  const sessionCount = sessions.length;
  const newsItems = Array.isArray(news) ? news.slice(0, 3) : [];

  const videoItems = Array.isArray(videos)
    ? [...videos]
        .sort(
          (a, b) =>
            (Date.parse(b.published || "") || 0) -
            (Date.parse(a.published || "") || 0),
        )
        .slice(0, 3)
    : [];

  // --- LÓGICA DE CÁLCULO DE PRÓXIMA SESIÓN ---
  const nextSession = useMemo(() => {
    const validSessions = sessions
      .filter((session) => session.date_start)
      .sort(
        (a, b) =>
          new Date(a.date_start!).getTime() - new Date(b.date_start!).getTime(),
      );

    const liveSession = validSessions.find((session) => {
      const start = new Date(session.date_start!).getTime();
      const end = session.date_end
        ? new Date(session.date_end).getTime()
        : null;
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

  // Timer para el countdown
  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

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

  return (
    <div className="space-y-12">
     
  <section className="min-h-96 relative overflow-hidden rounded-2xl md:py-12 text-white justify-items-end flex items-center md:block">
    {/* 1. Imagen de fondo para pantallas de escritorio (MD en adelante) */}
    <div className="hidden md:block">
      <Image
        src="/landingImgAlfaRomeo.webp"
        alt="F1 Hub Hero Background"
        fill
        priority 
        sizes="(max-width: 1200px) 100vw, 1200px" 
        className="object-cover object-center z-0"
      />
    </div>

    {/* 2. Imagen de fondo para dispositivos móviles */}
    <div className="block md:hidden">
      <Image
        src="/landingImgMobile.webp"
        alt="F1 Hub Hero Background Mobile"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover object-center z-0"
      />
    </div>

    <div className="absolute inset-0 bg-linear-to-r from-black/50 via-transparent to-black/20 z-0 pointer-events-none" />

    <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-cyan-800 opacity-20 blur-3xl z-0"></div>
    <div className="absolute -left-32 -bottom-32 h-64 w-64 rounded-full bg-cyan-800 opacity-20 blur-3xl z-0"></div>

    <div className="hidden md:flex relative z-10 flex-col max-w-1/3 m-5 bg-gray-600/30 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
      <h1 className="text-5xl font-bold mb-4 mt-4 tracking-tight">F1 HUB</h1>
      <p className="text-red-100 text-xl max-w-2xl mb-8 mt-4 whitespace-pre-line font-medium">
        {`Tu fuente de datos de F1`}
      </p>

      <div className="flex gap-4 flex-wrap mb-10">
        <Link
          href="/championship"
          className="px-8 py-3 border-2 border-white text-white bg-cyan-900/50 font-bold rounded-lg hover:bg-cyan-500 hover:border-cyan-500 transition mb-8 text-center"
        >
          Campeonatos →
        </Link>
        <Link
          href="sessions"
          className="px-8 py-3 bg-cyan-900/50 border-2 border-white text-white font-bold rounded-lg hover:bg-cyan-500 hover:border-cyan-500 transition text-center"
        >
          Resultados por sesiones
        </Link>
      </div>
    </div>
  </section>

      {/* --- NUEVA SECCIÓN: WIDGET PRÓXIMA SESIÓN --- */}
      {!sessionsLoading && nextSession ? (
        <section className="rounded-3xl bg-gray-100 dark:bg-gray-900 border border-gray-400 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-600">
                Próxima sesión
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {formatSessionType(nextSession.session_name)}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Enlace que pasa los parámetros necesarios para saltar el flujo en la página destino */}
              <Link
                href={`/sessions?year=${nextSession.year}&meeting_key=${nextSession.meeting_key}`}
                className="rounded-2xl dark:bg-green-500/30 bg-gray-200 text-center p-4 hover:ring-2 hover:ring-cyan-500 transition-all ring-roup cursor-pointer block"
              >
                <p className="uppercase tracking-[0.2em] font-bold text-gray-800 dark:text-gray-200">
                  {nextSession.circuit_name ||
                    nextSession.location ||
                    "Lugar desconocido"}
                </p>
                <p className="text-sm mt-2 text-cyan-900 dark:text-cyan-400 font-semibold">
                  Ir a la sesión →
                </p>
              </Link>

              <div className="rounded-2xl bg-green-500/20 p-4">
                <p className="text-xs text-black dark:text-gray-400 uppercase tracking-[0.2em]">
                  Cuenta regresiva
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                  {countdown}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-gray-800 p-4">
                <p className="text-xs text-black dark:text-gray-400 uppercase tracking-[0.2em]">
                  Horario local
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDateTimeWithOffset(
                    nextSession.date_start,
                    nextSession.gmt_offset,
                  )}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 dark:bg-gray-800 p-4">
                <p className="text-xs text-black dark:text-gray-400 uppercase tracking-[0.2em]">
                  Hora Argentina
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                  {formatArgentinaDateTime(nextSession.date_start)}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : sessionsLoading ? (
        <div className="h-56 bg-white dark:bg-gray-900 rounded-3xl animate-pulse border border-gray-200 dark:border-gray-800 p-6" />
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
      <section className="p-5 shadow-xl rounded-3xl bg-yellow-400/20 dark:bg-yellow-400/60 ">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Novedades
            </h2>
            <p className="text-gray-600 dark:text-gray-100 mt-2">
              Últimas noticias de Fórmula 1 combinadas desde varios RSS de alto
              interés.
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
                  <Image
                    src={item.img || "/landingImgAlfaRomeo.png"}
                    alt={item.title}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    width={326}
                    height={218}
                    className="object-cover rounded-2xl"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {sanitizeDescription(item.description).slice(0, 140)}
                      {item.description && item.description.length > 140
                        ? "..."
                        : ""}
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
              La última publicación de cada uno de los canales configurados en
              video feed.
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
                Datos sincronizados desde que se publican en la web oficial de
                F1
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
