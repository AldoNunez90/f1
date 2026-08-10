'use client';

import { getCountryFlag } from '@/lib/utils/formatters';
import Image from 'next/image';
import { useState } from 'react';
// Importamos nuestro catálogo centralizado
import { FALLBACK_DRIVER_COUNTRY_CODES, OFFICIAL_F1_DRIVERS_IMG_MAP, TEAM_COLORS } from '@/lib/data/f1-catalog';

export interface DriverCardProps {
  id: string;
  fullName?: string;
  name?: string;
  surname?: string;
  imageUrl?: string;
  countryId?: string;
  alpha2Code?: string;
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
  id, name, fullName, surname, imageUrl, countryId, alpha2Code,
  permanentNumber, teamName, teamColour,
  wins = 0, championships = 0, podiums = 0, poles = 0, fastestLaps = 0,
}: DriverCardProps) {
  const [imgError, setImgError] = useState(false);

  // 1. Detección segura de Nombre Completo y Apellido
  const displayName = fullName || name || surname || id || '';
  const cleanSurname = (surname || '').trim();

  let extractedLastName = '';
  if (cleanSurname) {
    extractedLastName = cleanSurname;
  } else {
    const spaceIndex = displayName.indexOf(' ');
    extractedLastName = spaceIndex !== -1 ? displayName.slice(spaceIndex + 1).trim() : displayName;
  }

  // 2. Fallbacks de código de país
  const driverCountryCode = alpha2Code || countryId || FALLBACK_DRIVER_COUNTRY_CODES[extractedLastName] || 'GB';
  const countryFlag = getCountryFlag(driverCountryCode);
  const countryFlagUrl = countryFlag && countryFlag.startsWith('http') ? countryFlag : undefined;

  // 3. Lógica jerárquica de resolución de la URL de la imagen
  const officialF1Image = OFFICIAL_F1_DRIVERS_IMG_MAP[extractedLastName];
  const driverImageUrl = imgError ? '/drivers/placeholder.png' : officialF1Image || imageUrl || '/drivers/placeholder.svg';

  // 4. Colores e identidades visuales
  const hexToRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace('#', '');
    const fullHex = normalized.length === 3 ? normalized.split('').map((char) => char + char).join('') : normalized;
    const numeric = parseInt(fullHex, 16);
    return `rgba(${(numeric >> 16) & 255}, ${(numeric >> 8) & 255}, ${numeric & 255}, ${alpha})`;
  };

  const colorHex = teamColour ? `#${teamColour}` : undefined;
  const teamColorWithAlpha = colorHex ? hexToRgba(colorHex, 0.15) : undefined;
  const gradient = TEAM_COLORS[teamName?.toUpperCase() || ''] || 'from-gray-700 to-gray-900';

  return (
    <article
      className="rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden border border-gray-200 dark:border-gray-800 flex flex-col justify-between h-full bg-white dark:bg-gray-800"
      style={{ backgroundColor: teamColorWithAlpha }}
    >
      {/* Header con color/dorsal o stats destacadas */}
      <div
        className={`h-28 bg-linear-to-br ${gradient} flex items-center justify-between p-4 relative`}
      >
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
          <Image
            src={driverImageUrl}
            alt={`Fotografía de ${displayName}`}
            fill
            sizes="(max-width: 640px) 100vw, 176px"
            className="object-cover object-top"
            onError={() => setImgError(true)}
          />
        </div>

        {/* Métricas Históricas de Mongo */}
        <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/60 text-center">
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Victorias
            </p>
            <p className="text-lg font-black text-cyan-600 dark:text-cyan-400">
              {wins}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Podios
            </p>
            <p className="text-lg font-black text-gray-900 dark:text-gray-100">
              {podiums}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Poles
            </p>
            <p className="text-lg font-black text-cyan-600 dark:text-cyan-400">
              {poles}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Vueltas Rápidas
            </p>
            <p className="text-lg font-black text-cyan-600 dark:text-cyan-400">
              {fastestLaps}
            </p>
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
            <span className="text-base" role="img" aria-label="Bandera global">
              🌐
            </span>
          )}
        </div>
      </div>
    </article>
  );
}