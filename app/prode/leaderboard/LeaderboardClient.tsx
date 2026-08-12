// app/prode/leaderboard/LeaderboardClient.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LeaderboardEntry } from "@/lib/types/prode";

interface Props {
  entries: LeaderboardEntry[];
}

export default function LeaderboardClient({ entries }: Props) {
  const [activeTab, setActiveTab] = useState<"oficial" | "caos">("oficial");

  // Ordenar lista según la pestaña activa
  const sortedEntries = [...entries].sort((a, b) => {
    if (activeTab === "oficial") {
      return b.officialPoints - a.officialPoints;
    }
    return b.chaosPoints - a.chaosPoints;
  });

  const top3 = sortedEntries.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-10 max-w-5xl mx-auto space-y-8">
      
      {/* Header & Navegación */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <Link 
            href="/prode" 
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest flex items-center gap-1 mb-1 transition-colors"
          >
            ← Volver a Predicciones
          </Link>
          <h1 className="text-3xl font-black">Tabla de Posiciones</h1>
        </div>

        {/* Control de Torneos */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab("oficial")}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all cursor-pointer ${
              activeTab === "oficial"
                ? "bg-cyan-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            🏆 Torneo Oficial
          </button>
          <button
            onClick={() => setActiveTab("caos")}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all cursor-pointer ${
              activeTab === "caos"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            💥 Desafío Caos
          </button>
        </div>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <p className="text-slate-400">Aún no hay puntos procesados para esta temporada.</p>
          <p className="text-xs text-slate-500">Los puntos se actualizarán automáticamente al finalizar cada Gran Premio.</p>
        </div>
      ) : (
        <>
          {/* =========================================
              SECCIÓN 1: PODIO TOP 3 (DISTRIBUCIÓN VISUAL)
          ========================================= */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 items-end pt-6 pb-4">
            {/* P2 - Segundo Lugar */}
            {top3[1] ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 md:p-5 text-center space-y-2 flex flex-col items-center">
                <span className="text-2xl md:text-3xl">🥈</span>
                <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-slate-400 bg-slate-800">
                  {top3[1].userImage ? (
                    <Image src={top3[1].userImage} alt={top3[1].userName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                      {top3[1].userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="font-bold text-xs md:text-sm text-white truncate max-w-25 md:max-w-35">
                  {top3[1].userName}
                </p>
                <span className="text-base md:text-xl font-black text-cyan-400 font-mono">
                  {activeTab === "oficial" ? top3[1].officialPoints : top3[1].chaosPoints} <span className="text-[10px] text-slate-400">pts</span>
                </span>
              </div>
            ) : <div />}

            {/* P1 - Primer Lugar */}
            {top3[0] && (
              <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-4 md:p-6 text-center space-y-2 flex flex-col items-center -translate-y-3 md:-translate-y-4 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
                <span className="text-3xl md:text-4xl animate-bounce">👑</span>
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-amber-400 bg-slate-800">
                  {top3[0].userImage ? (
                    <Image src={top3[0].userImage} alt={top3[0].userName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold text-2xl">
                      {top3[0].userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="font-black text-sm md:text-base text-white truncate max-w-27.5 md:max-w-40">
                  {top3[0].userName}
                </p>
                <span className="text-xl md:text-2xl font-black text-amber-400 font-mono">
                  {activeTab === "oficial" ? top3[0].officialPoints : top3[0].chaosPoints} <span className="text-xs text-slate-400">pts</span>
                </span>
              </div>
            )}

            {/* P3 - Tercer Lugar */}
            {top3[2] ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 md:p-5 text-center space-y-2 flex flex-col items-center">
                <span className="text-2xl md:text-3xl">🥉</span>
                <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-amber-800/60 bg-slate-800">
                  {top3[2].userImage ? (
                    <Image src={top3[2].userImage} alt={top3[2].userName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-amber-700 font-bold text-lg">
                      {top3[2].userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="font-bold text-xs md:text-sm text-white truncate max-w-25 md:max-w-35">
                  {top3[2].userName}
                </p>
                <span className="text-base md:text-xl font-black text-cyan-400 font-mono">
                  {activeTab === "oficial" ? top3[2].officialPoints : top3[2].chaosPoints} <span className="text-[10px] text-slate-400">pts</span>
                </span>
              </div>
            ) : <div />}
          </div>

          {/* =========================================
              SECCIÓN 2: TABLA GENERAL (RESTO DE PILOTOS)
          ========================================= */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3.5 text-center w-12">Pos</th>
                    <th scope="col" className="px-4 py-3.5">Piloto</th>
                    <th scope="col" className="px-4 py-3.5 text-center">GPs Apostados</th>
                    {activeTab === "oficial" && (
                      <th scope="col" className="px-4 py-3.5 text-center">⏱️ Bonus Telemetría</th>
                    )}
                    <th scope="col" className="px-4 py-3.5 text-right">Puntos Totales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sortedEntries.map((entry, idx) => (
                    <tr key={entry.userId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5 text-center font-bold text-slate-400 font-mono">
                        #{idx + 1}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-white flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                          {entry.userImage ? (
                            <Image src={entry.userImage} alt={entry.userName} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                              {entry.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="truncate max-w-37.5 md:max-w-none">{entry.userName}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono text-slate-400">
                        {entry.racesPredicted} GP
                      </td>
                      {activeTab === "oficial" && (
                        <td className="px-4 py-3.5 text-center font-mono text-cyan-400">
                          {entry.telemetryWins > 0 ? `⚡ ${entry.telemetryWins}` : "-"}
                        </td>
                      )}
                      <td className="px-4 py-3.5 text-right font-mono font-black text-base text-cyan-300">
                        {activeTab === "oficial" ? entry.officialPoints : entry.chaosPoints} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}