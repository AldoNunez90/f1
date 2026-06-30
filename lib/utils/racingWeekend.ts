/**
 * Detecta si hoy es un fin de semana de carrera (viernes a lunes)
 * y si es durante la temporada de F1
 */
export function isRacingWeekend(): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = domingo, 1 = lunes, ..., 5 = viernes, 6 = sábado
  const month = today.getMonth() + 1; // 1-12

  // Marzo a diciembre por este año (2026)
  const isF1Season = month >= 3 && month <= 12;

  // Verificar si es viernes (5), sábado (6), domingo (0) o lunes (1)
  const isRacingDay = dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0 || dayOfWeek === 1;

  return isF1Season && isRacingDay;
}

/**
 * Retorna el próximo viernes de fin de semana de carrera
 */
export function getNextRacingWeekendDate(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();

  let daysUntilFriday = 0;

  if (dayOfWeek < 5) {
    // Si es lunes-jueves, el próximo viernes es en (5 - dayOfWeek) días
    daysUntilFriday = 5 - dayOfWeek;
  } else {
    // Si es viernes-domingo o lunes, el próximo viernes es en (12 - dayOfWeek) días
    daysUntilFriday = 12 - dayOfWeek;
  }

  const nextRacingWeekend = new Date(today);
  nextRacingWeekend.setDate(nextRacingWeekend.getDate() + daysUntilFriday);
  nextRacingWeekend.setHours(0, 0, 0, 0);

  return nextRacingWeekend;
}

/**
 * Define el intervalo de caché basado en si es fin de semana de carrera
 */
export function getCacheTTL(): number { // En milisegundos
  if (isRacingWeekend()) { // Durante fin de semana de carrera (viernes a lunes)
    return 8 * 60 * 60 * 1000; // Actualizar cada 8 horas
  }
  return 6 * 60 * 60 * 1000; // Durante la semana (martes a jueves): actualizar cada 6 horas
}
