"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function PageTransitionLoading() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Guardamos la ruta anterior para compararla durante el render
  const [prevPath, setPrevPath] = useState(pathname);
  const [prevSearch, setPrevSearch] = useState(searchParams?.toString() || "");

  const currentSearch = searchParams?.toString() || "";

  // 1. DERIVACIÓN DE ESTADO: Si cambió la ruta o los parámetros, apagamos el loader inmediatamente
  if (pathname !== prevPath || currentSearch !== prevSearch) {
    setPrevPath(pathname);
    setPrevSearch(currentSearch);
    setIsLoading(false);
  }

  // 2. EFECTO: Solo para interceptar clics en el DOM y encender el loading
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (
        anchor && 
        anchor.href && 
        anchor.target !== "_blank" &&
        !anchor.href.startsWith("mailto:") &&
        !anchor.href.startsWith("tel:")
      ) {
        const url = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);

        // Si es una navegación a una ruta interna distinta, activamos el loading
        if (
          url.origin === currentUrl.origin && 
          (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search)
        ) {
          setIsLoading(true);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => document.removeEventListener("click", handleAnchorClick, true);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-slate-900 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-slate-800">
        <svg
          className="animate-spin h-10 w-10 text-cyan-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-cyan-400 font-bold text-sm uppercase tracking-widest animate-pulse">Cargando...</span>
      </div>
    </div>
  );
}