'use client';

import Link from 'next/link';
import { useF1Data } from '@/lib/hooks/useF1Data';
import Image from 'next/image';

export default function Home() {
  const { data: drivers, loading: driversLoading } = useF1Data({
    endpoint: 'drivers',
    queryParams: { session_key: "latest" }, // Cargar una vez con la sesión más reciente para obtener el conteo total de pilotos sin actualizar constantemente
  });
  
  const { data: sessions, loading: sessionsLoading } = useF1Data({
    endpoint: 'sessions',
    queryParams: { year: 2026}
  });

  const driverCount = Array.isArray(drivers) ? drivers.length : 0;
  const raceCount = 2;
  const sessionCount = Array.isArray(sessions) ? sessions.length : 0;

  const sections = [
    {
      title: '👨‍🚗 Pilotos',
      description: 'Conoce a todos los pilotos de la temporada',
      href: '/drivers',
      count: driverCount,
      color: 'from-blue-600 to-blue-800',
      icon: '/cascoDrivers.png',
      loading: driversLoading,
    },
    {
      title: '🏢 Equipos',
      description: 'Información completa de todos los equipos',
      href: '/teams',
      count: Math.ceil(driverCount / 2),
      color: 'from-green-600 to-green-800',
      icon: '/teamsImg.png',
      loading: driversLoading,
    },
    {
      title: '🏁 Campeonatos',
      description: 'Campeonatos de pilotos y equipos actualizados',
      href: '/championship',
      count: raceCount,
      color: 'from-red-600 to-red-800',
      icon: '/banderaCuadros.png',
      loading: driversLoading,
    },
    {
      title: '🎯 Sesiones',
      description: 'Prácticas, clasificaciones y carreras',
      href: '/sessions',
      count: sessionCount,
      color: 'from-purple-600 to-purple-800',
      icon: '/sessionsImg.png',
      loading: sessionsLoading,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-[url('../public/landingImgAlfaRomeo.png')] bg-center bg-no-repeat bg-cover y-16 text-white justify-items-end ">
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-cyan-800 opacity-20 blur-3xl"></div>
        <div className="absolute -left-32 -bottom-32 h-64 w-64 rounded-full bg-cyan-800 opacity-20 blur-3xl"></div>

        <div className="relative z-10 flex flex-col max-w-1/3 m-5 bg-gray-600/30  rounded-2xl p-5">
          {/* <div className="text-5xl mb-4">🏎️</div> */}
          <h1 className="text-5xl font-bold mb-4 mt-4">F1 News</h1>
          <p className="text-red-100 text-xl max-w-2xl mb-8 mt-4 whitespace-pre-line">
           {`Tu fuente actualizada de datos de F1.`}
          </p>

          <div className="flex gap-4 flex-wrap mb-10 ">
            <Link
              href="/championship"
              className="px-8 py-3 border-2 border-white text-white bg-cyan-900/50 font-bold rounded-lg hover:bg-cyan-500 transition mb-8"
            >
              Campeonatos →
            </Link>
            <Link
              href="sessions"
              className="px-8 py-3 bg-cyan-900/50 border-2 border-white text-white font-bold rounded-lg hover:bg-cyan-500 transition"
            >
              Resultados por sesiones
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">📊 Estadísticas Generales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section) => (
            <Link
            key={section.title}  
            href={section.href}
              className="text-cyan-500 dark:text-cyan-600 font-semibold hover:underline text-sm"
            >
            <div
              key={section.href}
              
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition hover:bg-gray-900 cursor-pointer"
            >
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
                    {section.count}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {section.title.split(' ')[1]}
                  </p>
                  <p>{"Ver todo ->"} </p> 
                </>
              )}
            </div>
                  </Link>
          ))}
        </div>
      </section>

      {/* Main Sections */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">🔍 Explora</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition"
            >
              <div className={`absolute inset-0 bg-linear-to-br ${section.color}`}></div>
              <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-30 transition"></div>

              <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                <div>
                 
                  <h3 className="text-2xl font-bold text-white mb-2">{section.title}</h3>
                  <p className="text-red-100">{section.description}</p>
                </div>

                <div className="mt-6 inline-flex items-center gap-2 text-white font-semibold">
                  Explorar {section.loading ? '...' : `(${section.count})`} →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">✨ Características</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                ⚡
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Actualización automática</h3>
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Almacenado en MongoDB</h3>
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sincronización Automática</h3>
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Diseño Responsivo</h3>
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Cards Interactivas</h3>
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Type-Safe</h3>
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
 
