"use client";

import { useF1Data } from "@/lib/hooks/useF1Data";
import { LoadingSpinner } from "@/app/components/common/Loading";
import { ErrorMessage } from "@/app/components/common/Error";
import type { Session } from "@/app/(sections)/sessions/page";
import { formatSessionType, getTeamGradient } from "@/lib/utils/formatters";
import { useMemo } from "react";

export interface SessionResult {
  session_key?: number;
  driver_number?: number;
  name?: string;
  team?: string;
  position?: number;
  points?: number;
  number_of_laps?: number;
  gap_to_leader?: number;
  duration?: string | string[];
  dnf?: boolean;
  dns?: boolean;
  dsq?: boolean;
}

interface Driver {
  driver_number?: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  team_name?: string;
}

const driversConfig = {
  endpoint: 'drivers',
  queryParams: { session_key: "latest" }, 
  refetchInterval: 0,
}

export default function SessionDetailsView({ session, onBack }: { session: Session; onBack: () => void }) {
  const sessionKey = session.session_key;

  const sessionResultConfig = useMemo(() => {
    return {
      endpoint: "session_result",
      queryParams: sessionKey ? { session_key: sessionKey } : undefined,
    };
  }, [sessionKey]);

  const { data, loading, error, refetch } = useF1Data<SessionResult[]>(sessionResultConfig);
  const { data: driverData, loading: loadingDriver, error: errorDriver } = useF1Data<Driver[]>(driversConfig);

  // OPTIMIZACIÓN DE RENDIMIENTO:
  // Mapeamos los pilotos una sola vez a un Map indexado por 'driver_number'.
  // Evita el uso de .find() repetitivo en el ciclo de renderizado (pasa de O(N) a O(1)).
  const driversMap = useMemo(() => {
    const map = new Map<number, Driver>();
    if (Array.isArray(driverData)) {
      driverData.forEach(driver => {
        if (typeof driver.driver_number === 'number') {
          map.set(driver.driver_number, driver);
        }
      });
    }
    return map;
  }, [driverData]);

  const sessionResult = useMemo(() => {
    return Array.isArray(data) ? data : [];
  }, [data]);

  const sessionName = formatSessionType(session.session_name);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;
  if (errorDriver) return <ErrorMessage message={errorDriver.message} />;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        {/* OPTIMIZACIÓN ACCESIBILIDAD: Se añade aria-label al botón de retroceso */}
        <button 
          onClick={onBack} 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-500 hover:text-white dark:text-white dark:hover:bg-red-600 transition-all shadow-xs"
          aria-label="Volver a la lista de sesiones"
        >
          <span aria-hidden="true">←</span>
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{sessionName}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            {session.circuit_short_name} • {session.year}
          </p>
        </div>
      </div>

      {/* Contenedor de la Tabla con reserva de altura para mitigar CLS secundario */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 min-h-75">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left">
            <thead>
              {/* OPTIMIZACIÓN ACCESIBILIDAD: text-gray-500 a text-gray-600/dark:text-gray-400 para contraste AA */}
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-extrabold text-xxs uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                <th scope="col" className="px-6 py-4 text-center w-16">P</th>
                <th scope="col" className="px-6 py-4 text-left">Piloto</th>
                <th scope="col" className="px-6 py-4 text-left">Equipo</th>
                <th scope="col" className="px-6 py-4 text-center">Gap</th>
                <th scope="col" className="px-6 py-4 text-center">Vueltas</th>
                <th scope="col" className="px-6 py-4 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sessionResult.map((res) => {
                const driverNum = res.driver_number ?? 0;
                const driverInfo = driversMap.get(driverNum);
                const teamName = driverInfo?.team_name || 'N/A';
                
                return (
                  <tr key={`result-${driverNum}`} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                    {/* OPTIMIZACIÓN CONTRASTE: Cambiado de text-gray-100 a text-gray-900 / dark:text-gray-100 */}
                    <td className="px-6 py-4 text-center font-black text-gray-900 dark:text-gray-100">
                      {res.position ? res.position : (res.dns && 'DNS') || (res.dsq && 'DSQ') || (res.dnf && 'DNF')}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-xs font-bold text-white ${getTeamGradient(teamName)}`}>
                        {res.driver_number}
                      </span>
                      {loadingDriver ? (
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-xs" />
                      ) : (
                        <p className="font-bold text-gray-900 dark:text-white">
                          {driverInfo?.full_name || 'Desconocido'}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {teamName}
                      </p>
                    </td>
                    {/* OPTIMIZACIÓN CONTRASTE EN GAPS: Cambiado text-gray-100 por text-gray-900 / dark:text-gray-100 */}
                    <td className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-gray-100">
                      <div className="flex flex-col items-center">
                        {Array.isArray(res.gap_to_leader) && Array.isArray(res.duration) ? (
                          res.duration[2] ? (
                            <span className="text-sm">{res.duration[2]}</span>
                          ) : res.duration[1] ? (
                            <span className="text-sm">{res.duration[1]}</span>
                          ) : res.duration[0] ? (
                            <span className="text-sm">{res.duration[0]}</span>
                          ) : (
                            <span>-</span>
                          )
                        ) : res.gap_to_leader ? (
                          <span className="text-sm">
                            {res.gap_to_leader > 0 ? `+${res.gap_to_leader.toFixed(3)}s` : res.gap_to_leader}
                          </span>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-gray-100">
                      {res.number_of_laps}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-950 dark:text-white">
                      {res.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}