'use client';

import { useEffect, useState } from 'react';
import { formatDate, formatSessionType, getSessionStatusBadge } from '@/lib/utils/formatters';

interface SessionCardProps {
  session_key?: number;
  session_name?: string;
  session_type?: string;
  meeting_key?: number;
  date_start?: string;
  date_end?: string;
  location?: string;
  circuit_name?: string;
  country_code?: string;
  circuit_short_name?: string;
  country_name?: string;
  is_open?: boolean;
  is_cancelled?: boolean;
  year?: number;
  round?: number;
  onClick?: () => void;
}
export function SessionCard(props: SessionCardProps) {
  const [pendingInfoVisible, setPendingInfoVisible] = useState(false);
  const status = getSessionStatusBadge(props.date_start, props.date_end);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  const pendingDays = props.date_start && currentTime ? Math.ceil((new Date(props.date_start).getTime() - currentTime) / (1000 * 60 * 60 * 24)) : null;
  const pendingSessionLabel = formatSessionType(props.session_name).replace(/^[^A-Za-zÁÉÍÓÚÜÑ]+\s*/, '') || 'sesión';
  const pendingMessage = status.text.toLowerCase() === 'pendiente' && pendingDays !== null
    ? `Faltan ${pendingDays} día${pendingDays === 1 ? '' : 's'} para esta ${pendingSessionLabel.toLowerCase()}`
    : null;

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentTime(Date.now());
      setPendingInfoVisible(false);
    }, 0);

    // Es una buena práctica limpiar el timer si el componente se desmonta 
    // o las props cambian rápidamente
    return () => clearTimeout(timer);
  
  }, [props.session_name, props.date_start, props.date_end]);

  const handleCardClick = () => {
    if (status.text.toLowerCase() === 'pendiente') {
      setPendingInfoVisible(true);
      return;
    }
    props.onClick?.();
  };

  return (
    <div 
      className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer active:scale-[0.99]" 
      onClick={handleCardClick}
    >
      {pendingInfoVisible && pendingMessage ? (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPendingInfoVisible(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 p-4 text-sm text-gray-900 dark:text-blue-100 shadow-xl justify-center flex flex-col items-center gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <p>{pendingMessage}</p>
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); setPendingInfoVisible(false); }}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
      {/* Header */}
      <div className="bg-linear-to-r from-red-600 to-red-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* <span className="text-3xl">{emoji}</span> */}
            <div>
              <h3 className="text-lg font-bold text-white">
                {formatSessionType(props.session_name)}
              </h3>
              <p className="text-red-100 text-sm">{props.circuit_name || props.location || 'N/A'}</p>
            </div>
          </div>
          <div className={`${status.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
            {status.text}
          </div>
        </div>
      </div>

      

      {/* Content */}
      <div className="p-6">
        {/* Fechas */}
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">FECHA:</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
              {formatDate(props.date_start)}
            </p>
          </div>
         
        </div>

        {/* Info Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {props.year && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Temporada</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{props.year}</p>
            </div>
          )}
          {props.round && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Ronda</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{props.round}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
