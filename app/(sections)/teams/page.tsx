'use client';

import { useF1Data } from '@/lib/hooks/useF1Data';
import { TeamCard } from '@/app/components/cards/TeamCard';
import { LoadingGrid } from '@/app/components/common/Loading';
import { ErrorMessage, EmptyState } from '@/app/components/common/Error';
import { useEffect } from 'react';

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

const driversConfig = {
  endpoint: 'drivers',
  queryParams: { session_key: 'latest' }, 
}

export default function TeamsPage() {
  const { data, loading, error, refetch } = useF1Data(driversConfig);

  // OPTIMIZACIÓN RENDIMIENTO Y PROCESOS DE REACT:
  // Controlamos de forma segura el scroll al tope solo cuando la petición de carga finaliza con éxito.
  useEffect(() => {
    if (!loading && !error) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [loading, error]);

  if (loading) return <LoadingGrid />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;
    
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Equipos
          </h1>
          {/* OPTIMIZACIÓN DE ACCESIBILIDAD (CONTRASTE WCAG):
              Cambiamos text-cyan-600 a text-cyan-700 en modo claro para que cumpla con las normas de contraste sobre fondos blancos/claros */}
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Total de equipos: <span className="font-bold text-cyan-700 dark:text-cyan-400">{teams.length}</span>
          </p>
        </div>
      </div>

      {/* Grid de Equipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team: TeamData) => (
          <TeamCard
            key={team.name} // OPTIMIZACIÓN DE RENDERIZADO: Usamos el nombre único del equipo como key persistente en lugar del index del mapeo
            name={team.name}
            drivers={team.drivers}
          />
        ))}
      </div>
    </div>
  );
}