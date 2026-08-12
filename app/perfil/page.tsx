// app/perfil/page.tsx
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getLeaderboard } from "@/app/actions/scoring";
import { getCurrentOrNextRace } from "@/lib/data/calendar";
import { getPredictionForRace, getUserPredictionsCount } from "@/app/actions/prode";
import { ProdeNav } from "../components/ProdeNav";

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/perfil");
  }

  // Consultas en paralelo para optimizar la carga del servidor
  const [leaderboard, currentPrediction, actualRacesCount] = await Promise.all([
    getLeaderboard(),
    getPredictionForRace(getCurrentOrNextRace().raceId),
    getUserPredictionsCount(session.user.id),
  ]);

  const currentRace = getCurrentOrNextRace();

  // Posición del usuario actual en la Leaderboard
  const userRankIndex = leaderboard.findIndex(
    (e: { userId: string }) => e.userId === session.user.id
  );
  
  const userStats = leaderboard[userRankIndex] || {
    officialPoints: 0,
    chaosPoints: 0,
    telemetryWins: 0,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <ProdeNav />

      {/* Card de Usuario con Botón de Cerrar Sesión */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-400 bg-slate-800 shrink-0">
            {session.user.image ? (
              <Image src={session.user.image} alt={session.user.name || "Usuario"} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black text-cyan-400">
                {session.user.name?.charAt(0).toUpperCase() || "P"}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-black">{session.user.name}</h1>
            <p className="text-xs text-slate-400">{session.user.email}</p>
            <span className="inline-block mt-2 text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-3 py-1 rounded-full">
              Ranking General: {userRankIndex >= 0 ? `#${userRankIndex + 1}` : "Sin clasificar"}
            </span>
          </div>
        </div>

        {/* Botón Cerrar Sesión */}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="px-4 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          >
            Cerrar Sesión
          </button>
        </form>
      </div>

      {/* Métricas del Torneo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 font-bold block mb-1">Torneo Oficial</span>
          <span className="text-2xl font-black text-cyan-400 font-mono">{userStats.officialPoints} pts</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 font-bold block mb-1">Desafío Caos</span>
          <span className="text-2xl font-black text-amber-400 font-mono">{userStats.chaosPoints} pts</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 font-bold block mb-1">GPs Apostados</span>
          <span className="text-2xl font-black text-white font-mono">{actualRacesCount}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center">
          <span className="text-xs text-slate-400 font-bold block mb-1">Bonus Telemetría</span>
          <span className="text-2xl font-black text-purple-400 font-mono">{userStats.telemetryWins}</span>
        </div>
      </div>

      {/* Widget Estado Gran Premio Actual */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Próximo Evento</span>
            <h3 className="text-lg font-black text-white">{currentRace.raceName}</h3>
          </div>
          {currentPrediction ? (
            <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-bold">
              ✓ Apuesta enviada
            </span>
          ) : (
            <span className="text-xs bg-amber-950 text-amber-400 border border-amber-800 px-3 py-1 rounded-full font-bold">
              ⚠️ Pendiente
            </span>
          )}
        </div>

        <div className="flex justify-between items-center pt-2">
          <p className="text-xs text-slate-400">
            {currentPrediction ? "Tus predicciones están guardadas y listas." : "Aún no enviaste tus predicciones para este Gran Premio."}
          </p>
          <Link
            href="/prode"
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs transition-all"
          >
            {currentPrediction ? "Ver / Editar" : "Apostar ahora"}
          </Link>
        </div>
      </div>
    </div>
  );
}