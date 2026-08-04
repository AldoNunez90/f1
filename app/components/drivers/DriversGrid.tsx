'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { DriverCard } from '@/app/components/cards/DriverCard';
import { EmptyState } from '@/app/components/common/Error';

export interface DriverProfileIndex {
  _id: string;
  name?: string;
  surname?: string;
  fullName?: string;
  permanentNumber?: number;
  countryId?: string;
  imageUrl?: string;
  alpha2Code?: string;
  stats?: {
    wins?: number;
    podiums?: number;
    poles?: number;
    championships?: number;
    fastestLaps?: number;
  };
  teamsHistory?: Array<{
    year: number;
    entrantId?: string;
    constructorId?: string;
  }>;
}

interface DriversGridProps {
  initialDrivers: DriverProfileIndex[];
}

function extractSurname(name?: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  const firstSpaceIndex = trimmed.indexOf(' ');
  return firstSpaceIndex !== -1 ? trimmed.slice(firstSpaceIndex + 1).trim() : trimmed;
}

export function DriversGrid({ initialDrivers }: DriversGridProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado reactivo en cliente por nombre, apellido, país o número
  const filteredDrivers = useMemo(() => {
    if (!searchTerm.trim()) return initialDrivers;

    const query = searchTerm.toLowerCase();

    return initialDrivers.filter((driver) => {
      const name = (driver.name || '').toLowerCase();
      const surname = (driver.surname || '').toLowerCase();
      const fullName = (driver.fullName || '').toLowerCase();
      const country = (driver.countryId || '').toLowerCase();
      const number = driver.permanentNumber ? String(driver.permanentNumber) : '';

      return (
        name.includes(query) ||
        surname.includes(query) ||
        fullName.includes(query) ||
        country.includes(query) ||
        number.includes(query)
      );
    });
  }, [initialDrivers, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Input de Búsqueda en Tiempo Real */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar piloto por nombre, apellido, número..."
          className="w-full px-4 py-2.5 pl-10 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition"
        />
        <span className="absolute left-3.5 top-3 text-sm text-gray-400 pointer-events-none">
          🔍
        </span>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Grid de Pilotos o Estado Vacío */}
      {filteredDrivers.length === 0 ? (
        <EmptyState
          title={searchTerm ? 'Sin resultados' : 'Sin pilotos encontrados'}
          description={
            searchTerm
              ? `No se encontraron pilotos que coincidan con "${searchTerm}".`
              : 'No se encontraron pilotos para los filtros seleccionados.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDrivers.map((driver) => {
            const driverName = driver.name || driver.fullName || '';
            const surname = extractSurname(driverName);
            const teamRecent = driver.teamsHistory?.slice(-1)[0];
            const teamName = teamRecent?.constructorId || teamRecent?.entrantId;

            return (
              <Link
                key={driver._id}
                href={`/drivers/${driver._id}`}
                className="block transition-transform hover:-translate-y-1 h-full"
              >
                <DriverCard
                  id={driver._id}
                  fullName={driverName || ''}
                  surname={surname || ''}
                  countryId={driver.countryId || ''}
                  alpha2Code={driver.alpha2Code}
                  teamName={teamName || ''}
                  wins={driver.stats?.wins || 0}
                  championships={driver.stats?.championships || 0}
                  podiums={driver.stats?.podiums || 0}
                  fastestLaps={driver.stats?.fastestLaps}
                  poles={driver.stats?.poles}
                  permanentNumber={driver.permanentNumber}
                  imageUrl={driver.imageUrl}
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}