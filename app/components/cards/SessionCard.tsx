'use client';

import { useEffect, useState } from 'react';
import {
  formatDateTimeWithOffset,
  formatArgentinaDateTime,
  formatSessionType,
  getSessionStatusBadge,
} from '@/lib/utils/formatters';

interface SessionCardProps {
  session_key?: number;
  session_name?: string;
  session_type?: string;
  meeting_key?: number;
  date_start?: string;
  date_end?: string;
  gmt_offset?: string;
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

    return () => clearTimeout(timer);
  }, [props.session_name, props.date_start, props.date_end]);

  const handleCardClick = () => {
    if (status.text.toLowerCase() === 'pendiente') {
      setPendingInfoVisible(true);
      return;
    }
    props.onClick?.();
  };

  // OPTIMIZACIÓN ACCESIBILIDAD CONTRASTE BADGES:
  // Forzamos un alto contraste y tipografía legible según el estado retornado
  const isPendiente = status.text.toLowerCase() === 'pendiente';
  const statusBadgeStyle = isPendiente
    ? "bg-amber-100 text-amber-950 dark:bg-amber-950/40 dark:text-amber-300"
    : "bg-emerald-100 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300";

  return (
    <article 
      className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.99] border border-gray-100 dark:border-gray-700/50 flex flex-col justify-between" 
      onClick={handleCardClick}
    >
      {/* Modal de Advertencia (con atributos de accesibilidad ARIA) */}
      {pendingInfoVisible && pendingMessage ? (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setPendingInfoVisible(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pending-modal-title"
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white dark:bg-gray-900 border border-cyan-200 dark:border-cyan-900 p-6 text-sm text-gray-900 dark:text-cyan-100 shadow-2xl justify-center flex flex-col items-center gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <p id="pending-modal-title" className="font-semibold text-center text-gray-800 dark:text-gray-200">
              {pendingMessage}
            </p>
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); setPendingInfoVisible(false); }}
              className="mt-2 inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-700 active:scale-95 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      ) : null}

      <div>
        {/* Header con gradiente F1 */}
        <div className="bg-linear-to-r from-red-600 to-red-800 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              {/* OPTIMIZACIÓN ACCESIBILIDAD JERÁRQUICA: 
                  Cambiamos h3 por h2 para mantener el orden secuencial correcto de cabeceras en el grid */}
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                {formatSessionType(props.session_name)}
              </h2>
              <p className="text-red-100/90 text-xs font-semibold mt-0.5 tracking-wide uppercase">{props.circuit_name || props.location || 'N/A'}</p>
            </div>
            <div className={`shrink-0 ${statusBadgeStyle} text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider`}>
              {status.text}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Fechas */}
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-extrabold tracking-wider uppercase">HORARIO LOCAL</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                {formatDateTimeWithOffset(props.date_start, props.gmt_offset)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-extrabold tracking-wider uppercase">HORA ARGENTINA</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                {formatArgentinaDateTime(props.date_start)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid (Siempre empujado al fondo de la tarjeta) */}
      <div className="px-6 pb-6 mt-auto">
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
          {props.year && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 border border-gray-100 dark:border-gray-700/30 text-center">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Temporada</p>
              <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">{props.year}</p>
            </div>
          )}
          {props.round && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 border border-gray-100 dark:border-gray-700/30 text-center">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Ronda</p>
              <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">{props.round}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}