import { getAllDriversIndex, DriverViewMode } from '@/lib/f1-db';
import { DriverCard } from '@/app/components/cards/DriverCard';
import { EmptyState } from '@/app/components/common/Error';
import { OrderSelector } from '@/app/components/common/OrderSelector';
import Link from 'next/link';

interface DriverProfileIndex {
  _id: string;
  name?: string;
  surname?: string;
  fullName?: string;
  permanentNumber?: number;
  countryId?: string;
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

interface PageProps {
  searchParams: Promise<{ order?: string; view?: string }>;
}

export default async function DriversPage({ searchParams }: PageProps) {
  const params = await searchParams;
  // Mapeamos los modos: 'current' (active), 'rookies', 'all'
  const rawViewMode = params.view || 'current';
  
  // Normalizamos para pasarle el tipo esperado por la función de DB
  const viewMode: DriverViewMode = 
    rawViewMode === 'rookies' ? 'rookies' : 
    rawViewMode === 'all' ? 'all' : 'active';

  const currentOrder = params.order || 'wins';

  // Consultamos a la base de datos pasándole el modo exacto
  const rawDrivers = await getAllDriversIndex(viewMode);

  const drivers = (rawDrivers as unknown as DriverProfileIndex[]) || [];

  // Título dinámico según la vista seleccionada
  const pageTitles: Record<DriverViewMode, string> = {
    active: 'Pilotos Titulares 2026',
    rookies: 'Prácticas / Rookies 2026',
    all: 'Histórico de Pilotos de F1',
  };

  if (drivers.length === 0) {
    return (
      <EmptyState 
        title="Sin pilotos encontrados" 
        description="No se encontraron pilotos para los filtros seleccionados." 
      />
    );
  }

  function extractSurname(name?: string): string {
    if (!name) return '';
    
    const trimmed = name.trim();
    const firstSpaceIndex = trimmed.indexOf(' ');

    if (firstSpaceIndex !== -1) {
      return trimmed.slice(firstSpaceIndex + 1).trim();
    }

    return trimmed;
  }

  // Ordenamiento en el servidor
  const sortedDrivers = [...drivers].sort((a, b) => {
    const statsA = a.stats || {};
    const statsB = b.stats || {};

    if (currentOrder === 'wins') {
      return (statsB.wins || 0) - (statsA.wins || 0);
    } else if (currentOrder === 'titles') {
      return (statsB.championships || 0) - (statsA.championships || 0);
    } else if (currentOrder === 'podiums') {
      return (statsB.podiums || 0) - (statsA.podiums || 0);
    } else if (currentOrder === 'name') {
      const nameA = a.surname || a.name || '';
      const nameB = b.surname || b.name || '';
      return nameA.localeCompare(nameB);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header y Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {pageTitles[viewMode]}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Mostrando <span className="font-bold text-cyan-700 dark:text-cyan-400">{drivers.length}</span> pilotos
          </p>
        </div>

        {/* Selector de Vistas y Orden */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex items-center border border-gray-200 dark:border-gray-700">
            <Link
              href="/drivers?view=current"
              className={`px-3 py-2 text-xs font-bold rounded-lg transition ${
                viewMode === 'active' 
                  ? 'bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400 shadow-xs' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Titulares
            </Link>
            <Link
              href="/drivers?view=rookies"
              className={`px-3 py-2 text-xs font-bold rounded-lg transition ${
                viewMode === 'rookies' 
                  ? 'bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400 shadow-xs' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Rookies / FP1
            </Link>
            <Link
              href="/drivers?view=all"
              className={`px-3 py-2 text-xs font-bold rounded-lg transition ${
                viewMode === 'all' 
                  ? 'bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400 shadow-xs' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Histórico
            </Link>
          </div>

          {/* Form con el Client Component del Selector */}
          <form method="GET" className="flex items-center gap-2">
            <input type="hidden" name="view" value={rawViewMode} />
            <OrderSelector currentOrder={currentOrder} />
          </form>
        </div>
      </div>

      {/* Grid de Pilotos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedDrivers.map((driver) => {
          const driverName = driver.name || driver.fullName || '';
          const surname = extractSurname(driverName);

          const teamRecent = driver.teamsHistory?.slice(-1)[0];
          const teamName = teamRecent?.constructorId || teamRecent?.entrantId;

          return (
            <Link key={driver._id} href={`/drivers/${driver._id}`} className="block transition-transform hover:-translate-y-1 h-full">
              <DriverCard 
                id={driver._id}
                fullName={driverName || ''}
                surname={surname || ''}
                countryId={driver.countryId || ''}
                teamName={teamName || ''}
                wins={driver.stats?.wins || 0}
                championships={driver.stats?.championships || 0}
                podiums={driver.stats?.podiums || 0}
                fastestLaps={driver.stats?.fastestLaps}
                poles={driver.stats?.poles}
                permanentNumber={driver.permanentNumber}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}