import { getDriverProfile } from "@/lib/db/f1-db";
import { getCountryFlag, formatDate } from "@/lib/utils/formatters";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DriverDetailPage({ params }: PageProps) {
  const { id } = await params;
  const driverData = await getDriverProfile(id);

  if (!driverData) {
    notFound();
  }

  const driver = driverData as unknown as {
    _id: string;
    name?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    permanentNumber?: number;
    gender?: string;
    dateOfBirth?: string;
    dateOfDeath?: string;
    placeOfBirth?: string;
    countryId?: string;
    birthCountryId?: string;
    alpha2Code?: string;
    stats?: {
      wins?: number;
      podiums?: number;
      poles?: number;
      championships?: number;
      fastestLaps?: number;
      entries?: number;
      starts?: number;
      laps?: number;
      points?: number;
      sprintRaceStarts?: number;
      sprintRaceWins?: number;
      sprintRacePodiums?: number;
      driverOfTheDay?: number;
      grandSlams?: number;
    };
    records?: {
      bestChampionshipPosition?: number | null;
      bestStartingGridPosition?: number | null;
      bestRaceResult?: number | null;
      bestSprintRaceResult?: number | null;
    };
    familyWithDetails?: Array<{
      driverId: string;
      name: string;
      relationship: string;
    }>;
    teammatesByYear?: Record<
      number,
      Array<{ id: string; name: string; constructorId: string }>
    >;
    teamsHistory?: Array<{
      year: number;
      constructorId?: string;
      entrantId?: string;
      engine?: string;
      testDriver?: boolean;
    }>;
    historicTeammatesDetails?: Array<{
      _id: string;
      fullName?: string;
      name?: string;
    }>;
  };

  const displayName =
    driver.fullName ||
    driver.name ||
    `${driver.firstName || ""} ${driver.lastName || ""}`.trim();
  const flagUrl = getCountryFlag(driver.alpha2Code || driver.countryId);
  const stats = driver.stats || {};

  // Diccionario ampliado de parentescos
  const relationshipTranslation: Record<string, string> = {
    father: "Padre",
    son: "Hijo",
    brother: "Hermano",
    "half-brother": "Medio hermano",
    uncle: "Tío",
    nephew: "Sobrino",
    grandfather: "Abuelo",
    grandson: "Nieto",
    cousin: "Primo",
    "brother-in-law": "Cuñado",
    "father-in-law": "Suegro",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Navegación / Volver */}
      <div>
        <Link
          href="/drivers"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
        >
          ← Volver al listado de pilotos
        </Link>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-2xl bg-linear-to-r from-slate-900 via-gray-900 to-slate-800 text-white p-6 md:p-10 shadow-xl overflow-hidden border border-gray-800">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              {flagUrl.startsWith("http") && (
                <div className="relative w-9 h-6 rounded-xs overflow-hidden border border-white/20 shadow-xs">
                  <Image
                    src={flagUrl}
                    alt={`Bandera de ${driver.countryId || "país"}`}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
              )}
              <span className="text-xs uppercase font-bold tracking-widest text-cyan-400">
                {driver.countryId?.replace(/-/g, " ")}
              </span>

              {/* Si nació en un país distinto a su nacionalidad deportiva */}
              {driver.birthCountryId &&
                driver.birthCountryId !== driver.countryId && (
                  <span className="text-xs text-gray-400 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs">
                    Nacido en {driver.birthCountryId.replace(/-/g, " ")}
                  </span>
                )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              {displayName}
            </h1>

            {driver.placeOfBirth && (
              <p className="text-sm text-gray-400">
                Lugar de nacimiento:{" "}
                <span className="text-gray-200 font-medium">
                  {driver.placeOfBirth}
                </span>
              </p>
            )}
          </div>

          {driver.permanentNumber && (
            <div className="text-6xl md:text-8xl font-black text-white/10 select-none">
              #{driver.permanentNumber}
            </div>
          )}
        </div>
      </div>

      {/* Grid Principal: Info Personal y Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna Izquierda: Información Personal y Familia */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Información Personal
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Fecha de Nacimiento
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-200">
                  {formatDate(driver.dateOfBirth)}
                </p>
              </div>

              {driver.dateOfDeath && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Fallecimiento
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-200">
                    {formatDate(driver.dateOfDeath)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  GPs Iniciados
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-200">
                  {stats.starts || 0} (de {stats.entries || 0} inscripciones)
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Puntos Totales
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-200">
                  {stats.points || 0} pts
                </p>
              </div>
            </div>
          </div>

          {/* Sección de Parentesco / Familia */}
          {driver.familyWithDetails && driver.familyWithDetails.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                Familiares en F1
              </h2>

              <div className="space-y-2">
                {driver.familyWithDetails.map((member, idx) => (
                  <Link
                    key={idx}
                    href={`/drivers/${member.driverId}`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-cyan-50 dark:hover:bg-gray-700/50 transition border border-gray-100 dark:border-gray-800"
                  >
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {member.name}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300">
                      {relationshipTranslation[
                        member.relationship.toLowerCase()
                      ] || member.relationship}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Columna Centro/Derecha: Métricas y Sprints */}
        <div className="md:col-span-2 space-y-6">
          {/* Grid de Estadísticas Principales */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                Campeonatos
              </p>
              <p className="text-3xl font-black text-amber-500 mt-1">
                {stats.championships || 0}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                Victorias
              </p>
              <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
                {stats.wins || 0}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                Podios
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                {stats.podiums || 0}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                Poles
              </p>
              <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
                {stats.poles || 0}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                Carreras disputadas
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                {stats.starts || 0}
              </p>
            </div>
          
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                Vueltas Rápidas
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                {stats.fastestLaps || 0}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                Grand Slams
              </p>
              <p className="text-3xl font-black text-amber-500 mt-1">
                {stats.grandSlams || 0}
              </p>
            </div>

            {/* Sprints  */}
            {(stats?.sprintRaceStarts ?? 0) > 0 && (
              <>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Sprints disputadas
                  </p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                    {stats.sprintRaceStarts || 0}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Victorias (Sprints)
                  </p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                    {stats.sprintRaceWins || 0}
                  </p>
                </div>
             
              </>
            )}

            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                Silly Seassons
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                {0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Escuderías y Compañeros por Año */}
      {driver.teamsHistory && driver.teamsHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
            Historial de Escuderías y Compañeros
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="p-3 rounded-l-lg">Año</th>
                  <th className="p-3">Constructor / Escudería</th>
                  <th className="p-3 hidden md:table-cell">Motor</th>
                  <th className="p-3 rounded-r-lg">Compañero de Equipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                {driver.teamsHistory.map((item, idx) => {
                  const teammatesThisYear =
                    driver.teammatesByYear?.[item.year] || [];

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition"
                    >
                      <td className="p-3 font-bold text-cyan-600 dark:text-cyan-400">
                        {item.year}
                      </td>
                      <td className="p-3 text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                        {item.constructorId || item.entrantId || "N/A"}
                      </td>
                      <td className="p-3 text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell ">
                        {item.engine || "N/A"}
                      </td>
                      <td className="p-3">
  {(() => {
    // 1. Verificamos si en esa temporada el piloto figura como probador/reserva
    const isTestDriverThisYear = item.testDriver === true;

    if (isTestDriverThisYear) {
      return (
        <span className="text-xs text-amber-500/90 dark:text-amber-400 font-medium italic bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          Test driver
        </span>
      );
    }

    // 2. Si no es probador, renderizamos la lista de compañeros normalmente
    if (teammatesThisYear.length > 0) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {teammatesThisYear.map((tm) => (
            <Link
              key={tm.id}
              href={`/drivers/${tm.id}`}
              className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-500 text-xs font-semibold text-gray-800 dark:text-gray-200 transition inline-block"
            >
              {tm.name}
            </Link>
          ))}
        </div>
      );
    }

    // 3. Si era titular pero verdaderamente no hay registro de compañero
    return (
      <span className="text-xs text-gray-400 italic">
        Sin registros de compañero
      </span>
    );
  })()}
</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compañeros Históricos Generales (Fallback o Lista Global) */}
      {driver.historicTeammatesDetails &&
        driver.historicTeammatesDetails.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Todos los Compañeros Históricos (
              {driver.historicTeammatesDetails.length})
            </h2>

            <div className="flex flex-wrap gap-2">
              {driver.historicTeammatesDetails.map((teammate) => (
                <Link
                  key={teammate._id}
                  href={`/drivers/${teammate._id}`}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/60 hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-500 text-xs font-semibold text-gray-800 dark:text-gray-200 transition"
                >
                  {teammate.fullName || teammate.name || teammate._id}
                </Link>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
