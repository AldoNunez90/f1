'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConstructorChronology } from '@/app/components/asssets/rail';
import { ChronologyDocument } from '@/lib/db/chronology';

interface Props {
  groupedChronologies: Record<string, ChronologyDocument[]>;
  initialParent?: string;
}

export function ChronologyClientView({
  groupedChronologies,
  initialParent,
}: Props) {
  const router = useRouter();
  const parentKeys = Object.keys(groupedChronologies);

  const [selectedParent, setSelectedParent] = useState<string>(
    initialParent && groupedChronologies[initialParent]
      ? initialParent
      : parentKeys[0] || ''
  );

  const activeHistory = groupedChronologies[selectedParent] || [];
  
  // Obtenemos la última era (escudería actual o más reciente) para la navegación
  const currentEraConstructorId =
    activeHistory[activeHistory.length - 1]?.constructorId || selectedParent;

  // Si vino con un 'initialParent' en la URL, significa que entró a través del Banner
  const cameFromBanner = Boolean(initialParent);

  return (
    <div className="space-y-8">
      {/* Barra de Acciones y Navegación Condicional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {cameFromBanner ? (
          /* OPCIÓN A: Si vino del Banner -> Botón de retorno al detalle anterior */
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition cursor-pointer self-start"
          >
            <span className="text-sm">←</span> Volver a la Ficha del Equipo
          </button>
        ) : (
          /* OPCIÓN B: Si vino de la Navbar -> Acceso directo al detalle del equipo seleccionado */
          <Link
            href={`/teams/${currentEraConstructorId}`}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400 hover:underline self-start"
          >
            <span>Ver Ficha Completa de {currentEraConstructorId.replace(/-/g, ' ')}</span>
            <span>→</span>
          </Link>
        )}
      </div>

      {/* Selector / Map de Escuderías Principales */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-200 dark:border-gray-700/60">
        <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">
          Seleccionar Linaje de Fábrica / Estructura:
        </h2>

        <div className="flex flex-wrap gap-2">
          {parentKeys.map((parentKey) => {
            const isSelected = parentKey === selectedParent;
            const items = groupedChronologies[parentKey];
            const currentEra = items[items.length - 1]?.constructorId;

            return (
              <button
                key={parentKey}
                onClick={() => setSelectedParent(parentKey)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow-md shadow-cyan-500/20 scale-105'
                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <span className="capitalize">{parentKey.replace(/-/g, ' ')}</span>
                {currentEra && currentEra !== parentKey && (
                  <span
                    className={`text-[10px] opacity-75 font-normal px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-gray-950/20 text-gray-950'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    ({currentEra})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Visualización de la Cronología Seleccionada */}
      {activeHistory.length > 0 ? (
        <ConstructorChronology history={activeHistory} />
      ) : (
        <div className="p-12 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          No se encontraron datos de cronología para esta escudería.
        </div>
      )}
    </div>
  );
}