'use client';

interface CountryOption {
  id: string;     // ej: "argentina", "united-kingdom"
  name: string;   // ej: "Argentina", "Reino Unido"
}

interface CountrySelectorProps {
  currentCountry: string;
  countries: CountryOption[];
}

export function CountrySelector({ currentCountry, countries }: CountrySelectorProps) {
  return (
    <select
      name="country"
      id="pilotsCountry"
      defaultValue={currentCountry}
      onChange={(e) => e.target.form?.submit()}
      aria-label="Filtrar por país"
      className="px-3 py-2 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-800 font-semibold rounded-lg shadow-xs text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-hidden transition cursor-pointer"
    >
      <option value="all">Todas las nacionalidades</option>
      {countries.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}