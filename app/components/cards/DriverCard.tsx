'use client';

import { getCountryFlag } from '@/lib/utils/formatters';
import Image from 'next/image';

interface DriverCardProps {
  driver_number?: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  country_code?: string;
  team_name?: string;
  headshot_url?: string;
  team_colour?: string;
}

export function DriverCard(props: DriverCardProps) {
  const name = `${props.first_name} ${props.last_name}`.trim() || 'N/A';

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
    Sainz: 'ES',
    Albon: 'TH',
    Hulkenberg: 'DE',
    Bortoleto: 'BR',
    Alonso: 'ES',
    Stroll: 'CA',
    Perez: 'MX',
    Bottas: 'FI',
  };

  const fallbackCountryCode = fallbackDriverCountryCodes[props.last_name || props.first_name || ''];
  const driverCountryCode = props.country_code || fallbackCountryCode;
  const countryFlag = getCountryFlag(driverCountryCode);
  const countryFlagUrl = countryFlag && countryFlag.startsWith('http') ? countryFlag : undefined;

  const driversImg = [
    { 'Russell': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/mercedes/georus01/2026mercedesgeorus01right.webp'},
    { 'Antonelli': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/mercedes/andant01/2026mercedesandant01right.webp'},
    { 'Leclerc': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/ferrari/chalec01/2026ferrarichalec01right.webp'},
    {'Hamilton': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/ferrari/lewham01/2026ferrarilewham01right.webp'},
    {'Norris': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/mclaren/lannor01/2026mclarenlannor01right.webp'},
    {'Piastri': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/mclaren/oscpia01/2026mclarenoscpia01right.webp'},
    {'Verstappen': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/redbullracing/maxver01/2026redbullracingmaxver01right.webp'},
    {'Hadjar': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/redbullracing/isahad01/2026redbullracingisahad01right.webp'},
    {'Gasly': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/alpine/piegas01/2026alpinepiegas01right.webp'},
    {'Colapinto': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/alpine/fracol01/2026alpinefracol01right.webp'},
    {'Lawson': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/racingbulls/lialaw01/2026racingbullslialaw01right.webp'},
    {'Lindblad': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/racingbulls/arvlin01/2026racingbullsarvlin01right.webp'},
    {'Ocon': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/haasf1team/estoco01/2026haasf1teamestoco01right.webp'},
    {'Bearman': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/haasf1team/olibea01/2026haasf1teamolibea01right.webp'},
    {'Sainz': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/williams/carsai01/2026williamscarsai01right.webp'},
    {'Albon': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/williams/alealb01/2026williamsalealb01right.webp'},
    {'Hulkenberg': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/audi/nichul01/2026audinichul01right.webp'},
    {'Bortoleto': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/audi/gabbor01/2026audigabbor01right.webp'},
    {'Alonso': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/astonmartin/feralo01/2026astonmartinferalo01right.webp'},
    {'Stroll': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/astonmartin/lanstr01/2026astonmartinlanstr01right.webp'},
    {'Perez': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/cadillac/serper01/2026cadillacserper01right.webp'},
    {'Bottas': 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/cadillac/valbot01/2026cadillacvalbot01right.webp'},
      ] 






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

  const teamColor = props.team_colour ? `#${props.team_colour}` : undefined;
  const teamColorWithAlpha = teamColor ? hexToRgba(teamColor, 0.50) : undefined;

  const gradient = teamColors[props.team_name?.toUpperCase() || ''] || 'from-gray-600 to-gray-800';
  return (
    <div className="rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden"
    style={{ backgroundColor: teamColorWithAlpha }}>
      {/* Header con color del equipo */}
      <div className={`h-32 bg-linear-to-br ${gradient} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-5xl font-bold text-white opacity-80">{props.driver_number}</div>
          <p className="text-white text-sm mt-1">{props.team_name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Nombre y foto*/}
        <div className="flex flex-col items-center max-h-[50vh] md:max-h-full overflow-y-hidden" >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">{name} </h3>
          <Image
          src={(() => {
            const lastNameKey = props.last_name || '';
            const driverObj = driversImg.find(driver => Object.keys(driver)[0] === lastNameKey);
            return (driverObj ? Object.values(driverObj)[0] as string : 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/d_common:f1:2026:fallback:driver:2026fallbackdriverright.webp/v1740000001/common/f1/2026/ferrari/lewham01/2026ferrarilewham01right.webp');
          })()}
          alt={name}
          width={320}
          height={921}
          className="md:max-w-52 mt-4"
          loading="eager"
          />
        </div> 

        {/* Info Grid */}
        <div className="mt-6 flex flex-col items-center gap-2  ">
          
            {countryFlagUrl ? (
                <Image
                  src={countryFlagUrl}
                  alt={props.country_code || 'Flag'}
                  className=" object-center"
                  width={40}
                  height={30}
                />
            ) : (
              <span className="text-xl">🌐</span>
            )}
         
         
        </div>
      </div>
    </div>
  );
}
