"use client";

import { circuitsPaths } from "@/lib/data/circuitsPaths";

interface CircuitAnimationProps {
  slug?: string;
  pathD?: string;
  viewBox?: string;
  circuitName?: string;
  duration?: string;
}

export function CircuitAnimation({
  slug,
  pathD,
  viewBox = "0 0 500 500",
  circuitName = "Circuito",
  duration = "8s",
}: CircuitAnimationProps) {
  const circuitData = slug ? circuitsPaths[slug] : null;

  if (!circuitData && !pathD) {
    return (
      <span className="text-xs text-slate-600 font-mono">
        Trazado no disponible
      </span>
    );
  }

  // Generamos IDs únicos para que no haya conflictos si hay múltiples circuitos renderizados
  const uniqueSuffix = slug || "custom";
  const filterId = `glow-${uniqueSuffix}`;
  const trackId = `track-${uniqueSuffix}`;

  // Verificamos si este circuito tiene la bandera reversed en true
  // (Asegúrate de que la interfaz de tu circuitData incluya reversed?: boolean)
  const isReversed = circuitData?.reversed || false;

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <svg
        viewBox={viewBox}
        fill="none"
        role="img"
        aria-label={`Trazado de telemetría de ${circuitName}`}
        className="h-full w-full overflow-visible drop-shadow-[0_0_12px_rgba(6,182,212,0.3)] text-cyan-400 stroke-current"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g filter={`url(#${filterId})`}>
          {circuitData ? (
            <>
              {/* Trazado principal del circuito CON UN ID para la animación */}
              <path id={trackId} d={circuitData.track} />
              
              {/* Línea de meta */}
              <path 
                d={circuitData.finishRect.d} 
                transform={circuitData.finishRect.transform}
                fill="currentColor"
                strokeWidth="1"
              />
              
              {/* Flecha de dirección */}
              <path 
                d={circuitData.finishArrow.d} 
                transform={circuitData.finishArrow.transform}
                strokeWidth="2"
              />
            </>
          ) : (
            /* Fallback con ID */
            <path id={trackId} d={pathD} />
          )}
        </g>

        {/* Círculo animado (El monoplaza) */}
        <circle 
          r="10" 
          fill="#ef4444" /* Rojo vibrante */
          stroke="#ffffff" /* Borde blanco para resaltar */
          strokeWidth="1.5"
          className="drop-shadow-[0_0_8px_rgba(239,68,68,1)]"
        >
          <animateMotion 
            dur={duration} 
            repeatCount="indefinite"
            // Si está en reversa, le decimos que vaya del final (1) al inicio (0)
            // calcMode="linear" asegura que la velocidad sea constante durante todo el trazado.
            {...(isReversed 
              ? { keyPoints: "1;0", keyTimes: "0;1", calcMode: "linear" } 
              : {})}
          >
            {/* Vinculamos el movimiento al ID del trazado de la pista */}
            <mpath href={`#${trackId}`} />
          </animateMotion>
        </circle>
      </svg>
    </div>
  );
}