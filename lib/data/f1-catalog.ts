// lib/data/f1-catalog.ts

// 1. Tipos de datos
export interface Team {
  id: string;
  name: string;
  gradient: string;
}

export interface Driver {
  id: string;
  lastName: string;
  teamId: string;
  countryCode: string;
  imageUrl: string;
}

// 2. Diccionarios originales (Optimizados para búsquedas rápidas en la DriverCard)
export const FALLBACK_DRIVER_COUNTRY_CODES: Record<string, string> = {
  Russell: 'GB', Antonelli: 'IT', Leclerc: 'MC', Hamilton: 'GB',
  Norris: 'GB', Piastri: 'AU', Verstappen: 'NL', Hadjar: 'FR',
  Gasly: 'FR', Colapinto: 'AR', Lawson: 'NZ', Lindblad: 'GB',
  Ocon: 'FR', Bearman: 'GB', 'Sainz Jr.': 'ES', Albon: 'TH',
  Hülkenberg: 'DE', Bortoleto: 'BR', Alonso: 'ES', Stroll: 'CA',
  Pérez: 'MX', Bottas: 'FI',
};

export const OFFICIAL_F1_DRIVERS_IMG_MAP: Record<string, string> = {
  Russell: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/mercedes/georus01/2026mercedesgeorus01right.webp',
  Antonelli: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/mercedes/andant01/2026mercedesandant01right.webp',
  Leclerc: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/ferrari/chalec01/2026ferrarichalec01right.webp',
  Hamilton: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/ferrari/lewham01/2026ferrarilewham01right.webp',
  Norris: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/mclaren/lannor01/2026mclarenlannor01right.webp',
  Piastri: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/mclaren/oscpia01/2026mclarenoscpia01right.webp',
  Verstappen: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/redbullracing/maxver01/2026redbullracingmaxver01right.webp',
  Hadjar: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/redbullracing/isahad01/2026redbullracingisahad01right.webp',
  Gasly: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/alpine/piegas01/2026alpinepiegas01right.webp',
  Colapinto: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/alpine/fracol01/2026alpinefracol01right.webp',
  Lawson: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/racingbulls/lialaw01/2026racingbullslialaw01right.webp',
  Lindblad: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/racingbulls/arvlin01/2026racingbullsarvlin01right.webp',
  Ocon: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/haasf1team/estoco01/2026haasf1teamestoco01right.webp',
  Bearman: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/haasf1team/olibea01/2026haasf1teamolibea01right.webp',
  'Sainz Jr.': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/williams/carsai01/2026williamscarsai01right.webp',
  Albon: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/williams/alealb01/2026williamsalealb01right.webp',
  Hülkenberg: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/audi/nichul01/2026audinichul01right.webp',
  Bortoleto: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/audi/gabbor01/2026audigabbor01right.webp',
  Alonso: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/astonmartin/feralo01/2026astonmartinferalo01right.webp',
  Stroll: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/astonmartin/lanstr01/2026astonmartinlanstr01right.webp',
  Pérez: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/cadillac/serper01/2026cadillacserper01right.webp',
  Bottas: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/cadillac/valbot01/2026cadillacvalbot01right.webp',
};

export const TEAM_COLORS: Record<string, string> = {
  'RED BULL RACING': 'from-blue-800 to-blue-950',
  FERRARI: 'from-red-600 to-red-800',
  MERCEDES: 'from-teal-400 to-teal-600',
  MCLAREN: 'from-orange-500 to-orange-700',
  'ASTON MARTIN': 'from-emerald-700 to-emerald-900',
  ALPINE: 'from-blue-600 to-pink-500',
  WILLIAMS: 'from-blue-500 to-blue-800',
  'HAAS F1 TEAM': 'from-zinc-600 to-zinc-800',
  'RACING BULLS': 'from-blue-500 to-blue-700',
  AUDI: 'from-red-600 to-neutral-900',
  CADILLAC: 'from-slate-700 to-slate-900',
};

// 3. Listas para iterar (Ideal para el selector en el Perfil de Usuario)
export const TEAMS: Team[] = Object.keys(TEAM_COLORS).map((name) => ({
  id: name.toLowerCase().replace(/\s+/g, '-'),
  name,
  gradient: TEAM_COLORS[name]
}));

export const DRIVERS_LIST: Driver[] = Object.keys(OFFICIAL_F1_DRIVERS_IMG_MAP).map(lastName => ({
  id: lastName.toLowerCase().replace(/\s+/g, '-').replace('.', ''),
  lastName,
  countryCode: FALLBACK_DRIVER_COUNTRY_CODES[lastName],
  imageUrl: OFFICIAL_F1_DRIVERS_IMG_MAP[lastName],
  teamId: "unknown" // Lo dejaremos genérico por ahora, o lo podemos enriquecer luego.
}));