import { getAllDriversIndex, DriverViewMode } from '@/lib/db/f1-db';
import { OrderSelector } from '@/app/components/common/OrderSelector';
import { CountrySelector } from '@/app/components/common/CountrySelector';
import { DriversGrid, DriverProfileIndex } from '@/app/components/drivers/DriversGrid';
import { ViewTabs } from '@/app/components/common/ViewTabs';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DriversPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawViewMode = (params.view as string) || 'current';

  const viewMode: DriverViewMode =
    rawViewMode === 'rookies'
      ? 'rookies'
      : rawViewMode === 'all'
      ? 'all'
      : 'active';

  const currentOrder = (params.order as string) || 'wins';
  const currentCountry = (params.country as string) || 'all';

  // 1. Obtener datos desde la base de datos
  const rawDrivers = await getAllDriversIndex(viewMode);
  const allDrivers = (rawDrivers as unknown as DriverProfileIndex[]) || [];

  // 2. Mapear la lista única de países disponibles en el conjunto actual para el Selector
  const availableCountriesMap = new Map<string, string>();
  allDrivers.forEach((d) => {
    if (d.countryId) {
      const formattedName = d.countryId
        .replace(/-/g, ' ')
        .replace(/^./, (str) => str.toUpperCase());
      availableCountriesMap.set(d.countryId, formattedName);
    }
  });

  const countryOptions = Array.from(availableCountriesMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // 3. Filtrar por país si hay uno seleccionado
  const filteredDrivers = allDrivers.filter((driver) => {
    if (currentCountry === 'all') return true;
    return driver.countryId === currentCountry;
  });

  // 4. Ordenar en el servidor
  const sortedDrivers = [...filteredDrivers].sort((a, b) => {
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

  const pageTitles: Record<DriverViewMode, string> = {
    active: 'Pilotos Titulares 2026',
    rookies: 'Prácticas / Rookies 2026',
    all: 'Histórico de Pilotos de F1',
  };

  const driverTabs = [
  { id: 'current', label: 'Titulares' },
  { id: 'rookies', label: 'Rookies / FP1' },
  { id: 'all', label: 'Histórico' },
];


  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {pageTitles[viewMode]}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Mostrando{' '}
            <span className="font-bold text-cyan-700 dark:text-cyan-400">
              {sortedDrivers.length}
            </span>{' '}
            pilotos
          </p>
        </div>

        {/* Filtros y Vistas */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex items-center border border-gray-200 dark:border-gray-700">
           <ViewTabs
          tabs={driverTabs}
          currentView={rawViewMode}
          basePath="/drivers"
        />
          </div>

          {/* Formulario que agrupa ambos selectores de envío rápido */}
          <form method="GET" className="flex items-center gap-2">
            <input type="hidden" name="view" value={rawViewMode} />

            {/* Selector de País */}
            <CountrySelector
              currentCountry={currentCountry}
              countries={countryOptions}
            />

            {/* Selector de Orden */}
            <OrderSelector currentOrder={currentOrder} />
          </form>
        </div>
      </div>

      {/* Grid Interactivo con Input de Búsqueda */}
      <DriversGrid initialDrivers={sortedDrivers} />
      
    </div>
  );
}