'use client';

import { useF1Data } from '@/lib/hooks/useF1Data';
import { TeamCard } from '@/app/components/cards/TeamCard';
import { LoadingGrid } from '@/app/components/common/Loading';
import { ErrorMessage, EmptyState } from '@/app/components/common/Error';

interface Driver {
  first_name?: string;
  last_name?: string;
  country_code?: string;
  team_name?: string;
}

interface TeamData {
  name: string;
  drivers: Driver[];
}

export default function TeamsPage() {
  const { data, loading, error, refetch } = useF1Data({
    endpoint: 'drivers',
    queryParams: { session_key: 'latest' }, 
  });

  if (loading) return <LoadingGrid />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;
  if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
    
  const drivers = Array.isArray(data) ? data : [];

  if (drivers.length === 0) {
    return (
      <EmptyState title="Sin equipos" description="No hay datos de equipos disponibles" />
    );
  }

  // Agrupar pilotos por equipo
  const teamMap = new Map<string, Driver[]>();

  drivers.forEach((driver: Driver) => {
    const team = driver.team_name || 'UNKNOWN';
    if (!teamMap.has(team)) {
      teamMap.set(team, []);
    }
    teamMap.get(team)!.push(driver);
  });

  const teams: TeamData[] = Array.from(teamMap.entries()).map(([name, teamDrivers]) => ({
    name,
    drivers: teamDrivers,
  }));
  console.log(teams);  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            🏢 Equipos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Total de equipos: <span className="font-bold text-red-600">{teams.length}</span>
          </p>
        </div>
      </div>

      {/* Grid de Equipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team: TeamData, idx: number) => (
          <TeamCard
            key={idx}
            name={team.name}
            drivers={team.drivers}
          />
        ))}
      </div>
    </div>
  );
}
