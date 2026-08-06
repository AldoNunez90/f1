import { CircuitAnimation } from "../CircuitAnimation";
import { CIRCUIT_PATHS } from "@/lib/data/circuitsPaths";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CircuitDetailPage({ params }: PageProps) {
  const { id } = await params; // Ej: 'spa-francorchamps'

  // Buscas el trazado guardado (o usas un fallback si no existe)
  const circuitPath = CIRCUIT_PATHS[id];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold capitalize">{id.replace(/-/g, " ")}</h1>

      {/* Hero del Circuito con Animación */}
      <div className="w-full h-96 bg-slate-950 rounded-2xl p-8 border border-slate-800 relative flex items-center justify-center overflow-hidden">
        {circuitPath ? (
          <CircuitAnimation
            pathD={circuitPath.pathD}
            viewBox={circuitPath.viewBox}
            circuitName={id}
            duration="9s" // Ajustas la velocidad si el circuito es muy largo o corto
          />
        ) : (
          <p className="text-sm text-slate-500">Trazado no disponible</p>
        )}
      </div>
    </div>
  );
}