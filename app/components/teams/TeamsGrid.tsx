'use client';

import { useState, useMemo, useTransition } from 'react';
import { TeamProfileIndex } from '@/lib/f1-db';
import { TeamCard } from '@/app/components/cards/TeamCard';
import { EmptyState } from '@/app/components/common/Error';
import { GridLoadingOverlay } from '@/app/components/common/GridLoadingOverlay';

interface TeamsGridProps {
  initialTeams: TeamProfileIndex[];
}

export function TeamsGrid({ initialTeams }: TeamsGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSearchChange = (value: string) => {
    // 💡 Forzamos que la UI responda al instante mostrando el estado de carga
    startTransition(() => {
      setSearchTerm(value);
    });
  };

  const filteredTeams = useMemo(() => {
    if (!searchTerm.trim()) return initialTeams;

    const query = searchTerm.toLowerCase();

    return initialTeams.filter((team) => {
      const name = (team.name || '').toLowerCase();
      const fullName = (team.fullName || '').toLowerCase();
      const country = (team.countryId || '').toLowerCase();
      const chassis = (team.chassisName || '').toLowerCase();

      return (
        name.includes(query) ||
        fullName.includes(query) ||
        country.includes(query) ||
        chassis.includes(query)
      );
    });
  }, [initialTeams, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <input
          type="text"
          defaultValue={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar escudería por nombre, motor, chasis..."
          className="w-full px-4 py-2.5 pl-10 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition"
        />
        <span className="absolute left-3.5 top-3 text-sm text-gray-400 pointer-events-none">
          🔍
        </span>
        {isPending && (
          <span className="absolute right-3.5 top-3 text-xs text-cyan-500 font-bold animate-pulse">
            Cargando...
          </span>
        )}
      </div>

      {/* Si React está procesando el renderizado de la grilla pesada, muestra el Loader */}
      {isPending ? (
        <GridLoadingOverlay />
      ) : filteredTeams.length === 0 ? (
        <EmptyState
          title={searchTerm ? 'Sin resultados' : 'Sin escuderías'}
          description={
            searchTerm
              ? `No se encontraron escuderías para "${searchTerm}".`
              : 'No se encontraron constructores registrados.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team._id}
              _id={team._id}
              name={team.name}
              fullName={team.fullName}
              countryId={team.countryId}
              alpha2Code={team.alpha2Code}
              teamColour={team.teamColour}
              chassisName={team.chassisName}
              engineName={team.engineName}
              stats={team.stats}
              drivers={team.drivers}
            />
          ))}
        </div>
      )}
    </div>
  );
}