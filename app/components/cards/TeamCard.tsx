'use client';

import Image from "next/image";

interface Driver {
  first_name?: string;
  last_name?: string;
  country_code?: string;
}

interface TeamCardProps {
  name: string;
  drivers?: Driver[];
  country_code?: string;
  points?: number;
}

export function TeamCard(props: TeamCardProps) {
  const teamColors: Record<string, string> = {
    'RED_BULL_RACING': 'from-blue-800 to-blue-950',
    'FERRARI': 'from-red-600 to-red-800',
    'MERCEDES': 'from-teal-400 to-teal-600',
    'MCLAREN': 'from-orange-500 to-orange-700',
    'ASTON_MARTIN': 'from-emerald-700 to-emerald-900',
    'ALPINE': 'from-blue-600 to-pink-500',
    'WILLIAMS': 'from-blue-500 to-blue-800',
    'HAAS_F1_TEAM': 'from-zinc-600 to-zinc-800',
    'RACING_BULLS': 'from-blue-500 to-blue-700',
    'AUDI': 'from-red-600 to-neutral-900',
    'CADILLAC': 'from-slate-700 to-slate-900'
  };

  const gradient = teamColors[props.name?.toUpperCase().replace(/\s/g, '_')] || 'from-gray-600 to-gray-800 border-gray-600';

  const fallbackDriverCountryCodes: Record<string, string> = {
    Russell: 'gb',
    Antonelli: 'it',
    Leclerc: 'mc',
    Hamilton: 'gb',
    Norris: 'gb',
    Piastri: 'au',
    Verstappen: 'nl',
    Hadjar: 'fr',
    Gasly: 'fr',
    Colapinto: 'ar',
    Lawson: 'nz',
    Lindblad: 'gb',
    Ocon: 'fr',
    Bearman: 'gb',
    Sainz: 'es',
    Albon: 'th',
    Hulkenberg: 'de',
    Bortoleto: 'br',
    Alonso: 'es',
    Stroll: 'ca',
    Perez: 'mx',
    Bottas: 'fi',
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-gray-300 dark:border-gray-700">
      {/* Header */}
      <div className={`h-24 bg-linear-to-r ${gradient} flex items-center px-6`}>
        <div>
          {/* OPTIMIZACIÓN ACCESIBILIDAD: De h3 a h2 para corregir el orden secuencial de encabezados */}
          <h2 className="text-2xl font-bold text-white tracking-tight">{props.name}</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Puntos */}
        {props.points !== undefined && (
          <div className="mb-6 bg-linear-to-r from-yellow-500 to-orange-500 rounded-lg p-4">
            {/* OPTIMIZACIÓN ACCESIBILIDAD: text-gray-700 se cambia a text-gray-900 para garantizar contraste legible sobre el amarillo */}
            <p className="text-xs text-gray-950 font-bold tracking-wider">PUNTOS EN CAMPEONATO</p>
            <p className="text-3xl font-extrabold text-white mt-1">{props.points}</p>
          </div>
        )}

        {/* Pilotos */}
        <div>
          {/* OPTIMIZACIÓN ACCESIBILIDAD: Se usa h3 para la sección de pilotos manteniendo una escala lógica */}
          <h3 className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-3 tracking-wider uppercase">PILOTOS</h3>
          <div className="space-y-2">
            {props.drivers && props.drivers.length > 0 ? (
              props.drivers.map((driver, idx) => {
                const lastName = driver.last_name || '';
                const countryCode = fallbackDriverCountryCodes[lastName];

                return (
                  <div key={lastName || idx} className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-sm">
                    {/* OPTIMIZACIÓN RENDIMIENTO Y CLS:
                        - Envoltura del Image en un contenedor con tamaño estático estricto (h-4.5 w-6).
                        - Uso de fill y object-cover para evitar "Unsized image element". */}
                    <div className="relative w-6 h-4.5 overflow-hidden rounded-xs border border-gray-200 dark:border-gray-600 shrink-0">
                      {lastName && countryCode ? (
                        <Image 
                          src={`https://flagcdn.com/80x60/${countryCode}.png`}
                          alt={`Bandera de ${lastName}`}
                          fill
                          sizes="24px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xs" role="img" aria-label="Bandera global">🌐</span>
                      )}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {driver.first_name} {driver.last_name}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm italic">Sin pilotos registrados</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}