"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

export function ProdeNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Guardamos la ruta o parámetros objetivo en los que el usuario hizo clic
  const [loadingHref, setLoadingHref] = useState<string | null>(null);

  // Construimos la URL completa actual para comparar de forma precisa
  const fullCurrentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  // Si la ruta o parámetros ya coinciden con el destino, no hay carga pendiente
  const activeLoading = loadingHref === fullCurrentPath ? null : loadingHref;

  const navItems = [
    { href: "/prode", label: "Mi Prode" },
    { href: "/prode/leaderboard", label: "🏆 Tabla General" },
    { href: "/perfil", label: "👤 Mi Perfil" },
  ];

  return (
    <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-full max-w-md mx-auto shadow-lg mb-8">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const isLoading = activeLoading === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (!isActive) {
                setLoadingHref(item.href);
              }
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 text-center py-2.5 px-3 rounded-xl font-bold text-xs md:text-sm transition-all ${
              isActive
                ? "bg-cyan-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            } ${isLoading ? "opacity-80 pointer-events-none" : ""}`}
          >
            {isLoading && (
              <svg
                className="animate-spin h-3.5 w-3.5 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}