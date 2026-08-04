'use client';

import { useEffect, useState } from 'react';

export interface EngineDetail {
  _id: string;
  id: string;
  engineManufacturerId: string;
  name: string;
  fullName: string;
  capacity?: number | null;
  configuration?: string | null;
  aspiration?: string | null;
}

interface EngineModalProps {
  engineId: string | null;
  onClose: () => void;
}

export function EngineModal({ engineId, onClose }: EngineModalProps) {
  const [engine, setEngine] = useState<EngineDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!engineId) return;

    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    fetch(`/api/f1/engines/${engineId}`)
      .then((res) => {
        if (!res.ok) throw new Error('No se encontraron detalles del motor');
        return res.json();
      })
      .then((data) => {
        if (isMounted) setEngine(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [engineId]);

  if (!engineId) return null;

  // Mapeo amigable para el tipo de aspiración
  const formatAspiration = (asp?: string | null) => {
    if (!asp) return 'N/D';
    switch (asp.toUpperCase()) {
      case 'NATURALLY_ASPIRATED':
        return 'Atmosférico (Aspiración Natural)';
      case 'TURBO':
      case 'TURBOCHARGED':
        return 'Turboalimentado';
      case 'SUPERCHARGED':
        return 'Sobrealimentado (Compresor)';
      default:
        return asp;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Fondo clickeable para cerrar */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Card del Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/80 p-6 z-10 space-y-5">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg transition"
        >
          ✕
        </button>

        {loading && (
          <div className="py-8 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500 font-medium">Cargando especificaciones...</p>
          </div>
        )}

        {error && (
          <div className="py-6 text-center space-y-2">
            <p className="text-sm text-red-500 font-semibold">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg font-bold"
            >
              Cerrar
            </button>
          </div>
        )}

        {!loading && !error && engine && (
          <>
            {/* Header Motor */}
            <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Ficha Técnica de Motorización
              </span>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                {engine.fullName || engine.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Fabricante: <span className="font-bold text-gray-700 dark:text-gray-300 uppercase">{engine.engineManufacturerId}</span>
              </p>
            </div>

            {/* Grid de Propiedades */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-xl">
                <span className="block text-gray-400 font-bold uppercase text-[10px]">Cilindrada</span>
                <span className="text-base font-extrabold text-gray-900 dark:text-white">
                  {engine.capacity ? `${engine.capacity} L` : 'N/D'}
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/40 p-3 rounded-xl">
                <span className="block text-gray-400 font-bold uppercase text-[10px]">Configuración</span>
                <span className="text-base font-extrabold text-gray-900 dark:text-white">
                  {engine.configuration || 'N/D'}
                </span>
              </div>

              <div className="col-span-2 bg-gray-50 dark:bg-gray-700/40 p-3 rounded-xl">
                <span className="block text-gray-400 font-bold uppercase text-[10px]">Aspiración / Inducción</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatAspiration(engine.aspiration)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 text-right">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition"
              >
                Entendido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}