// @/app/components/common/GridLoadingOverlay.tsx
export function GridLoadingOverlay() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
        Procesando y montando registros históricos...
      </p>
    </div>
  );
}