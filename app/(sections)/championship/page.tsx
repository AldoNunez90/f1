'use client';

import { useState, useEffect } from 'react';
import { useF1Data } from '@/lib/hooks/useF1Data';
import { LoadingGrid } from '@/app/components/common/Loading';
import { ErrorMessage } from '@/app/components/common/Error';

interface ChampionshipEntry {
  meeting_key: number;
  points_current: number;
  points_start: number;
  position_current: number;
  position_start: number;
  session_key: string;
  team_name?: string;
  driver_number?: number;
}

interface Driver {
  driver_number?: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
}

const championshipTeamsConfig = {
  endpoint: 'championship_teams',
  queryParams: { session_key: 'latest' },
}

const championshipDriversConfig = {
  endpoint: 'championship_drivers',
  queryParams: { session_key: 'latest' },
}

const driversConfig = {
  endpoint: 'drivers',
  queryParams: { session_key: 'latest' },
  refetchInterval: 0,
}

export default function ChampionshipPage() {
  const [showedChampionship, setShowedChampionship] = useState<'drivers' | 'teams'>('drivers');

  const { data: teamData, loading: teamLoading, error: teamError, refetch: refetchTeams } = useF1Data<ChampionshipEntry[]>(championshipTeamsConfig);
  const { data: championshipDriversData, loading: championshipDriversLoading, error: championshipDriversError, refetch: refetchDriversChampionship } = useF1Data<ChampionshipEntry[]>(championshipDriversConfig);
  const { data: driversData, loading: driversLoading, error: driversError } = useF1Data<Driver[]>(driversConfig);

  // OPTIMIZACIÓN RENDIMIENTO Y PROCESOS DE REACT:
  // Controlamos de forma segura el scroll al tope solo cuando finaliza con éxito la carga de las APIs de campeonato.
  useEffect(() => {
    if (!teamLoading && !championshipDriversLoading && !driversLoading && !teamError && !championshipDriversError && !driversError) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [teamLoading, championshipDriversLoading, driversLoading, teamError, championshipDriversError, driversError]);

  if (teamLoading || championshipDriversLoading || driversLoading) return <LoadingGrid />;
  if (teamError) return <ErrorMessage message={teamError.message} onRetry={refetchTeams} />;
  if (championshipDriversError) return <ErrorMessage message={championshipDriversError.message} onRetry={refetchDriversChampionship} />;
  if (driversError) return <ErrorMessage message={driversError.message} />;

  const teamChampionship = Array.isArray(teamData) ? [...teamData].sort((a, b) => (a.position_current ?? 0) - (b.position_current ?? 0)) : [];
  const driverChampionship = Array.isArray(championshipDriversData) ? [...championshipDriversData].sort((a, b) => (a.position_current ?? 0) - (b.position_current ?? 0)) : [];
  const drivers = Array.isArray(driversData) ? driversData : [];

  const driverNameByNumber = new Map<number, string>();
  drivers.forEach((driver) => {
    if (typeof driver.driver_number === 'number') {
      const name = driver.full_name || [driver.first_name, driver.last_name].filter(Boolean).join(' ');
      driverNameByNumber.set(driver.driver_number, name || 'Desconocido');
    }
  });

  const hasNoData = showedChampionship === 'drivers' ? driverChampionship.length === 0 : teamChampionship.length === 0;

  return (
    <div className="space-y-6 px-4 sm:px-0">
      {/* Cabecera Adaptable */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
            🏁 Campeonatos
          </h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto" role="group" aria-label="Filtro de campeonatos">
          <button
            onClick={() => setShowedChampionship('drivers')}
            className={`flex-1 sm:flex-none text-center px-5 py-2.5 rounded-lg transition-all shadow-sm font-semibold text-sm ${showedChampionship === 'drivers' ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 hover:bg-cyan-600 hover:text-white'}`}
          >
            Pilotos
          </button>
          <button
            onClick={() => setShowedChampionship('teams')}
            className={`flex-1 sm:flex-none text-center px-5 py-2.5 rounded-lg transition-all shadow-sm font-semibold text-sm ${showedChampionship === 'teams' ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 hover:bg-cyan-600 hover:text-white'}`}
          >
            Equipos
          </button>
        </div>
      </header>

      {/* Contenedor Principal con reserva de altura mínima (ELIMINA EL CLS) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden min-h-125">
        {hasNoData ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {showedChampionship === 'drivers'
              ? 'No hay datos de campeonato de pilotos disponibles.'
              : 'No hay datos de campeonato de equipos disponibles.'}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            {/* Se define un padding interno uniforme y se optimiza la vista tipo 'pitboard' de pista */}
            <div className="bg-black p-3 sm:p-6 rounded-2xl border-4 sm:border-8 border-zinc-950 shadow-2xl min-w-150 font-mono">
              <table className="w-full text-cyan-400 border-separate" style={{ borderSpacing: '0 8px' }}>
                <thead>
                  <tr className="text-zinc-500 text-xs tracking-widest uppercase">
                    {/* OPTIMIZACIÓN ACCESIBILIDAD: Se agrega scope="col" a todas las cabeceras th */}
                    <th scope="col" className="pb-1 text-center pl-2 w-[10%]">Pos</th>
                    <th scope="col" className="pb-1 text-left pl-4 w-[50%]">{showedChampionship === 'drivers' ? 'Piloto' : 'Equipo'}</th>
                    <th scope="col" className="pb-1 text-right pr-4 w-[20%]">Pts</th>
                    <th scope="col" className="pb-1 text-right pr-4 w-[20%]">Sumados</th>
                  </tr>
                </thead>
                <tbody>
                  {showedChampionship === 'drivers'
                    ? driverChampionship.map((driver) => {
                        const pointsSumados = driver.points_current - driver.points_start;
                        const driverNumber = driver.driver_number ?? 0;
                        return (
                          <tr key={`driver-${driverNumber}`} className="bg-zinc-900 text-lg sm:text-2xl md:text-3xl uppercase font-bold tracking-wider transition-colors hover:bg-zinc-800/80">
                            {/* OPTIMIZACIÓN ACCESIBILIDAD SEMÁNTICA: scope="row" en el identificador */}
                            <td className="py-2 sm:py-3 text-center rounded-l-xl border-y-2 border-l-2 border-zinc-950 text-white bg-zinc-950/40 font-black">{driver.position_current}</td>
                            <td className="py-2 sm:py-3 pl-4 border-y-2 border-zinc-950 truncate max-w-70">
                              {driverNameByNumber.get(driverNumber) || 'Desconocido'}
                            </td>
                            <td className="py-2 sm:py-3 pr-4 border-y-2 border-zinc-950 text-right text-white">{driver.points_current}</td>
                            <td className="py-2 sm:py-3 pr-4 rounded-r-xl border-y-2 border-r-2 border-zinc-950 text-right text-emerald-400">
                              {pointsSumados > 0 ? `+${pointsSumados}` : pointsSumados}
                            </td>
                          </tr>
                        );
                      })
                    : teamChampionship.map((team) => {
                        const pointsSumados = team.points_current - team.points_start;
                        const teamKey = team.team_name?.replace(/\s+/g, '-').toLowerCase() || team.position_current;
                        return (
                          <tr key={`team-${teamKey}`} className="bg-zinc-900 text-lg sm:text-2xl md:text-3xl uppercase font-bold tracking-wider transition-colors hover:bg-zinc-800/80">
                            <td className="py-2 sm:py-3 text-center rounded-l-xl border-y-2 border-l-2 border-zinc-950 text-white bg-zinc-950/40 font-black">{team.position_current}</td>
                            <td className="py-2 sm:py-3 pl-4 border-y-2 border-zinc-950 truncate max-w-70">{team.team_name}</td>
                            <td className="py-2 sm:py-3 pr-4 border-y-2 border-zinc-950 text-right text-white">{team.points_current}</td>
                            <td className="py-2 sm:py-3 pr-4 rounded-r-xl border-y-2 border-r-2 border-zinc-950 text-right text-emerald-400">
                              {pointsSumados > 0 ? `+${pointsSumados}` : pointsSumados}
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}