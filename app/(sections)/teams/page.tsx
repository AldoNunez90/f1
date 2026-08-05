import { getTeamsIndex, TeamViewMode, TeamProfileIndex } from '@/lib/db/f1-db';
import { TeamsGrid } from '@/app/components/teams/TeamsGrid';
import { ViewTabs } from '@/app/components/common/ViewTabs';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const revalidate = 3600;

  const teamsTabs = [
  { id: 'active', label: 'Titulares' },
  { id: 'all', label: 'Histórico' },
];

export default async function TeamsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const viewMode: TeamViewMode = params.view === 'all' ? 'all' : 'active';

  // Obtener la lista de escuderías desde la DB en el servidor
  const teams: TeamProfileIndex[] = await getTeamsIndex(viewMode);

  return (
    <div className="space-y-6">
      {/* Header y Control de Vistas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {viewMode === 'active' ? 'Equipos Actuales' : 'Histórico de Escuderías'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Mostrando <span className="font-bold text-cyan-700 dark:text-cyan-400">{teams.length}</span> escuderías
          </p>
        </div>

        {/* Botones de Filtro */}
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex items-center border border-gray-200 dark:border-gray-700 self-start sm:self-auto">
          <ViewTabs
                   tabs={teamsTabs}
                   currentView={viewMode}
                   basePath="/teams"
                 />
        </div>
      </div>

      {/* Grid Interactivo con Buscador en Tiempo Real */}
      <TeamsGrid initialTeams={teams} />
    </div>
  );
}