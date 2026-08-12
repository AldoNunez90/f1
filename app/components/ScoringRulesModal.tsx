// app/prode/components/ScoringRulesModal.tsx
"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ScoringRulesModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            📊 Reglamento de Puntajes
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
            🏆 Torneo Oficial
          </span>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex justify-between bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <span>Poleman (Principal / Sprint)</span>
              <strong className="text-cyan-400 font-mono">+3 pts</strong>
            </li>
            <li className="flex justify-between bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <span>Podio: Posición exacta (P1, P2 o P3)</span>
              <strong className="text-cyan-400 font-mono">+5 pts c/u</strong>
            </li>
            <li className="flex justify-between bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <span>Podio: En podio pero en otra posición</span>
              <strong className="text-cyan-400 font-mono">+2 pts c/u</strong>
            </li>
            <li className="flex justify-between bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <span>⚡ Bonus Telemetría (Tiempo de Pole más cercano)</span>
              <strong className="text-cyan-400 font-mono">+3 pts extra</strong>
            </li>
          </ul>
        </div>

        <div className="space-y-3 pt-2">
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
            💥 Desafío Caos
          </span>
          <ul className="text-xs text-slate-300 space-y-2">
            <li className="flex justify-between bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <span>Banderas Rojas / DNFs (Exacto)</span>
              <strong className="text-amber-400 font-mono">+3 pts c/u</strong>
            </li>
            <li className="flex justify-between bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <span>Banderas Rojas / DNFs (Margen ±1)</span>
              <strong className="text-amber-400 font-mono">+1 pt c/u</strong>
            </li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all cursor-pointer"
        >
          ¡Entendido!
        </button>
      </div>
    </div>
  );
}