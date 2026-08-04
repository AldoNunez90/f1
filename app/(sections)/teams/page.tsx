import Link from 'next/link';
import { getTeamsIndex, TeamViewMode, TeamProfileIndex } from '@/lib/f1-db';
import { TeamCard } from '@/app/components/cards/TeamCard';
import { EmptyState } from '@/app/components/common/Error';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const revalidate = 3600;

export default async function TeamsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const viewMode: TeamViewMode = params.view === 'all' ? 'all' : 'active';

  // 💡 Simplemente await directo, ya que getTeamsIndex devuelve directamente la Promise
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
          <Link
            href="/teams?view=active"
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              viewMode === 'active'
                ? 'bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Parrilla Actual
          </Link>
          <Link
            href="/teams?view=all"
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              viewMode === 'all'
                ? 'bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400 shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Histórico Completo
          </Link>
        </div>
      </div>

      {/* Grid de Equipos */}
      {teams.length === 0 ? (
        <EmptyState
          title="Sin escuderías"
          description="No se encontraron constructores registrados en la base de datos."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
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