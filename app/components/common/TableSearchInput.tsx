'use client';

interface TableSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TableSearchInput({
  value,
  onChange,
  placeholder = 'Buscar por año, chasis, motor, piloto...',
}: TableSearchInputProps) {
  return (
    <div className="relative w-full sm:w-80">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2 pl-9 text-xs font-medium bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white placeholder-gray-400 transition"
      />
      <span className="absolute left-3 top-2.5 text-xs text-gray-400 pointer-events-none">
        🔍
      </span>
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  );
}