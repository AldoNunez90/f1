"use client";

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
        <div
          key={i}
          className="bg-gray-200 rounded-lg h-80 animate-pulse"
        ></div>
      ))}
    </div>
  );
}

export function LoadingTab() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden min-h-125">
      <div className=" gap-4">
        <div className="overflow-x-auto w-full">
          <div className="bg-black p-3 sm:p-6 rounded-2xl border-4 sm:border-8 border-zinc-950 shadow-2xl min-w-150 font-mono">
            <table
              className="w-full text-cyan-400 border-separate"
              style={{ borderSpacing: "0 8px" }}
            >
              <thead>
                <tr className="text-zinc-500 text-xs tracking-widest uppercase">
                  <th
                    scope="col"
                    className="pb-1 text-center pl-2 w-[10%]"
                  ></th>
                  <th scope="col" className="pb-1 text-left pl-4 w-[50%]"></th>
                  <th scope="col" className="pb-1 text-right pr-4 w-[20%]"></th>
                  <th scope="col" className="pb-1 text-right pr-4 w-[20%]"></th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 22 }).map((_, i) => (
                  <tr
                    key={i}
                    className="bg-zinc-900 text-lg sm:text-2xl md:text-3xl uppercase font-bold tracking-wider transition-colors hover:bg-zinc-800/80 animate-pulse"
                  >
                    {/* OPTIMIZACIÓN ACCESIBILIDAD SEMÁNTICA: scope="row" en el identificador */}
                    <td className="h-14 py-2 sm:py-3 text-center rounded-l-xl border-y-2 border-l-2 border-zinc-950 text-white bg-zinc-950/40 font-black"></td>
                    <td className="h-14 py-2 sm:py-3 pl-4 border-y-2 border-zinc-950 truncate max-w-70"></td>
                    <td className="h-14 py-2 sm:py-3 pr-4 border-y-2 border-zinc-950 text-right text-white"></td>
                    <td className="h-14 py-2 sm:py-3 pr-4 rounded-r-xl border-y-2 border-r-2 border-zinc-950 text-right text-emerald-400"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
