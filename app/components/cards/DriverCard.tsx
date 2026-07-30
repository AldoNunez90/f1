'use client';

import { getCountryFlag } from '@/lib/utils/formatters';
import Image from 'next/image';

export interface DriverCardProps {
  id: string; // ej: "max-verstappen", "colapinto", "hamilton"
  fullName?: string;
  name?: string;
  surname?: string;
  countryId?: string; // ej: "argentina", "ARG"
  alpha2Code?: string; // ej: "AR", "GB", "HK" (proveniente del $lookup con countries)
  permanentNumber?: number;
  teamName?: string;
  teamColour?: string;
  wins?: number;
  championships?: number;
  podiums?: number;
  poles?: number;
  fastestLaps?: number;
}

export function DriverCard({
  name,
  fullName,
  surname,
  countryId,
  alpha2Code,
  permanentNumber,
  teamName,
  teamColour,
  wins = 0,
  championships = 0,
  podiums = 0,
  poles = 0,
  fastestLaps = 0,
}: DriverCardProps) {

  // 1. Detección segura de Apellido (evita crashes por undefined)
  const displayName = fullName || name || surname || '';
  const cleanSurname = (surname || '').trim();

  let extractedLastName = '';

  if (cleanSurname) {
    extractedLastName = cleanSurname;
  } else {
    const spaceIndex = displayName.indexOf(' ');
    extractedLastName = spaceIndex !== -1 
      ? displayName.slice(spaceIndex + 1).trim() 
      : displayName;
  }

  // 2. Fallbacks de código de país por si el documento MongoDB no tiene countryId
  const fallbackDriverCountryCodes: Record<string, string> = {
    Russell: 'GB',
    Antonelli: 'IT',
    Leclerc: 'MC',
    Hamilton: 'GB',
    Norris: 'GB',
    Piastri: 'AU',
    Verstappen: 'NL',
    Hadjar: 'FR',
    Gasly: 'FR',
    Colapinto: 'AR',
    Lawson: 'NZ',
    Lindblad: 'GB',
    Ocon: 'FR',
    Bearman: 'GB',
    "Sainz Jr.": 'ES',
    Albon: 'TH',
    Hulkenberg: 'DE',
    Bortoleto: 'BR',
    Alonso: 'ES',
    Stroll: 'CA',
    Pérez: 'MX',
    Bottas: 'FI',
  };

  // Prioridad: alpha2Code > countryId > fallback por apellido > 'GB'
  const driverCountryCode = alpha2Code || countryId || fallbackDriverCountryCodes[extractedLastName] || 'GB';
  const countryFlag = getCountryFlag(driverCountryCode);
  const countryFlagUrl = countryFlag && countryFlag.startsWith('http') ? countryFlag : undefined;

  // 3. Diccionario de imágenes de la temporada / fallbacks
  const driversImgMap: Record<string, string> = {
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
    "Sainz Jr.": 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/williams/carsai01/2026williamscarsai01right.webp',
    Albon: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/williams/alealb01/2026williamsalealb01right.webp',
    Hülkenberg: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/audi/nichul01/2026audinichul01right.webp',
    Bortoleto: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/audi/gabbor01/2026audigabbor01right.webp',
    Alonso: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/astonmartin/feralo01/2026astonmartinferalo01right.webp',
    Stroll: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/astonmartin/lanstr01/2026astonmartinlanstr01right.webp',
    Pérez: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/cadillac/serper01/2026cadillacserper01right.webp',
    Bottas: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/cadillac/valbot01/2026cadillacvalbot01right.webp',
  };

  const driverImageUrl = driversImgMap[extractedLastName] || "";

  // 4. Colores e identidades visuales
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

  const hexToRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace('#', '');
    const fullHex = normalized.length === 3 ? normalized.split('').map(char => char + char).join('') : normalized;
    const numeric = parseInt(fullHex, 16);
    const r = (numeric >> 16) & 255;
    const g = (numeric >> 8) & 255;
    const b = numeric & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const colorHex = teamColour ? `#${teamColour}` : undefined;
  const teamColorWithAlpha = colorHex ? hexToRgba(colorHex, 0.15) : undefined;
  const gradient = teamColors[teamName?.toUpperCase() || ''] || 'from-gray-700 to-gray-900';

  return (
    <article 
      className="rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col justify-between h-full bg-white dark:bg-gray-800"
      style={{ backgroundColor: teamColorWithAlpha }}
    >
      {/* Header con color/dorsal o stats destacadas */}
      <div className={`h-28 bg-linear-to-br ${gradient} flex items-center justify-between p-4 relative`}>
        {championships > 0 && (
          <span className="absolute top-3 left-3 text-xs font-extrabold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-xs">
            🏆 {championships} {championships === 1 ? 'Título' : 'Títulos'}
          </span>
        )}
        <div className="text-right w-full">
          <div className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">
            {permanentNumber ? `# ${permanentNumber}` : ''}
          </div>
          {teamName && (
            <p className="text-white/80 text-xs font-semibold tracking-wide uppercase mt-0.5">
              {teamName}
            </p>
          )}
        </div>
      </div>

      {/* Content principal */}
      <div className="p-5 flex flex-col items-center grow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate text-center w-full">
          {displayName}
        </h2>

        {/* Imagen del piloto */}
        <div className="relative w-full max-w-44 aspect-320/400 mt-3 overflow-hidden rounded-lg">
          {driverImageUrl !== "" && (
            <Image
              src={driverImageUrl}
              alt={`Fotografía de ${displayName}`}
              fill
              sizes="(max-width: 640px) 100vw, 176px"
              className="object-cover object-top"
            />
          )}
        </div>

        {/* Métricas Históricas de Mongo */}
        <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/60 text-center">
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Victorias</p>
            <p className="text-lg font-black text-cyan-600 dark:text-cyan-400">{wins}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Podios</p>
            <p className="text-lg font-black text-gray-900 dark:text-gray-100">{podiums}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Poles</p>
            <p className="text-lg font-black text-cyan-600 dark:text-cyan-400">{poles}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vueltas Rápidas</p>
            <p className="text-lg font-black text-cyan-600 dark:text-cyan-400">{fastestLaps}</p>
          </div>
        </div>

        {/* Bandera del país */}
        <div className="mt-3">
          {countryFlagUrl ? (
            <div className="relative w-8 h-5 shadow-xs rounded-xs overflow-hidden border border-gray-200 dark:border-gray-700">
              <Image
                src={countryFlagUrl}
                alt={`Bandera de ${driverCountryCode}`}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
          ) : (
            <span className="text-base" role="img" aria-label="Bandera global">🌐</span>
          )}
        </div>
      </div>
    </article>
  );
}