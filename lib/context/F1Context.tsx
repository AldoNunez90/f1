"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// Tipamos lo que guardaremos en la memoria del contexto
interface F1ContextType {
  // Un diccionario/mapa indexado por clave (ej: "sessions-2026")
  cache: Record<string, unknown>;
  getCache: (key: string) => unknown | undefined;
  setCache: (key: string, data: unknown) => void;
}

const F1Context = createContext<F1ContextType | undefined>(undefined);

export function F1Provider({ children }: { children: ReactNode }) {
  const [cache, setCacheState] = useState<Record<string, unknown>>({});

  // Guardar datos en el almacén
  const setCache = useCallback((key: string, data: unknown) => {
    setCacheState((prev) => ({
      ...prev,
      [key]: data,
    }));
  }, []);

  // Leer datos del almacén
  const getCache = useCallback(
    (key: string) => {
      return cache[key];
    },
    [cache]
  );

  return (
    <F1Context.Provider value={{ cache, getCache, setCache }}>
      {children}
    </F1Context.Provider>
  );
}

// Hook personalizado para consumir el contexto fácilmente
export function useF1Context() {
  const context = useContext(F1Context);
  if (!context) {
    throw new Error("useF1Context debe ser usado dentro de un F1Provider");
  }
  return context;
}