import { getAllChronologiesGrouped } from '@/lib/db/chronology';
import { ChronologyClientView } from '../../../components/teams/ChronologyClientView';

interface PageProps {
  searchParams: Promise<{ parent?: string }>;
}


export default async function TeamChronologyPage({ searchParams }: PageProps) {
  const { parent } = await searchParams;
  const groupedChronologies = await getAllChronologiesGrouped();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-extrabold border border-cyan-500/20">
          <span>🏎️</span> HISTORIA DE LAS ESCUDERÍAS
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          Evolución de Licencias & Linaje Técnico
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-3xl">
          Explora la historia de las fábricas de Fórmula 1 a través del tiempo. Descubre cómo las estructuras técnicas y licencias han cambiado de nombre y propietarios a lo largo de las décadas.
        </p>
      </div>

      {/* Vista interactiva */}
      <ChronologyClientView
        groupedChronologies={groupedChronologies}
        initialParent={parent}
      />
    </main>
  );
}