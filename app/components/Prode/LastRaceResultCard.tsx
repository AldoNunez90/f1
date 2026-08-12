"use client";

import { F1_CALENDAR_2026 } from "@/lib/data/calendar";
import type { RaceResultSummary } from "@/lib/services/openf1";

interface Props {
  result: (RaceResultSummary & { raceId: string }) | null;
}

function formatMsToTime(ms?: number) {
  if (!ms || isNaN(ms)) return "-";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

export function LastRaceResultCard({ result }: Props) {
  if (!result) return null;

  const raceInfo = F1_CALENDAR_2026.find((r) => r.raceId === result.raceId);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
            🏁 Resultado Oficial
          </span>
          <h3 className="text-lg font-black text-white">
            {raceInfo?.raceName || result.raceId}
          </h3>
        </div>
        <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full uppercase">
          Finalizado
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Evento Sprint (Si hubo) */}
        {result.sprintPodium && (
          <div className="bg-slate-950/60 p-3 rounded-xl border border-purple-900/40 space-y-2">
            <span className="text-xs font-bold text-purple-400 uppercase">⚡ Evento Sprint</span>
            <p className="text-slate-300">
              <span className="text-slate-400">Pole Sprint:</span>{" "}
              <strong className="text-white capitalize">{result.sprintPoleDriverId || "-"}</strong>
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400 capitalize">Podio Sprint:</span> 🥇 {result.sprintPodium.p1} | 🥈 {result.sprintPodium.p2} | 🥉 {result.sprintPodium.p3}
            </p>
          </div>
        )}

        {/* Evento Principal */}
        <div className={`bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2 ${!result.sprintPodium ? "md:col-span-2" : ""}`}>
          <span className="text-xs font-bold text-cyan-400 uppercase">🏆 Carrera Principal</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <p className="text-slate-300">
              <span className="text-slate-400">Poleman:</span>{" "}
              <strong className="text-white capitalize">{result.qualifyingPoleDriverId || "-"}</strong>
              <span className="text-cyan-400 font-mono ml-1.5">
                ({formatMsToTime(result.poleTimeMillis)})
              </span>
            </p>
            <p className="text-slate-300 capitalize">
              <span className="text-slate-400">Podio:</span> 🥇 {result.mainPodium?.p1 || "-"} | 🥈 {result.mainPodium?.p2 || "-"} | 🥉 {result.mainPodium?.p3 || "-"}
            </p>
          </div>
          <div className="border-t border-slate-800/80 pt-2 flex gap-4 text-slate-400 text-[11px]">
            <span>🚩 Banderas Rojas: <strong className="text-white font-mono">{result.redFlagsCount ?? 0}</strong></span>
            <span>💥 DNFs: <strong className="text-white font-mono">{result.dnfCount ?? 0}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}