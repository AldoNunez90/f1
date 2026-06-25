'use client';

import { useF1Data } from '@/lib/hooks/useF1Data';
import { DriverCard } from '@/app/components/cards/DriverCard';
import { LoadingGrid } from '@/app/components/common/Loading';
import { ErrorMessage, EmptyState } from '@/app/components/common/Error';
import { useState } from 'react';

interface Driver {
  driver_number?: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  country_code?: string;
  team_name?: string;
  headshot_url?: string;
}

export default function DriversPage() {
  const [ order, setOrder ] = useState('number'); 

  const { data, loading, error, refetch } = useF1Data({
    endpoint: 'drivers',
    queryParams: { session_key: "latest" }, 
    refetchInterval: 0, // Desactivar actualización automática: se carga una vez y queda fija
  });

  if (loading) return <LoadingGrid />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;
if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
    
  const drivers = Array.isArray(data) ? data : [];

  if (drivers.length === 0) {
    return <EmptyState title="Sin pilotos" description="No hay datos de pilotos disponibles" />;
  }

  const sortedDrivers = [...drivers].sort((a, b) => {
    if (order === 'number') {
      return (a.driver_number || 0) - (b.driver_number || 0); 
    } else if (order === 'name') {
      const nameA = `${a.last_name}`.trim();
      const nameB = `${b.last_name}`.trim();
      return nameA.localeCompare(nameB);
    } else if (order === 'team') {
      const teamA = a.team_name || '';
      const teamB = b.team_name || '';
      return teamA.localeCompare(teamB);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            👨‍🚗 Pilotos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Total de pilotos: <span className="font-bold text-red-600">{drivers.length}</span>
          </p>
        </div>
      <div className="flex items-center gap-4">
        <p>Ordenar por:</p>
        <select name="pilotsOrder" id="pilotsOrder"  className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-gray-700 transition" onChange={(e) => setOrder(e.target.value)} value={order}>
          <option value="number">Número</option>
          <option value="name">Apellido</option>
          <option value="team">Equipo</option>
        </select>
      </div>
          
      </div>

      {/* Grid de Pilotos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedDrivers.map((driver: Driver, idx: number) => (
          <DriverCard key={idx} {...driver} />
        ))}
      </div>
    </div>
  );
}
