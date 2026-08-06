// @/components/circuits/CircuitAnimation.tsx

interface CircuitAnimationProps {
  pathD?: string;
  viewBox?: string;
  circuitName?: string;
  duration?: string;
}

export function CircuitAnimation({
  pathD,
  viewBox = "0 0 500 500",
  circuitName = "Circuito",
  duration = "8s",
}: CircuitAnimationProps) {
  // Validación defensiva: Si no hay trazado o no empieza con comando válido
  if (!pathD || typeof pathD !== "string" || !pathD.trim().startsWith("M")) {
    return null;
  }

  return (
    <svg
      viewBox={viewBox}
      fill="none"
      role="img"
      aria-label={`Trazado de telemetría de ${circuitName}`}
      className="h-full w-full overflow-visible"
    >
      <path
        d={pathD}
        stroke="currentColor"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-slate-800 dark:text-slate-900"
      />
      <path
        d={pathD}
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-cyan-600 dark:text-cyan-400"
      />
      <path
        d={pathD}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4 20"
        className="text-slate-950 dark:text-slate-950 motion-reduce:hidden"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-96"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </path>
      <circle r="8" className="fill-cyan-500 dark:fill-cyan-300 motion-reduce:hidden">
        <animateMotion path={pathD} dur={duration} repeatCount="indefinite" />
      </circle>
      <circle
        r="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="text-cyan-500 opacity-40 motion-reduce:hidden dark:text-cyan-300"
      >
        <animateMotion path={pathD} dur={duration} repeatCount="indefinite" />
        <animate
          attributeName="r"
          values="8;20;8"
          dur="1.2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.8;0;0.8"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}