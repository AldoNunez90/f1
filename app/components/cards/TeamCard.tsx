'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getCountryFlag } from '@/lib/utils/formatters';

export interface DriverLink {
  _id: string;
  fullName: string;
  permanentNumber?: number;
  countryId?: string;
  alpha2Code?: string;
  imageUrl?: string;
}

export interface TeamCardProps {
  _id: string;
  name: string;
  fullName?: string;
  countryId?: string;
  alpha2Code?: string;
  teamColour?: string;
  chassisName?: string;
  engineName?: string;
  stats?: {
    championships?: number;
    wins?: number;
    podiums?: number;
  };
  drivers?: DriverLink[];
}

const officialF1DriversImgMap: Record<string, string> = {
  Russell:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/mercedes/georus01/2026mercedesgeorus01right.webp',
  Antonelli:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/mercedes/andant01/2026mercedesandant01right.webp',
  Leclerc:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/ferrari/chalec01/2026ferrarichalec01right.webp',
  Hamilton:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/ferrari/lewham01/2026ferrarilewham01right.webp',
  Norris:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/mclaren/lannor01/2026mclarenlannor01right.webp',
  Piastri:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/mclaren/oscpia01/2026mclarenoscpia01right.webp',
  Verstappen:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/redbullracing/maxver01/2026redbullracingmaxver01right.webp',
  Hadjar:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/redbullracing/isahad01/2026redbullracingisahad01right.webp',
  Gasly:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/alpine/piegas01/2026alpinepiegas01right.webp',
  Colapinto:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/alpine/fracol01/2026alpinefracol01right.webp',
  Lawson:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/racingbulls/lialaw01/2026racingbullslialaw01right.webp',
  Lindblad:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/racingbulls/arvlin01/2026racingbullsarvlin01right.webp',
  Ocon:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/haasf1team/estoco01/2026haasf1teamestoco01right.webp',
  Bearman:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/haasf1team/olibea01/2026haasf1teamolibea01right.webp',
  'Sainz Jr.':
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/williams/carsai01/2026williamscarsai01right.webp',
  Sainz:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/williams/carsai01/2026williamscarsai01right.webp',
  Albon:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/williams/alealb01/2026williamsalealb01right.webp',
  Hülkenberg:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/audi/nichul01/2026audinichul01right.webp',
  Hulkenberg:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/audi/nichul01/2026audinichul01right.webp',
  Bortoleto:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/audi/gabbor01/2026audigabbor01right.webp',
  Alonso:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/astonmartin/feralo01/2026astonmartinferalo01right.webp',
  Stroll:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/astonmartin/lanstr01/2026astonmartinlanstr01right.webp',
  Pérez:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/cadillac/serper01/2026cadillacserper01right.webp',
  Perez:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/cadillac/serper01/2026cadillacserper01right.webp',
  Bottas:
    'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/cadillac/valbot01/2026cadillacvalbot01right.webp',
};

// Map de fallback para countryIds comunes a ISO alpha-2
const countrySlugToAlpha2: Record<string, string> = {
  'united-kingdom': 'GB',
  great_britain: 'GB',
  uk: 'GB',
  argentina: 'AR',
  spain: 'ES',
  germany: 'DE',
  france: 'FR',
  italy: 'IT',
  australia: 'AU',
  netherlands: 'NL',
  monaco: 'MC',
  brazil: 'BR',
  mexico: 'MX',
  canada: 'CA',
  new_zealand: 'NZ',
  'new-zealand': 'NZ',
  thailand: 'TH',
  finland: 'FI',
  japan: 'JP',
  china: 'CN',
  united_states: 'US',
  'united-states': 'US',
  usa: 'US',
  denmark: 'DK',
  austria: 'AT',
  switzerland: 'CH',
  belgium: 'BE',
};



