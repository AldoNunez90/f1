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

  useEffect(()=>{
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  })

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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">🏁 Campeonatos</h1>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setShowedChampionship('drivers')}
            className={`px-4 py-2 rounded-md transition-all shadow-sm ${showedChampionship === 'drivers' ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white hover:bg-cyan-600 hover:text-white'}`}>
            Pilotos
          </button>
          <button
            onClick={() => setShowedChampionship('teams')}
            className={`px-4 py-2 rounded-md transition-all shadow-sm ${showedChampionship === 'teams' ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white hover:bg-cyan-600 hover:text-white'}`}
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
          <div className="bg-black p-4 sm:p-6 rounded-3xl border-8 border-zinc-900 shadow-2xl shadow-cyan-900/20 w-full  font-mono">

            <table className="w-full text-cyan-400 border-separate" style={{ borderSpacing: '0 12px' }}>
              <thead>
            <tr className="text-zinc-500 text-xs md:text-sm tracking-widest uppercase">
              <th className="pb-2 text-center pl-4 w-1/8">Pos</th>
              <th className="pb-2 text-center w-1/2">{showedChampionship === 'drivers' ? 'Piloto' : 'Equipo'}</th>
              <th className="pb-2 text-center pr-4 w-1/5">Pts</th>
              <th className="px-6 py-4 text-center w-1/5">Puntos sumados</th>
            </tr>
          </thead>
              <tbody>
                {showedChampionship === 'drivers'
                  ? driverChampionship.map((driver) => {
                      const pointsSumados = driver.points_current - driver.points_start;
                      const driverNumber = driver.driver_number ?? 0;
                      return (
                        <tr key={driverNumber} className="bg-zinc-900 text-2xl md:text-4xl uppercase font-bold tracking-widest shadow-inner transition-colors hover:bg-zinc-800">
                          <td className="py-4 pr-4 rounded-xl border-y-4 border-x-4 border-black text-center">{driver.position_current}</td>
                          <td className="py-4 pr-4 pl-4 rounded-xl border-y-4 border-x-4 border-black">
                            {driverNameByNumber.get(driverNumber) || 'Desconocido'}
                          </td>
                          <td className="py-4 pr-4 rounded-xl border-y-4 border-x-4 border-black text-right">{driver.points_current}</td>
                          <td className="py-4 pr-4 rounded-xl border-y-4 border-l-4 border-black text-right">{pointsSumados}</td>
                        </tr>
                      );
                    })
                  : teamChampionship.map((team) => {
                      const pointsSumados = team.points_current - team.points_start;
                      return (
                        <tr key={team.position_current} className="bg-zinc-900 text-2xl md:text-4xl uppercase font-bold tracking-widest shadow-inner transition-colors hover:bg-zinc-800">
                          <td className="py-4 pr-4 rounded-xl border-y-4 border-x-4 border-black text-center">{team.position_current}</td>
                          <td className="py-4 pr-4 pl-4 rounded-xl border-y-4 border-x-4 border-black">{team.team_name}</td>
                          <td className="py-4 pr-4 rounded-xl border-y-4 border-x-4 border-black text-right">{team.points_current}</td>
                          <td className="py-4 pr-4 rounded-xl border-y-4 border-l-4 border-black text-right">{pointsSumados}</td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
