// app/prode/components/SuccessModal.tsx
"use client";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function SuccessModal({ isOpen, onClose, message = "¡Predicciones guardadas correctamente!" }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center space-y-5 transform transition-all scale-100">
        {/* Ícono de éxito animado */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-3xl shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          🏁
        </div>

        <div>
          <h3 className="text-xl font-black text-white">¡Apuesta Guardada!</h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all shadow-lg cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}