export function TeamCard({
  _id,
  name,
  fullName,
  chassisName,
  engineName,
  teamColour,
  stats,
  drivers = [],
}: TeamCardProps) {
  const teamGradients: Record<string, string> = {
    'red-bull': 'from-blue-800 to-blue-950',
    'red-bull-racing': 'from-blue-800 to-blue-950',
    ferrari: 'from-red-600 to-red-800',
    mercedes: 'from-teal-400 to-teal-600',
    mclaren: 'from-orange-500 to-orange-700',
    'aston-martin': 'from-emerald-700 to-emerald-900',
    alpine: 'from-blue-600 to-pink-500',
    williams: 'from-blue-500 to-blue-800',
    haas: 'from-zinc-600 to-zinc-800',
    'racing-bulls': 'from-blue-500 to-blue-700',
    rb: 'from-blue-500 to-blue-700',
    audi: 'from-red-600 to-neutral-900',
    cadillac: 'from-slate-700 to-slate-900',
  };

  const cleanSlug = name.toLowerCase().replace(/ /g, '-');
  const gradient = teamGradients[cleanSlug] || 'from-gray-700 to-gray-900';


  const hexToRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace('#', '');
    const fullHex = normalized.length === 3
      ? normalized.split('').map((c) => c + c).join('')
      : normalized;
    const numeric = parseInt(fullHex, 16);
    return `rgba(${(numeric >> 16) & 255}, ${(numeric >> 8) & 255}, ${numeric & 255}, ${alpha})`;
  };

  const bgStyle = teamColour ? { backgroundColor: hexToRgba(teamColour, 0.12) } : {};

  // Extrae el apellido para buscar en officialF1DriversImgMap
  const extractSurname = (fullNameStr: string): string => {
    if (!fullNameStr) return '';
    const parts = fullNameStr.trim().split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : parts[0];
  };

  // Resuelve la URL de la bandera con fallback
  const getFlag = (driver: DriverLink) => {
    let code = driver.alpha2Code;
    if (!code && driver.countryId) {
      code = countrySlugToAlpha2[driver.countryId.toLowerCase()] || driver.countryId;
    }
    console.log(code)
    return getCountryFlag(code || 'GB');
  };

  return (
    <article
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700/60 flex flex-col justify-between"
      style={bgStyle}
    >
      <div>
        {/* Enlace al detalle del equipo */}
        <Link href={`/teams/${_id}`} className="block group">
          <div className={`h-24 bg-linear-to-r ${gradient} p-5 flex items-center justify-between relative`}>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-xs group-hover:underline">
                {name}
              </h2>
              {fullName && fullName !== name && (
                <p className="text-xs text-white/80 font-medium truncate max-w-50">
                  {fullName}
                </p>
              )}
            </div>

            {(stats?.championships ?? 0) > 0 && (
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-xs">
                🏆 {stats?.championships} {stats?.championships === 1 ? 'Título' : 'Títulos'}
              </span>
            )}
          </div>
        </Link>

        {/* Datos Técnicos (Chasis y Motor) */}
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-100 dark:border-gray-700">
              <span className="block text-[10px] font-extrabold text-gray-400 uppercase">Chasis</span>
              <span className="font-bold text-gray-800 dark:text-gray-200 truncate block">
                {chassisName || 'N/D'}
              </span>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-100 dark:border-gray-700">
              <span className="block text-[10px] font-extrabold text-gray-400 uppercase">Motor</span>
              <span className="font-bold text-gray-800 dark:text-gray-200 truncate block">
                {engineName || 'N/D'}
              </span>
            </div>
          </div>

          {/* Alineación de Pilotos */}
          <div>
            <h3 className="text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Pilotos 
            </h3>
            <div className="space-y-2">
              {drivers.length > 0 ? (
                drivers.map((driver) => {
                  const surname = extractSurname(driver.fullName);
                  const officialImg = officialF1DriversImgMap[surname];
                  const driverAvatar = officialImg || driver.imageUrl;
                  const flagUrl = getFlag(driver);

                  return (
                    <Link
                      key={driver._id}
                      href={`/drivers/${driver._id}`}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/60 hover:bg-cyan-50 dark:hover:bg-cyan-950/30 border border-gray-200/60 dark:border-gray-600/50 rounded-lg transition group/driver"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 shrink-0 border border-gray-300 dark:border-gray-500">
                          {driverAvatar ? (
                            <Image
                              src={driverAvatar}
                              alt={driver.fullName}
                              fill
                              sizes="28px"
                              className="object-cover object-top"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                              {driver.permanentNumber ? `#${driver.permanentNumber}` : 'F1'}
                            </div>
                          )}
                        </div>

                        <span className="font-semibold text-gray-900 dark:text-white text-xs group-hover/driver:text-cyan-600 dark:group-hover/driver:text-cyan-400 transition">
                          {driver.fullName}
                        </span>
                      </div>

                      {flagUrl && flagUrl.startsWith('http') ? (
                        <div className="relative w-5 h-3.5 overflow-hidden rounded-xs shrink-0 border border-gray-200 dark:border-gray-600">
                          <Image
                            src={flagUrl}
                            alt="Bandera"
                            fill
                            sizes="20px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-xs">🌐</span>
                      )}
                    </Link>
                  );
                })
              ) : (
                <p className="text-gray-400 dark:text-gray-500 text-xs italic">
                  Sin registro de pilotos en la temporada
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ver Detalles link en Footer */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700/60 text-right">
        <Link
          href={`/teams/${_id}`}
          className="text-xs font-bold text-cyan-700 dark:text-cyan-400 hover:underline"
        >
          Ver historial completo &rarr;
        </Link>
      </div>
    </article>
  );
}