import Link from 'next/link';
import { getChronologyByParent } from '@/lib/db/chronology';

interface Props {
  parentConstructorId: string;
  teamName?: string;
}

export async function ConstructorChronologyBanner({
  parentConstructorId,
  teamName,
}: Props) {
  // Busca el árbol genealogico completo (soporta IDs de padres como "alpine" o hijos como "benetton")
  const history = await getChronologyByParent(parentConstructorId);

  // Si no hay historial o solo tiene 1 era (sin transformaciones), no se muestra
  if (!history || history.length <= 1) return null;

  const realParentId = history[0].parentConstructorId;
  const startYear = history[0].yearFrom;
  const eraCount = history.length;
  const displayName = teamName || parentConstructorId;

  return (
    <div className="bg-linear-to-r from-gray-900 via-slate-900 to-cyan-950 p-6 md:p-8 rounded-2xl border border-cyan-500/30 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden group">
      <div className="space-y-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded-md border border-cyan-500/30">
            Árbol Genealógico
          </span>
          <span className="text-xs font-bold text-gray-400">
            {eraCount} Transformaciones desde {startYear}
          </span>
        </div>

        <h3 className="text-xl md:text-2xl font-black tracking-tight text-white capitalize">
          Linaje Histórico de {displayName.replace(/-/g, ' ')}
        </h3>

        <p className="text-xs md:text-sm text-gray-300 max-w-2xl">
          Conoce todas las identidades que adoptó esta estructura en la F1: desde{' '}
          <strong className="text-cyan-400 capitalize">{history[0].constructorId}</strong> en {startYear} hasta su etapa actual.
        </p>
      </div>

      <Link
        href={`/teams/chronology?parent=${realParentId}`}
        className="relative z-10 px-6 py-3 text-xs font-black uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/25 whitespace-nowrap self-stretch md:self-auto text-center"
      >
        Explorar Linaje ➔
      </Link>
    </div>
  );
}