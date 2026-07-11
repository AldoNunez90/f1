'use client';

/**
 * Componente de Loading reutilizable
 */
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 animate-spin"></div>
        </div>
        <p className="text-gray-500 text-sm">Cargando datos...</p>
      </div>
    </div>
  );
}

export function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
      ))}
    </div>
  );
}
