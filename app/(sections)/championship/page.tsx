'use client';

import { useState } from 'react';
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

export default function ChampionshipPage() {
  const [showedChampionship, setShowedChampionship] = useState<'drivers' | 'teams'>('drivers');

  const { data: teamData, loading: teamLoading, error: teamError, refetch: refetchTeams } = useF1Data<ChampionshipEntry[]>({
    endpoint: 'championship_teams',
    queryParams: { session_key: 'latest' },
  });

  const { data: championshipDriversData, loading: championshipDriversLoading, error: championshipDriversError, refetch: refetchDriversChampionship } = useF1Data<ChampionshipEntry[]>({
    endpoint: 'championship_drivers',
    queryParams: { session_key: 'latest' },
  });

  const { data: driversData, loading: driversLoading, error: driversError } = useF1Data<Driver[]>({
    endpoint: 'drivers',
    queryParams: { session_key: 'latest' },
    refetchInterval: 0,
  });

  if (teamLoading || championshipDriversLoading || driversLoading) return <LoadingGrid />;
  if (teamError) return <ErrorMessage message={teamError.message} onRetry={refetchTeams} />;
  if (championshipDriversError) return <ErrorMessage message={championshipDriversError.message} onRetry={refetchDriversChampionship} />;
  if (driversError) return <ErrorMessage message={driversError.message} />;
  if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
    
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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">🏁 Campeonatos</h1>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setShowedChampionship('drivers')}
            className={`px-4 py-2 rounded-md transition-all shadow-sm ${showedChampionship === 'drivers' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white hover:bg-red-500 hover:text-white'}`}
          >
            Pilotos
          </button>
          <button
            onClick={() => setShowedChampionship('teams')}
            className={`px-4 py-2 rounded-md transition-all shadow-sm ${showedChampionship === 'teams' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white hover:bg-red-500 hover:text-white'}`}
          >
            Equipos
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          {hasNoData ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {showedChampionship === 'drivers'
                ? 'No hay datos de campeonato de pilotos disponibles.'
                : 'No hay datos de campeonato de equipos disponibles.'}
            </div>
          ) : (
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-black text-[10px] uppercase tracking-widest">
                  <th className="px-6 py-4 text-center">Posición</th>
                  <th className="px-6 py-4">{showedChampionship === 'drivers' ? 'Piloto' : 'Equipo'}</th>
                  <th className="px-6 py-4 text-right">Puntos</th>
                  <th className="px-6 py-4 text-right">Puntos sumados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {showedChampionship === 'drivers'
                  ? driverChampionship.map((driver) => {
                      const pointsSumados = driver.points_current - driver.points_start;
                      const driverNumber = driver.driver_number ?? 0;
                      return (
                        <tr key={driverNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4 text-center font-black text-gray-900 dark:text-white">{driver.position_current}</td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">
                            {driverNameByNumber.get(driverNumber) || 'Desconocido'}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{driver.points_current}</td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{pointsSumados}</td>
                        </tr>
                      );
                    })
                  : teamChampionship.map((team) => {
                      const pointsSumados = team.points_current - team.points_start;
                      return (
                        <tr key={team.position_current} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4 text-center font-black text-gray-900 dark:text-white">{team.position_current}</td>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">{team.team_name}</td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{team.points_current}</td>
                          <td className="px-6 py-4 text-right text-gray-900 dark:text-white">{pointsSumados}</td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
