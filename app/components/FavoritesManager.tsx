"use client";

import { useState } from "react";
import Image from "next/image";
import { TEAMS, DRIVERS_LIST } from "@/lib/data/f1-catalog";
import { updateFavorites } from "@/app/actions/user";

interface Props {
  currentTeamId?: string;
  currentDriverId?: string;
}

export function FavoritesManager({ currentTeamId, currentDriverId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamId, setTeamId] = useState(currentTeamId || "");
  const [driverId, setDriverId] = useState(currentDriverId || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateFavorites(teamId, driverId);
      setIsOpen(false);
    } catch (error) {
      console.error("Error al guardar favoritos:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="mt-4 px-4 py-2 bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-400 text-sm font-bold rounded-lg border border-cyan-800/50 transition-colors cursor-pointer"
      >
        Editar Favoritos
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-xl font-black text-white">Configurar Garaje</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8">
              <div>
                <p className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">1. Escudería</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TEAMS.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => setTeamId(team.id)}
                      className={`p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer flex flex-col items-center justify-center h-20 bg-linear-to-br ${team.gradient} ${
                        teamId === team.id
                          ? "border-white ring-2 ring-white shadow-[0_0_15px_rgba(255,255,255,0.3)] opacity-100 scale-105"
                          : "border-slate-700/50 opacity-50 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      <span className="text-white drop-shadow-md text-center leading-tight">
                        {team.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">2. Piloto</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {DRIVERS_LIST.map((driver) => (
                    <button
                      key={driver.id}
                      onClick={() => setDriverId(driver.id)}
                      className={`relative aspect-square rounded-xl border transition-all overflow-hidden cursor-pointer ${
                        driverId === driver.id
                          ? "border-cyan-400 ring-2 ring-cyan-400 scale-105"
                          : "border-slate-700 hover:border-slate-500 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={driver.imageUrl}
                        alt={driver.lastName}
                        fill
                        sizes="100px"
                        className="object-cover object-top"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 p-1">
                        <p className="text-[10px] font-bold text-white text-center truncate">
                          {driver.lastName.toUpperCase()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 rounded-lg text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !teamId || !driverId}
                className="px-6 py-2 rounded-lg text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}