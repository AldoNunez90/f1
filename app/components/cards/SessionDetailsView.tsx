"use client";

import { useF1Data } from "@/lib/hooks/useF1Data";
import { LoadingSpinner } from "@/app/components/common/Loading";
import { ErrorMessage } from "@/app/components/common/Error";
import type { Session } from "@/app/(sections)/sessions/page";
import { formatSessionType, getTeamGradient } from "@/lib/utils/formatters";


export interface SessionResult {
  session_key?: number;
  driver_number?: number;
  name?: string;
  team?: string;
  position?: number;
  points?: number;
  number_of_laps?: number;
  gap_to_leader?: number;
  duration?: string | string[]; // Puede ser un string simple o un array de strings para mostrar múltiples tiempos
  dnf?: boolean;
  dns?: boolean;
  dsq?: boolean;
}


/**
 * Vista detallada de una sesión con resultados procesados
 */
export default function SessionDetailsView({ session, onBack }: { session: Session; onBack: () => void }) {
  const sessionKey = session.session_key;

const { data, loading, error, refetch} = useF1Data({
    endpoint: "session_result",
    queryParams: sessionKey ? { session_key: sessionKey } : undefined,
  });

  const { data: driverData, loading: loadingDriver, error: errorDriver } = useF1Data({
    endpoint: 'drivers',
    queryParams: { session_key: "latest" }, 
    refetchInterval: 0, // Desactivar actualización automática: se carga una vez y queda fija
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;
  if (errorDriver) return <ErrorMessage message={errorDriver.message} />;

  const sessionResult = Array.isArray(data) ? data : [];

  const sessionName = formatSessionType(session.session_name);

  const drivers = Array.isArray(driverData) ? driverData : [];
 

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-500 hover:text-white transition-all shadow-sm">
          <span>←</span>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{sessionName}</h2>
          <p className="text-gray-500 text-sm">{session.circuit_short_name} • {session.year}</p>
        </div>
       
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-black text-[10px] uppercase tracking-widest">
                <th className="px-6 py-4 text-center w-16">P</th>
                <th className="px-6 py-4 text-left">Piloto</th>
                <th className="px-6 py-4 text-left">Equipo</th>
                <th className="px-6 py-4 text-center">Gap</th>
                <th className="px-6 py-4 text-center">Vueltas</th>
                <th className="px-6 py-4 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {sessionResult.map((res) => (
                <tr key={res.driver_number} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 text-center font-black text-gray-100">
                    {res.position ? res.position : (res.dns && 'DNS') || (res.dsq && 'DSQ') || (res.dnf && 'DNF')}
                    </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <span className={`inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-linear-to-br text-xs font-bold text-white ${getTeamGradient(drivers.find(d => d.driver_number === res.driver_number)?.team_name)}`}>
                      {res.driver_number}
                    </span>
                    {loadingDriver ? <LoadingSpinner /> : 
                      <p className="font-bold text-gray-900 dark:text-white">{drivers.find(d => d.driver_number === res.driver_number)?.full_name || 'Desconocido'}</p>  
                    }
                  </td>
                  <td className="px-6 py-4 text-left">
                    <p className="font-bold text-gray-900 dark:text-white">{drivers.find( t => t.driver_number === res.driver_number)?.team_name}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                    { Array.isArray(res.gap_to_leader) ? (
                      res.duration[2] && <span className="text-sm text-gray-100">{res.duration[2]}</span> || res.duration[1] && <span className="text-sm text-gray-100">{res.duration[1]}</span> || res.duration[0] && <span className="text-sm text-gray-100">{res.duration[0]}</span> 
                      ) :
                     (res.gap_to_leader ? <span className="text-sm text-gray-100">{res.gap_to_leader > 0 ? `+${res.gap_to_leader.toFixed(3)}s` : res.gap_to_leader}</span> : '-')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {res.number_of_laps}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {res.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}