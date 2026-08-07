// @/lib/utils/circuitUtils.ts

/**
 * Parsea el campo 'fastest_lap_time' (ej: "1:19:813 Charles Leclerc (2024)" o "1:07.924...")
 * o usa el 'circuit_length' para devolver una duración de animación escalada en segundos.
 */
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