/**
 * Funciones de utilidad para formatear datos de F1
 */

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatSessionType(type: string | undefined): string {
  const sessionTypes: Record<string, string> = {
    'Practice 1': '🏁 Práctica 1',
    'Practice 2': '🏁 Práctica 2',
    'Practice 3': '🏁 Práctica 3',
    'Qualifying': '⏱️ Clasificación',
    'Race': '🏎️ Carrera',
    'Sprint Qualifying': '⚡ Sprint Q',
    'Sprint': '⚡ Sprint',
  };
  return sessionTypes[type || ''] || type || 'Sesión';
}

export function formatTeamName(team: string | undefined): string {
  if (!team) return 'N/A';
  return team.replace(/_/g, ' ');
}

export function getTeamColor(team: string | undefined): string {
  const teamColors: Record<string, string> = {
   'RED BULL RACING': 'from-blue-800 to-blue-950',
  'FERRARI': 'from-red-600 to-red-800',
  'MERCEDES': 'from-teal-400 to-teal-600',
  'MCLAREN': 'from-orange-500 to-orange-700',
  'ASTON MARTIN': 'from-emerald-700 to-emerald-900',
  'ALPINE': 'from-blue-600 to-pink-500',
  'WILLIAMS': 'from-blue-500 to-blue-800',
  'HAAS F1 TEAM': 'from-zinc-600 to-zinc-800',
  'RACING BULLS': 'from-blue-500 to-blue-700',
  'AUDI': 'from-red-600 to-neutral-900',
  'CADILLAC': 'from-slate-700 to-slate-900'
  };
  return teamColors[team?.toUpperCase() || ''] || 'from-gray-500 to-gray-700';
}

export function getTeamGradient(team: string | undefined): string {
  return getTeamColor(team);
}

export function extractTeamFromDriver(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const record = data as Record<string, unknown>;
  return record.team as string | undefined;
}

export function getCountryFlag(countryCode: string | undefined): string {
  if (!countryCode) return '🌐'; // Retorna un globo si no hay código

  // Mapa de códigos Alpha-3 (API F1) a Alpha-2 (Emoji compatible)
  const alpha3ToAlpha2: Record<string, string> = {
    'BRN': 'BH', 'KSA': 'SA', 'AUS': 'AU', 'JPN': 'JP', 'CHN': 'CN',
    'USA': 'US', 'MON': 'MC', 'CAN': 'CA', 'ESP': 'ES', 'AUT': 'AT',
    'GBR': 'GB', 'HUN': 'HU', 'BEL': 'BE', 'NED': 'NL', 'ITA': 'IT',
    'AZE': 'AZ', 'SGP': 'SG', 'MEX': 'MX', 'BRA': 'BR', 'QAT': 'QA', // Qatar
    'UAE': 'AE', 'FRA': 'FR', 'PRT': 'PT', 'TUR': 'TR', 'MCO': 'MC', // Mónaco
    'ZAF': 'ZA', 'KOR': 'KR', 'RUS': 'RU', 'DEU': 'DE', 'CHE': 'CH', // Sudáfrica, Corea del Sur, Rusia, Alemania, Suiza
    'ARG': 'AR', 'COL': 'CO', 'CHL': 'CL', 'PER': 'PE', 'URY': 'UY', // Argentina, Colombia, Chile, Perú, Uruguay
    'VEN': 'VE', 'ECU': 'EC', 'BOL': 'BO', 'PRY': 'PY', 'CUB': 'CU', // Venezuela, Ecuador, Bolivia, Paraguay, Cuba
  };

  let code = countryCode.toUpperCase();

  // Si es un código de 3 letras, lo traducimos. Si no está en el mapa, probamos con las primeras 2.
  if (code.length === 3) {
    code = alpha3ToAlpha2[code] || code; // Si no está en el mapa, mantenemos el código de 3 letras para el CDN si es posible
  }

  if (code.length !== 2) return '🌐';

  const codePoints = code
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  
  // Retorna la URL de la imagen de la bandera
  return `https://flagcdn.com/80x60/${code.toLowerCase()}.png`;
}
export function formatNumber(num: number | undefined, decimals = 2): string {
  if (num === undefined || num === null) return 'N/A';
  return num.toFixed(decimals);
}

export function getSessionStatusBadge(dateStart: string | undefined, dateEnd: string | undefined): {
  text: string;
  color: string;
} {
  if (!dateStart) return { text: 'N/A', color: 'bg-gray-400' };

  const now = new Date();
  const start = new Date(dateStart);

  // 1. Pendiente: Si la fecha de inicio es en el futuro
  if (start > now) {
    return { text: 'Pendiente', color: 'bg-blue-500' };
  }

  // 2. Completada: Si date_end tiene una hora diferente de 00:00:00
  // Buscamos la ausencia del marcador de medianoche exacta de la API
  if (dateEnd && !dateEnd.includes('T00:00:00')) {
    return { text: 'Completada', color: 'bg-gray-500' };
  }

  // 3. En vivo: Si ya empezó y date_end sigue en 00:00:00 (marcador de sesión abierta)
  return { text: 'En vivo', color: 'bg-green-500' };
}
