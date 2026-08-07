"use client";

import { useState, useMemo } from "react";
import { CircuitAnimation } from "../circuits/CircuitAnimation";
import { circuitsPaths } from "@/lib/data/circuitsPaths";

export default function CircuitPathTester() {
  const [search, setSearch] = useState("");
  const [duration, setDuration] = useState("8s");

  // Filtrar claves de trazados locales por término de búsqueda
  const circuitKeys = useMemo(() => {
    const allKeys = Object.keys(circuitsPaths);
    if (!search.trim()) return allKeys;

    const term = search.toLowerCase().trim();
    return allKeys.filter((key) => key.toLowerCase().includes(term));
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10 text-white space-y-8">
      {/* Header & Controles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-cyan-400">
            Inspector de Circuitos (Datos Locales)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visualizando {circuitKeys.length} de {Object.keys(circuitsPaths).length} circuitos configurados
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Selector de velocidad */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Velocidad:</span>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="bg-transparent text-sm font-bold text-cyan-400 outline-none cursor-pointer"
            >
              <option value="4s" className="bg-slate-900 text-white">Rápido (4s)</option>
              <option value="8s" className="bg-slate-900 text-white">Normal (8s)</option>
              <option value="15s" className="bg-slate-900 text-white">Lento (15s)</option>
            </select>
          </div>

          {/* Buscador */}
          <input
            type="text"
            placeholder="Buscar por slug (ej: spa, monaco...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors w-full md:w-64"
          />
        </div>
      </div>

      {/* Grid de Circuitos */}
      {circuitKeys.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {circuitKeys.map((slug) => {
            return (
              <div
                key={slug}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
              >
                {/* Contenedor SVG */}
                <div className="h-44 w-full bg-slate-950 rounded-xl border border-slate-800/80 p-2 flex items-center justify-center overflow-hidden">
                  <CircuitAnimation
                    slug={slug}
                    circuitName={slug}
                    duration={duration}
                  />
                </div>

                {/* Meta Info */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-800/30 capitalize">
                    {slug.replace("-", " ")}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Source: circuitsPaths
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800">
          <p className="text-slate-400 text-base">
            No se encontraron trazados que coincidan con <span className="text-cyan-400 font-mono">{search}</span>.
          </p>
        </div>
      )}
    </div>
  );
}