'use client';

import { useF1Data } from '@/lib/hooks/useF1Data';
import { DriverCard } from '@/app/components/cards/DriverCard';
import { LoadingGrid } from '@/app/components/common/Loading';
import { ErrorMessage, EmptyState } from '@/app/components/common/Error';
import { useState, useEffect } from 'react';

interface Driver {
  driver_number?: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  country_code?: string;
  team_name?: string;
  headshot_url?: string;
}

const driversConfig = {
  endpoint: 'drivers',
  queryParams: { session_key: "latest" }, 
  refetchInterval: 0, // Desactivar actualización automática: se carga una vez y queda fija
}

export default function DriversPage() {
  const [order, setOrder] = useState('number'); 
  const { data, loading, error, refetch } = useF1Data(driversConfig);

  // OPTIMIZACIÓN DE RENDIMIENTO Y RENDERING:
  // Mover el scroll al tope de la página dentro de un useEffect. 
  // Ejecutarlo en el render principal causaba scrolls continuos ante cualquier cambio de estado (como reordenar).
  useEffect(() => {
    if (!loading && !error) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [loading, error]);

  if (loading) return <LoadingGrid />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;
    
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Pilotos
          </h1>
          {/* OPTIMIZACIÓN DE ACCESIBILIDAD (CONTRASTE):
              Cambiamos text-cyan-600 a text-cyan-700 en modo claro para superar el ratio de contraste exigido por Lighthouse */}
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Total de pilotos: <span className="font-bold text-cyan-700 dark:text-cyan-400">{drivers.length}</span>
          </p>
        </div>
        
        {/* OPTIMIZACIÓN DE ACCESIBILIDAD (FORMULARIOS):
            - Cambiamos el <p> por un <label> enlazado mediante 'htmlFor' al id del selector.
            - Esto resuelve directamente la advertencia "Select elements do not have associated label elements" */}
        <div className="flex items-center gap-3">
          <label 
            htmlFor="pilotsOrder" 
            className="text-gray-700 dark:text-gray-300 font-semibold text-sm"
          >
            Ordenar por:
          </label>
          <select 
            name="pilotsOrder" 
            id="pilotsOrder"  
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-semibold rounded-lg shadow-xs focus:ring-2 focus:ring-cyan-500 focus:outline-hidden transition" 
            onChange={(e) => setOrder(e.target.value)} 
            value={order}
          >
            <option value="number">Número</option>
            <option value="name">Apellido</option>
            <option value="team">Equipo</option>
          </select>
        </div>
      </div>

      {/* Grid de Pilotos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedDrivers.map((driver: Driver) => (
          <DriverCard 
            key={driver.driver_number ?? driver.last_name ?? 'fallback'} 
            {...driver} 
          />
        ))}
      </div>
    </div>
  );
}