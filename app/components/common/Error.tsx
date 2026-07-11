'use client';

/**
 * Componente de Error reutilizable
 */
interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message = 'Error al cargar los datos', onRetry }: ErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-50">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-4xl">⚠️</div>
        <div>
          <p className="text-red-600 font-semibold">{message}</p>
          <p className="text-gray-500 text-sm mt-1">Por favor, intenta de nuevo más tarde</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  title = 'Sin datos',
  description = 'No hay información disponible',
  icon = '📭',
}: {
  title?: string;
  description?: string;
  icon?: string;
}) {
  return (
    <div className="flex items-center justify-center min-h-50">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-4xl">{icon}</div>
        <div>
          <p className="font-semibold text-gray-700">{title}</p>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
