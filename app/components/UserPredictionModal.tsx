"use client";

import type { FullRacePrediction } from "@/lib/types/prode";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  raceName: string;
  prediction: FullRacePrediction | null;
  isLoading: boolean;
}

function formatMsToTime(ms?: number) {
  if (!ms || isNaN(ms)) return "-";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

export function UserPredictionModal({ isOpen, onClose, userName, raceName, prediction, isLoading }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{raceName}</span>
            <h3 className="text-lg font-black text-white">Apuesta de {userName}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Cargando predicción...</div>
        ) : !prediction ? (
          <div className="py-8 text-center text-slate-400 text-sm">Este usuario no envió predicción para este Gran Premio.</div>
        ) : (
          <div className="space-y-4 text-sm">
            {/* Sprint */}
            {(prediction.official?.sprintPoleDriverId || prediction.official?.sprintPodium?.p1) && (
              <div className="bg-slate-950/60 p-3 rounded-xl border border-purple-900/40 space-y-1.5">
                <span className="text-xs font-bold text-purple-400 uppercase">⚡ Evento Sprint</span>
                <p className="text-xs text-slate-300">
                  <span className="text-slate-400">Pole Sprint:</span> <strong className="text-white capitalize">{prediction.official.sprintPoleDriverId || "-"}</strong>
                </p>
                <p className="text-xs text-slate-300">
                  <span className="text-slate-400">Podio Sprint:</span> 🥇 {prediction.official.sprintPodium?.p1 || "-"} | 🥈 {prediction.official.sprintPodium?.p2 || "-"} | 🥉 {prediction.official.sprintPodium?.p3 || "-"}
                </p>
              </div>
            )}

            {/* Principal */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase">🏆 Evento Principal</span>
              <p className="text-xs text-slate-300">
                <span className="text-slate-400">Poleman:</span> <strong className="text-white capitalize">{prediction.official?.qualifyingPoleDriverId || "-"}</strong>
                <span className="text-cyan-400 font-mono ml-2">({formatMsToTime(prediction.telemetry?.poleTimeMillis)})</span>
              </p>
              <p className="text-xs text-slate-300">
                <span className="text-slate-400">Podio:</span> 🥇 {prediction.official?.mainPodium?.p1 || "-"} | 🥈 {prediction.official?.mainPodium?.p2 || "-"} | 🥉 {prediction.official?.mainPodium?.p3 || "-"}
              </p>
            </div>

            {/* Caos */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex justify-between text-xs text-slate-300">
              <span>🚩 Banderas Rojas: <strong className="text-white font-mono">{prediction.chaos?.redFlagsCount ?? 0}</strong></span>
              <span>💥 DNFs: <strong className="text-white font-mono">{prediction.chaos?.dnfCount ?? 0}</strong></span>
            </div>
          </div>
        )}

        <button onClick={onClose} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700">
          Cerrar
        </button>
      </div>
    </div>
  );
}