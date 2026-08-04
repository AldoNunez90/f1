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

function parseGmtOffsetToMinutes(offset?: string): number | null {
  if (!offset || typeof offset !== 'string') return null;
  const normalized = offset.trim();
  const match = normalized.match(/^([+-])?(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return null;
  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  const seconds = Number(match[4]);
  return sign * (hours * 60 + minutes + seconds / 60);
}

export function formatDateTimeWithOffset(dateString: string | undefined, gmtOffset?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'N/A';

  const offsetMinutes = parseGmtOffsetToMinutes(gmtOffset);
  
  const localDate = offsetMinutes === null ? date : new Date(date.getTime() + offsetMinutes * 60000);

  return localDate.toLocaleString('es-ES', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatArgentinaDateTime(dateString: string | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'N/A';

  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(date);
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

/**
 * Genera la URL de la bandera desde FlagCDN a partir del código de país.
 * Acepta Alpha-2 (ej: "AR", "HK") devuelto por la colección countries de MongoDB,
 * o Alpha-3 / fallback como respaldo.
 */
/**
 * Genera la URL de la bandera desde FlagCDN a partir del código, ID o slug de país.
 * Soporta Alpha-2 (ej: "AR"), Alpha-3 (ej: "USA", "POR"), slugs de la DB (ej: "united-states", "portugal") 
 * y nombres comunes.
 */
export function getCountryFlag(countryCode: string | undefined | null): string {
  if (!countryCode || typeof countryCode !== 'string') return '🌐';

  const raw = countryCode.trim().toLowerCase();

  // 1. Mapeo de Slugs/IDs de MongoDB, nombres en inglés/español y códigos de 3 letras (IOC/ISO) -> Alpha-2
  const countryToAlpha2: Record<string, string> = {
    // --- Casos problemáticos reportados ---
    'united-states': 'us',
    'usa': 'us',
    'united states': 'us',
    'united-states-of-america': 'us',
    'us': 'us',
    'portugal': 'pt',
    'prt': 'pt',
    'por': 'pt',
    'pt': 'pt',
    'venezuela': 've',
    'ven': 've',
    've': 've',

    // --- Slugs e IDs comunes de la DB / Países de F1 ---
    'argentina': 'ar', 'arg': 'ar',
    'australia': 'au', 'aus': 'au',
    'austria': 'at', 'aut': 'at',
    'azerbaijan': 'az', 'aze': 'az',
    'bahrain': 'bh', 'brn': 'bh',
    'belgium': 'be', 'bel': 'be',
    'brazil': 'br', 'bra': 'br',
    'canada': 'ca', 'can': 'ca',
    'chile': 'cl', 'chl': 'cl',
    'china': 'cn', 'chn': 'cn',
    'czechia': 'cz', 'cze': 'cz', 'czech-republic': 'cz',
    'colombia': 'co', 'col': 'co',
    'cuba': 'cu', 'cub': 'cu',
    'denmark': 'dk', 'dnk': 'dk', 'den': 'dk',
    'finland': 'fi', 'fin': 'fi',
    'france': 'fr', 'fra': 'fr',
    'germany': 'de', 'deu': 'de', 'ger': 'de',
    'great-britain': 'gb', 'united-kingdom': 'gb', 'gbr': 'gb', 'uk': 'gb',
    'hungary': 'hu', 'hun': 'hu',
    'india': 'in', 'ind': 'in',
    'indonesia': 'id', 'idn': 'id',
    'ireland': 'ie', 'irl': 'ie',
    'italy': 'it', 'ita': 'it',
    'japan': 'jp', 'jpn': 'jp',
    'mexico': 'mx', 'mex': 'mx',
    'monaco': 'mc', 'mco': 'mc', 'mon': 'mc',
    'netherlands': 'nl', 'ned': 'nl', 'nld': 'nl',
    'new-zealand': 'nz', 'nzl': 'nz',
    'poland': 'pl', 'pol': 'pl',
    'qatar': 'qa', 'qat': 'qa',
    'russia': 'ru', 'rus': 'ru',
    'saudi-arabia': 'sa', 'ksa': 'sa', 'sau': 'sa',
    'singapore': 'sg', 'sgp': 'sg',
    'south-africa': 'za', 'zaf': 'za', 'rsa': 'za',
    'spain': 'es', 'esp': 'es',
    'sweden': 'se', 'swe': 'se',
    'switzerland': 'ch', 'che': 'ch', 'sui': 'ch',
    'thailand': 'th', 'tha': 'th',
    'turkey': 'tr', 'tur': 'tr',
    'united-arab-emirates': 'ae', 'uae': 'ae', 'are': 'ae',
    'uruguay': 'uy', 'ury': 'uy',
    'zimbabwe': 'zw', 'zwe': 'zw',
  };

  // Buscar en el diccionario
  const alpha2 = countryToAlpha2[raw] || (raw.length === 2 ? raw : null);

  if (!alpha2) return '🌐';

  return `https://flagcdn.com/64x48/${alpha2.toLowerCase()}.png`;
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
  if (dateEnd && !dateEnd.includes('T00:00:00')) {
    return { text: 'Completada', color: 'bg-gray-500' };
  }

  // 3. En vivo: Si ya empezó y date_end sigue en 00:00:00
  return { text: 'En vivo', color: 'bg-green-500' };
}