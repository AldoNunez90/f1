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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []); // Se agregó el array de dependencias vacío para que corra solo al montar

  const [showedChampionship, setShowedChampionship] = useState<'drivers' | 'teams'>('drivers');

  const { data: teamData, loading: teamLoading, error: teamError, refetch: refetchTeams } = useF1Data<ChampionshipEntry[]>(championshipTeamsConfig);

  const { data: championshipDriversData, loading: championshipDriversLoading, error: championshipDriversError, refetch: refetchDriversChampionship } = useF1Data<ChampionshipEntry[]>(championshipDriversConfig);

  const { data: driversData, loading: driversLoading, error: driversError } = useF1Data<Driver[]>(driversConfig);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            🏁 Campeonatos
          </h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowedChampionship('drivers')}
            className={`flex-1 sm:flex-none text-center px-4 py-2 rounded-md transition-all shadow-sm font-medium ${showedChampionship === 'drivers' ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white hover:bg-cyan-600 hover:text-white'}`}>
            Pilotos
          </button>
          <button
            onClick={() => setShowedChampionship('teams')}
            className={`flex-1 sm:flex-none text-center px-4 py-2 rounded-md transition-all shadow-sm font-medium ${showedChampionship === 'teams' ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white hover:bg-cyan-600 hover:text-white'}`}
          >
            Equipos
          </button>
        </div>
      </div>

      {/* Contenedor Principal */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {hasNoData ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {showedChampionship === 'drivers'
              ? 'No hay datos de campeonato de pilotos disponibles.'
              : 'No hay datos de campeonato de equipos disponibles.'}
          </div>
        ) : (
          /* El overflow-x-auto se coloca aquí para que el contenedor negro no se rompa */
          <div className="overflow-x-auto w-full">
            <div className="bg-black p-3 sm:p-6 rounded-2xl border-4 sm:border-8 border-zinc-900 shadow-2xl min-w-150 font-mono">
              <table className="w-full text-cyan-400 border-separate" style={{ borderSpacing: '0 8px' }}>
                <thead>
                  <tr className="text-zinc-500 text-xxs sm:text-xs tracking-widest uppercase">
                    <th className="pb-1 text-center pl-2 w-[10%]">Pos</th>
                    <th className="pb-1 text-left pl-4 w-[50%]">{showedChampionship === 'drivers' ? 'Piloto' : 'Equipo'}</th>
                    <th className="pb-1 text-right pr-4 w-[20%]">Pts</th>
                    <th className="pb-1 text-right pr-4 w-[20%]">Sumados</th>
                  </tr>
                </thead>
                <tbody>
                  {showedChampionship === 'drivers'
                    ? driverChampionship.map((driver) => {
                        const pointsSumados = driver.points_current - driver.points_start;
                        const driverNumber = driver.driver_number ?? 0;
                        return (
                          <tr key={driverNumber} className="bg-zinc-900 text-lg sm:text-2xl md:text-3xl uppercase font-bold tracking-wider transition-colors hover:bg-zinc-800">
                            <td className="py-2 sm:py-3 text-center rounded-l-xl border-y-2 border-l-2 border-zinc-950 text-white bg-zinc-950/40">{driver.position_current}</td>
                            <td className="py-2 sm:py-3 pl-4 border-y-2 border-zinc-950 truncate min-w-45 sm:max-w-none">
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
                        return (
                          <tr key={team.position_current} className="bg-zinc-900 text-lg sm:text-2xl md:text-3xl uppercase font-bold tracking-wider transition-colors hover:bg-zinc-800">
                            <td className="py-2 sm:py-3 text-center rounded-l-xl border-y-2 border-l-2 border-zinc-950 text-white bg-zinc-950/40">{team.position_current}</td>
                            <td className="py-2 sm:py-3 pl-4 border-y-2 border-zinc-950 truncate min-w-45 sm:max-w-none">{team.team_name}</td>
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