import { circuits } from "@/lib/data/circuits";


export function getCircuitAnimationDuration(
  fastestLapStr?: string | null,
  circuitLengthKm?: number | null,
  scaleFactor: number = 10 // Factor para llevar ~80s a ~8.0s
): string {
  // 1. Intentar extraer los segundos desde 'fastest_lap_time'
  if (fastestLapStr) {
    // Extrae la primera parte que coincide con minutos:segundos[:.]milisegundos (ej: "1:19:813" o "1:07.924")
    const match = fastestLapStr.match(/(\d+):(\d+)[:.](\d+)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const totalSeconds = minutes * 60 + seconds;

      if (totalSeconds > 0) {
        return `${(totalSeconds / scaleFactor).toFixed(1)}s`;
      }
    }
  }

  // 2. Fallback: Si es un circuito nuevo (como Madring) o sin récord, estimar según la longitud
  if (circuitLengthKm && circuitLengthKm > 0) {
    // Estimación promedio de ~1.5 segundos de animación por cada km de pista
    return `${(circuitLengthKm * 1.5).toFixed(1)}s`;
  }

  // 3. Fallback por defecto si no hay ningún dato
  return "7.5s";
}


const toSlug = (name?: string) =>
  name?.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export function getFastestLapForRace(circuitName?: string, raceName?: string): string {
  if (!circuitName && !raceName) return "No disponible";

  const targetSlug = toSlug(circuitName) || toSlug(raceName);
  if (!targetSlug) return "No disponible";

  const matchedCircuit = circuits.find((c) => {
    const cNameSlug = toSlug(c.circuit_name);
    const cShortSlug = toSlug(c.circuit_short_name);

    return (
      (cNameSlug && (cNameSlug.includes(targetSlug) || targetSlug.includes(cNameSlug))) ||
      (cShortSlug && (cShortSlug.includes(targetSlug) || targetSlug.includes(cShortSlug)))
    );
  });

  return matchedCircuit?.fastest_lap_time || "No disponible";
}