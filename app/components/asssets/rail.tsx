'use client';

import { useMemo } from 'react';

export interface ChronologyItem {
  _id: { $oid: string } | string;
  parentConstructorId: string;
  positionDisplayOrder: number;
  constructorId: string;
  yearFrom: number;
  yearTo: number | null | { $numberDouble: string } | typeof NaN;
}

interface Props {
  history: ChronologyItem[];
  currentYear?: number;
}

export function parseYearTo(yearTo: ChronologyItem['yearTo']): number | null {
  if (yearTo === null || yearTo === undefined) return null;
  if (typeof yearTo === 'number') {
    return Number.isNaN(yearTo) ? null : yearTo;
  }
  if (typeof yearTo === 'object' && '$numberDouble' in yearTo) {
    return yearTo.$numberDouble === 'NaN' ? null : Number(yearTo.$numberDouble);
  }
  return null;
}

export function ConstructorChronology({ history, currentYear = 2026 }: Props) {
  const parsedHistory = useMemo(() => {
    if (!history || history.length === 0) return [];

    const sorted = [...history].sort(
      (a, b) => a.positionDisplayOrder - b.positionDisplayOrder
    );

    return sorted.map((item) => {
      const yearToParsed = parseYearTo(item.yearTo);
      const isCurrent = yearToParsed === null;
      const endYear = yearToParsed ?? currentYear;
      const duration = endYear - item.yearFrom + 1;

      return {
        ...item,
        yearToParsed,
        endYear,
        duration,
        isCurrent,
        idStr: typeof item._id === 'string' ? item._id : item._id.$oid,
      };
    });
  }, [history, currentYear]);

  if (parsedHistory.length === 0) return null;

  const startYear = parsedHistory[0].yearFrom;
  const endYear = parsedHistory[parsedHistory.length - 1].endYear;
  const totalDuration = endYear - startYear + 1;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl border border-gray-200 dark:border-gray-700/60 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-4">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>🏁</span> Linaje e Identidad Histórica
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Evolución de licencias y nombres de chasis desde {startYear} hasta la actualidad
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 text-xs font-black rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            {totalDuration} Años en F1
          </span>
          <span className="px-3 py-1 text-xs font-black rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            {parsedHistory.length} {parsedHistory.length === 1 ? 'Era' : 'Eras'}
          </span>
        </div>
      </div>

      {/* 1. Barra del Rail Temporal Continuo Proporcional */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-1">
          <span>{startYear}</span>
          <span>Proporción de Años Activos por Era</span>
          <span>{endYear}</span>
        </div>

        <div className="w-full h-4 bg-gray-100 dark:bg-gray-900/60 rounded-xl overflow-hidden flex p-1 gap-1 border border-gray-200/80 dark:border-gray-700">
          {parsedHistory.map((item) => {
            const widthPct = (item.duration / totalDuration) * 100;

            return (
              <div
                key={item.idStr}
                style={{ width: `${widthPct}%` }}
                title={`${item.constructorId.toUpperCase()}: ${item.yearFrom} - ${
                  item.isCurrent ? 'Presente' : item.endYear
                } (${item.duration} ${item.duration === 1 ? 'año' : 'años'})`}
                className={`h-full rounded-md transition-all duration-200 relative group cursor-pointer ${
                  item.isCurrent
                    ? 'bg-linear-to-r from-cyan-500 to-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* 2. Tarjetas de Eras Integradas por la Línea Conectora */}
      <div className="relative pt-3">
        {/* Línea conectora trasera */}
        <div className="absolute left-6 right-6 top-8 h-0.5 bg-gray-200 dark:bg-gray-700 hidden md:block" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 relative z-10">
          {parsedHistory.map((item, index) => (
            <div
              key={item.idStr}
              className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                item.isCurrent
                  ? 'bg-linear-to-b from-cyan-500/10 to-transparent border-cyan-500/40 dark:border-cyan-500/30 shadow-md ring-1 ring-cyan-500/20'
                  : 'bg-gray-50/80 dark:bg-gray-700/30 border-gray-200/80 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      item.isCurrent
                        ? 'bg-cyan-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    Era #{index + 1}
                  </span>
                  {item.isCurrent && (
                    <span className="flex h-2 w-2 relative" title="Escudería Actual">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                    </span>
                  )}
                </div>

                <h4 className="text-base font-black text-gray-900 dark:text-white capitalize tracking-tight pt-1">
                  {item.constructorId.replace(/-/g, ' ')}
                </h4>
              </div>

              <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">
                    Período
                  </span>
                  <span className="font-extrabold text-gray-800 dark:text-gray-200">
                    {item.yearFrom} - {item.isCurrent ? 'Pres.' : item.yearToParsed}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">
                    Duración
                  </span>
                  <span className="font-extrabold text-cyan-600 dark:text-cyan-400">
                    {item.duration} {item.duration === 1 ? 'año' : 'años'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}