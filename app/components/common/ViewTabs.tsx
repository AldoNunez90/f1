'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface TabOption {
  id: string;
  label: string;
}

interface ViewTabsProps {
  tabs: TabOption[];
  currentView: string;
  basePath: string; // Ej: "/drivers" o "/teams"
}

export function ViewTabs({ tabs, currentView, basePath }: ViewTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [loadingTab, setLoadingTab] = useState<string | null>(null);

  const handleTabClick = (tabId: string) => {
    if (tabId === currentView || isPending) return;

    setLoadingTab(tabId);

    const params = new URLSearchParams(searchParams.toString());
    params.set('view', tabId);

    startTransition(() => {
      router.push(`${basePath}?${params.toString()}`);
    });
  };

  // Solo consideramos "pesada" la vista de histórico completo
  const isHeavyLoading = isPending && loadingTab === 'all';

  return (
    <>
      {/* Botones de Control de Vista */}
      <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex items-center border border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const isActive = tab.id === currentView;
          const isThisTabPending = isPending && loadingTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              disabled={isPending}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              } ${isThisTabPending ? 'opacity-60 cursor-wait' : ''}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overlay Centrado Exclusivo para el Histórico Completo */}
      {isHeavyLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 px-6 py-5 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                Cargando registro histórico...
              </p>
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                Procesando datos del archivo
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}