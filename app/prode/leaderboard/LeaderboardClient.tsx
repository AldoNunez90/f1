// app/prode/leaderboard/LeaderboardClient.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import type { LeaderboardEntry, FullRacePrediction } from "@/lib/types/prode";
import type { RaceEvent } from "@/lib/data/calendar";
  import { ScoringRulesModal } from "@/app/components/ScoringRulesModal";
import { UserPredictionModal } from "@/app/components/UserPredictionModal";
import { getUserPredictionForRace } from "@/app/actions/prode";

interface Props {
  entries: LeaderboardEntry[];
  allRaces: RaceEvent[];
  currentRaceId: string;
}

export default function LeaderboardClient({ entries, allRaces, currentRaceId }: Props) {
  const [activeTab, setActiveTab] = useState<"oficial" | "caos">("oficial");
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [selectedRaceId, setSelectedRaceId] = useState(currentRaceId);

  // Estados para el modal de transparencia
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [userPrediction, setUserPrediction] = useState<FullRacePrediction | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);

  const sortedEntries = [...entries].sort((a, b) => {
    if (activeTab === "oficial") return b.officialPoints - a.officialPoints;
    return b.chaosPoints - a.chaosPoints;
  });

  const top3 = sortedEntries.slice(0, 3);

  const handleOpenUserPrediction = async (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
    setIsLoadingPrediction(true);
    try {
      const pred = await getUserPredictionForRace(userId, selectedRaceId);
      setUserPrediction(pred);
    } catch {
      setUserPrediction(null);
    } finally {
      setIsLoadingPrediction(false);
    }
  };

  const currentRaceName = allRaces.find((r) => r.raceId === selectedRaceId)?.raceName || selectedRaceId;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-10 max-w-5xl mx-auto space-y-6">
      
      
      {/* Header & Controles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black">Tabla de Posiciones</h1>
            <button
              onClick={() => setShowRulesModal(true)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold px-2.5 py-1 rounded-lg border border-slate-700 cursor-pointer"
            >
              ❓ Reglamento
            </button>
          </div>
          <p className="text-xs text-slate-400">Haz clic en cualquier usuario para inspeccionar sus apuestas.</p>
        </div>

        {/* Filtro por GP y Pestañas de Torneo */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <select
            value={selectedRaceId}
            onChange={(e) => setSelectedRaceId(e.target.value)}
            className="bg-slate-900 text-cyan-300 text-xs font-bold border border-slate-700 rounded-lg px-3 py-2 focus:outline-none"
          >
            {allRaces.map((race) => (
              <option key={race.raceId} value={race.raceId}>
                R{race.round}: {race.raceName}
              </option>
            ))}
          </select>

          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("oficial")}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                activeTab === "oficial" ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              🏆 Oficial
            </button>
            <button
              onClick={() => setActiveTab("caos")}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                activeTab === "caos" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              💥 Caos
            </button>
          </div>
        </div>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          Aún no hay puntos procesados para esta temporada.
        </div>
      ) : (
        <>
          {/* Podio Top 3 */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 items-end pt-6 pb-4">
            {top3[1] && (
              <div 
                onClick={() => handleOpenUserPrediction(top3[1].userId, top3[1].userName)}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 md:p-5 text-center space-y-2 flex flex-col items-center cursor-pointer hover:border-slate-700 transition-all"
              >
                <span className="text-2xl md:text-3xl">🥈</span>
                <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-slate-400 bg-slate-800">
                  {top3[1].userImage ? <Image src={top3[1].userImage} alt={top3[1].userName} fill className="object-cover" /> : top3[1].userName.charAt(0)}
                </div>
                <p className="font-bold text-xs text-white truncate max-w-25">{top3[1].userName}</p>
                <span className="text-base font-black text-cyan-400 font-mono">{activeTab === "oficial" ? top3[1].officialPoints : top3[1].chaosPoints} pts</span>
              </div>
            )}

            {top3[0] && (
              <div 
                onClick={() => handleOpenUserPrediction(top3[0].userId, top3[0].userName)}
                className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-4 md:p-6 text-center space-y-2 flex flex-col items-center -translate-y-3 shadow-lg cursor-pointer hover:border-amber-400 transition-all"
              >
                <span className="text-3xl md:text-4xl">👑</span>
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-amber-400 bg-slate-800">
                  {top3[0].userImage ? <Image src={top3[0].userImage} alt={top3[0].userName} fill className="object-cover" /> : top3[0].userName.charAt(0)}
                </div>
                <p className="font-black text-sm text-white truncate max-w-27.5">{top3[0].userName}</p>
                <span className="text-xl font-black text-amber-400 font-mono">{activeTab === "oficial" ? top3[0].officialPoints : top3[0].chaosPoints} pts</span>
              </div>
            )}

            {top3[2] && (
              <div 
                onClick={() => handleOpenUserPrediction(top3[2].userId, top3[2].userName)}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 md:p-5 text-center space-y-2 flex flex-col items-center cursor-pointer hover:border-slate-700 transition-all"
              >
                <span className="text-2xl md:text-3xl">🥉</span>
                <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-amber-800/60 bg-slate-800">
                  {top3[2].userImage ? <Image src={top3[2].userImage} alt={top3[2].userName} fill className="object-cover" /> : top3[2].userName.charAt(0)}
                </div>
                <p className="font-bold text-xs text-white truncate max-w-25">{top3[2].userName}</p>
                <span className="text-base font-black text-cyan-400 font-mono">{activeTab === "oficial" ? top3[2].officialPoints : top3[2].chaosPoints} pts</span>
              </div>
            )}
          </div>

          {/* Tabla General */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3.5 text-center w-12">Pos</th>
                  <th className="px-4 py-3.5">Piloto</th>
                  <th className="px-4 py-3.5 text-center">GPs</th>
                  {activeTab === "oficial" && <th className="px-4 py-3.5 text-center">⏱️ Bonus</th>}
                  <th className="px-4 py-3.5 text-right">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sortedEntries.map((entry, idx) => (
                  <tr 
                    key={entry.userId} 
                    onClick={() => handleOpenUserPrediction(entry.userId, entry.userName)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5 text-center font-bold text-slate-400 font-mono">#{idx + 1}</td>
                    <td className="px-4 py-3.5 font-medium text-white flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                        {entry.userImage ? <Image src={entry.userImage} alt={entry.userName} fill className="object-cover" /> : entry.userName.charAt(0)}
                      </div>
                      <span className="truncate">{entry.userName}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-slate-400">{entry.racesPredicted} GP</td>
                    {activeTab === "oficial" && (
                      <td className="px-4 py-3.5 text-center font-mono text-cyan-400">
                        {entry.telemetryWins > 0 ? `⚡ ${entry.telemetryWins}` : "-"}
                      </td>
                    )}
                    <td className="px-4 py-3.5 text-right font-mono font-black text-cyan-300">
                      {activeTab === "oficial" ? entry.officialPoints : entry.chaosPoints} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modales */}
      <ScoringRulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
      <UserPredictionModal 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
        userName={selectedUser?.name || ""}
        raceName={currentRaceName}
        prediction={userPrediction}
        isLoading={isLoadingPrediction}
      />
    </div>
  );
}