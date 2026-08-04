import { getTeamByIdOrSlug } from '@/lib/f1-db';
import { BackButton } from '@/app/components/common/BackButton';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export interface DriverLink {
  _id: string;
  fullName: string;
}

export interface TeamDetail {
  _id: string;
  id?: string;
  name?: string;
  fullName?: string;
  countryId?: string;
  bestChampionshipPosition?: number;
  bestStartingGridPosition?: number;
  bestRaceResult?: number;
  totalChampionshipWins?: number;
  totalRaceEntries?: number;
  totalRaceStarts?: number;
  totalRaceWins?: number;
  totalPodiums?: number;
  totalPolePositions?: number;
  totalFastestLaps?: number;
  totalPoints?: number;
  [key: string]: unknown;
}

export interface SeasonConstructorRecord {
  _id: string;
  year: number;
  entrantId?: string;
  entrantName?: string;
  isCustomerEntry?: boolean;
  chassisName?: string;
  engineName?: string;
  drivers?: DriverLink[];
  positionNumber?: number | null;
  positionText?: string | null;
  points?: number | null;
  championshipWon?: boolean;
  isFirstForYear: boolean;
  totalForYear: number;
}

export default async function TeamDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getTeamByIdOrSlug(id);

  if (!result || !result.team) {
    notFound();
  }

  const team = result.team as TeamDetail;
  const seasonHistory = result.seasonHistory as SeasonConstructorRecord[];

  const uniqueYearsCount = result.uniqueYearsCount || seasonHistory.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Botón de regreso */}
      <BackButton />

      {/* Header Ficha e Indicadores Globales de la Escudería */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200 dark:border-gray-700/60 relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              {team.name || id}
            </h1>
            {Boolean(team.fullName) && team.fullName !== team.name && (
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">
                {team.fullName}
              </p>
            )}
          </div>

          {/* Tarjetas de Estadísticas Principales */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-center min-w-24">
              <span className="block text-xl font-black text-amber-500">
                🏆 {team.totalChampionshipWins ?? 0}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600/80 dark:text-amber-400">
                Títulos
              </span>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl text-center min-w-24">
              <span className="block text-xl font-black text-cyan-600 dark:text-cyan-400">
                🥇 {team.totalRaceWins ?? 0}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700/80 dark:text-cyan-300">
                Victorias
              </span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-center min-w-24">
              <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400">
                🏎️ {team.totalPodiums ?? 0}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700/80 dark:text-emerald-300">
                Podios
              </span>
            </div>
          </div>
        </div>

        {/* Métricas Secundarias */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/60 text-xs">
          <div className="p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
            <span className="block text-gray-400 font-extrabold uppercase text-[10px]">GPs Disputados</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm">{team.totalRaceStarts ?? team.totalRaceEntries ?? 0}</span>
          </div>

          <div className="p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
            <span className="block text-gray-400 font-extrabold uppercase text-[10px]">Pole Positions</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm">{team.totalPolePositions ?? 0}</span>
          </div>

          <div className="p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
            <span className="block text-gray-400 font-extrabold uppercase text-[10px]">Mejor Carrera</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              {team.bestRaceResult ? `${team.bestRaceResult}º Puesto` : 'N/D'}
            </span>
          </div>

          <div className="p-2.5 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
            <span className="block text-gray-400 font-extrabold uppercase text-[10px]">Mejor Posición</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              {team.bestChampionshipPosition ? `${team.bestChampionshipPosition}º Lugar` : 'N/D'}
            </span>
          </div>
        </div>
      </div>

      {/* Historial Técnico y de Participaciones */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700/60 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">
              Histórico de Participación
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Chasis, motorización, alineaciones y clasificaciones oficiales por motor
            </p>
          </div>
          <span className="text-xs font-bold text-gray-400">
            {uniqueYearsCount} {uniqueYearsCount === 1 ? 'Temporada' : 'Temporadas'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300 border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400">
              <tr>
                <th className="p-3">Año</th>
                <th className="p-3">Chasis</th>
                <th className="p-3">Motor</th>
                <th className="p-3">Pilotos Titulares</th>
                <th className="p-3 text-right">Puntos</th>
                <th className="p-3 text-center">Posición Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 font-medium">
              {seasonHistory.map((s) => (
                <tr key={`${s.year}-${s.engineName}-${s.entrantId || s._id}`} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition">
                  {/* RENDERIZADO CON ROWSPAN PARA EL AÑO */}
                  {s.isFirstForYear && (
                    <td
                      rowSpan={s.totalForYear}
                      className="p-3 font-extrabold text-cyan-600 dark:text-cyan-400 align-top border-r border-gray-100 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-1.5 sticky top-2">
                        {s.year}
                        {s.championshipWon && (
                          <span title="Campeón de Constructores" className="text-xs">🏆</span>
                        )}
                      </div>
                    </td>
                  )}

                  <td className="p-3 font-semibold text-gray-900 dark:text-white">
                    <div>{s.chassisName || 'N/D'}</div>
                    {s.isCustomerEntry && s.entrantName && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                        Equipo Privado: {s.entrantName}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-xs uppercase font-bold text-gray-800 dark:text-gray-200">
                    {s.engineName || 'N/D'}
                  </td>
                  <td className="p-3">
                    {s.drivers && s.drivers.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {s.drivers.map((driver) => (
                          <Link
                            key={driver._id}
                            href={`/drivers/${driver._id}`}
                            className="inline-block px-2 py-0.5 text-[11px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 rounded-md border border-gray-200 dark:border-gray-600 transition"
                          >
                            {driver.fullName}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sin registro</span>
                    )}
                  </td>
                  <td className="p-3 text-right font-bold text-gray-800 dark:text-gray-200">
                    {s.points !== null ? s.points : '-'}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg ${
                        s.championshipWon
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {s.positionText || (s.positionNumber ? `${s.positionNumber}º` : 'N/D')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}