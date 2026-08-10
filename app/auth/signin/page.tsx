"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";


export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

const handleSignIn = async () => {
    try {
      setIsLoading(true);
      // Iniciamos sesión y redirigimos al perfil
      await signIn("google", { callbackUrl: "/perfil" });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setIsLoading(false); // Apagamos el loading para que el usuario pueda volver a intentar
    }
  };

  return (
    <div className="flex justify-center items-center ">
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-gray-800/50">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-[0_0_40px_rgba(8,145,178,0.1)]">
          
          {/* Encabezado */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-950 border border-slate-800 shadow-inner mb-6">
              <span className="text-3xl">
                <Image
                src={"/wheel.png"}
                alt="wheel f1"
                width={120}
                height={120}
                priority
                />
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-3">
              F1 Prode <span className="text-cyan-400">&</span> Stats
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Autentícate para armar tus predicciones, guardar tus escuderías favoritas y liderar el ranking.
            </p>
          </div>

          {/* Botón de Autenticación */}
          <div className="space-y-4">
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="group relative w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isLoading ? "Conectando al Paddock..." : "Continuar con Google"}</span>
            </button>
          </div>

          {/* Enlaces secundarios */}
          <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-wider"
            >
              ← Volver al sitio principal
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}