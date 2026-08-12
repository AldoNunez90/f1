// app/prode/ProdeClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DRIVERS_LIST } from "@/lib/data/f1-catalog";
import { saveFullPrediction } from "@/app/actions/prode";
import type { FullRacePrediction } from "@/lib/types/prode";
import type { RaceEvent } from "@/lib/data/calendar";
import { PoleTimeInput } from "@/app/components/Prode/PoleTimeInput";
import { SuccessModal } from "../components/Prode/SuccessModal";
import { ProdeNav } from "@/app/components/ProdeNav";
import { getFastestLapForRace } from "@/lib/utils/circuitUtils";

interface ScheduleProps {
  raceId: string;
  raceName: string;
  isSprintWeekend?: boolean;
  qualifyingSprintLockout?: string;
  mainRaceSprintLockout?: string;
  qualifyingLockout: string;
  mainRaceLockout: string;
  circuitName: string;
}

interface Props {
  userId: string;
  schedule: ScheduleProps;
  isQualyOpen: boolean;
  isRaceOpen: boolean;
  isSprintQualyOpen?: boolean;
  isSprintRaceOpen?: boolean;
  initialData: FullRacePrediction | null;
  history: FullRacePrediction[];
  allRaces: RaceEvent[];
}

function formatMsToTime(ms?: number) {
  if (!ms || isNaN(ms)) return "-";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

export default function ProdeClient({ 
  userId, 
  schedule, 
  allRaces, 
  isQualyOpen, 
  isRaceOpen, 
  isSprintQualyOpen = false,
  isSprintRaceOpen = false,
  initialData, 
  history 
}: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(!initialData);
  const [activeTab, setActiveTab] = useState<"oficial" | "telemetria" | "caos">("oficial");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Estados del Formulario - Sprint
  const [sprintPoleDriver, setSprintPoleDriver] = useState(initialData?.official?.sprintPoleDriverId || "");
  const [sprintP1, setSprintP1] = useState(initialData?.official?.sprintPodium?.p1 || "");
  const [sprintP2, setSprintP2] = useState(initialData?.official?.sprintPodium?.p2 || "");
  const [sprintP3, setSprintP3] = useState(initialData?.official?.sprintPodium?.p3 || "");

  // Estados del Formulario - Evento Principal
  const [poleDriver, setPoleDriver] = useState(initialData?.official?.qualifyingPoleDriverId || "");
  const [p1Driver, setP1Driver] = useState(initialData?.official?.mainPodium?.p1 || "");
  const [p2Driver, setP2Driver] = useState(initialData?.official?.mainPodium?.p2 || "");
  const [p3Driver, setP3Driver] = useState(initialData?.official?.mainPodium?.p3 || "");
  const [poleTimeMs, setPoleTimeMs] = useState<number>(initialData?.telemetry?.poleTimeMillis || 0);
  const [redFlags, setRedFlags] = useState(initialData?.chaos?.redFlagsCount || 0);
  const [dnfs, setDnfs] = useState(initialData?.chaos?.dnfCount || 0);



  const fastestLapText = getFastestLapForRace(schedule.circuitName, schedule.raceName);

  // Validación de duplicados en podios
  const mainPodium = [p1Driver, p2Driver, p3Driver].filter(Boolean);
  const hasMainDuplicates = new Set(mainPodium).size !== mainPodium.length;

  const sprintPodium = [sprintP1, sprintP2, sprintP3].filter(Boolean);
  const hasSprintDuplicates = new Set(sprintPodium).size !== sprintPodium.length;

  const hasDuplicates = hasMainDuplicates || (schedule.isSprintWeekend && hasSprintDuplicates);

  const sortedHistory = [...history].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveFullPrediction(
        {
          raceId: schedule.raceId,
          userId: userId,
          official: {
            sprintPoleDriverId: sprintPoleDriver,
            sprintPodium: { p1: sprintP1, p2: sprintP2, p3: sprintP3 },
            qualifyingPoleDriverId: poleDriver,
            mainPodium: { p1: p1Driver, p2: p2Driver, p3: p3Driver },
          },
          telemetry: { poleTimeMillis: poleTimeMs },
          chaos: { redFlagsCount: redFlags, dnfCount: dnfs },
          updatedAt: new Date(),
        },
        schedule
      );
      
      setShowSuccessModal(true);
      setIsEditing(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Ocurrió un error inesperado al guardar.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 max-w-5xl mx-auto space-y-12">
      <ProdeNav />
      
      {/* =========================================
          SECCIÓN 1: PREDICCIÓN DEL EVENTO ACTUAL
      ========================================= */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            {/* Selector Dinámico de Grandes Premios */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
                Gran Premio:
              </span>
              <select
                value={schedule.raceId}
                onChange={(e) => router.push(`/prode?raceId=${e.target.value}`)}
                className="bg-slate-900 text-cyan-300 text-xs font-bold border border-slate-700 rounded-lg px-2 py-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {allRaces.map((race) => (
                  <option key={race.raceId} value={race.raceId}>
                    R{race.round}: {race.raceName}
                  </option>
                ))}
              </select>
            </div>

            <h1 className="text-3xl font-black mt-1">{schedule.raceName}</h1>
          </div>

          {/* Botonera Superior (Solo en modo edición) */}
          {isEditing && (
            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              {initialData && (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-sm font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar edición
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || hasDuplicates}
                className="w-full md:w-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Guardando..." : "💾 Guardar predicción"}
              </button>
            </div>
          )}
        </div>

        {/* Formulario o Card de Confirmación */}
        {isEditing ? (
          <div className="space-y-6">
            <div className="flex justify-between border-b border-slate-800 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {(
                  [
                    { id: "oficial", label: "🏆 Torneo Oficial" },
                    { id: "telemetria", label: "⏱️ Telemetría" },
                    { id: "caos", label: "💥 Desafío Caos" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-3 font-bold text-sm rounded-t-xl transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-slate-900 text-cyan-400 border-t border-x border-slate-800"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {hasDuplicates && (
                <div className="flex items-center">
                  <span className="text-xs font-bold text-red-400 bg-red-950/40 px-3 py-1.5 rounded-md border border-red-900/50">
                    ⚠️ Tienes pilotos repetidos en un podio
                  </span>
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              {activeTab === "oficial" && (
                <div className="space-y-6">
                  {/* SECCIÓN SPRINT (Solo si es Sprint Weekend) */}
                  {schedule.isSprintWeekend && (
                    <div className="bg-slate-950/60 p-5 rounded-xl border border-purple-900/50 space-y-6">
                      <div className="flex justify-between items-center border-b border-purple-900/30 pb-3">
                        <span className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                          ⚡ Fin de semana Sprint
                        </span>
                      </div>

                      {/* Sprint Pole */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-bold text-white">Poleman Sprint</label>
                          {!isSprintQualyOpen && (
                            <span className="text-xs text-red-400 font-bold bg-red-950/40 px-2 py-0.5 rounded">CERRADO</span>
                          )}
                        </div>
                        <select
                          value={sprintPoleDriver}
                          onChange={(e) => setSprintPoleDriver(e.target.value)}
                          disabled={!isSprintQualyOpen}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white disabled:opacity-50 focus:border-purple-500"
                        >
                          <option value="">Selecciona piloto...</option>
                          {DRIVERS_LIST.map((d) => (
                            <option key={d.id} value={d.id}>{d.lastName.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>

                      {/* Podio Sprint */}
                      <div className="border-t border-purple-900/30 pt-4">
                        <div className="flex justify-between mb-3">
                          <label className="text-sm font-bold text-white">Podio Carrera Sprint</label>
                          {!isSprintRaceOpen && (
                            <span className="text-xs text-red-400 font-bold bg-red-950/40 px-2 py-0.5 rounded">CERRADO</span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            { label: "🥇 P1 Sprint", state: sprintP1, setter: setSprintP1 },
                            { label: "🥈 P2 Sprint", state: sprintP2, setter: setSprintP2 },
                            { label: "🥉 P3 Sprint", state: sprintP3, setter: setSprintP3 },
                          ].map((pos, idx) => (
                            <div key={idx}>
                              <label className="text-xs text-slate-400 font-bold block mb-1">{pos.label}</label>
                              <select
                                value={pos.state}
                                onChange={(e) => pos.setter(e.target.value)}
                                disabled={!isSprintRaceOpen}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white disabled:opacity-50 focus:border-purple-500"
                              >
                                <option value="">Selecciona piloto...</option>
                                {DRIVERS_LIST.map((d) => (
                                  <option key={d.id} value={d.id}>{d.lastName.toUpperCase()}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN PRINCIPAL */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">Poleman (Clasificación Principal)</h3>
                      {!isQualyOpen && <span className="text-xs text-red-400 font-bold bg-red-950/40 px-2 py-1 rounded">CERRADO</span>}
                    </div>
                    <select
                      value={poleDriver}
                      onChange={(e) => setPoleDriver(e.target.value)}
                      disabled={!isQualyOpen}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 disabled:opacity-50"
                    >
                      <option value="">Selecciona un piloto...</option>
                      {DRIVERS_LIST.map((d) => (
                        <option key={d.id} value={d.id}>{d.lastName.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div className="border-t border-slate-800 pt-6">
                    <div className="flex justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Podio de Carrera Principal</h3>
                      {!isRaceOpen && <span className="text-xs text-red-400 font-bold bg-red-950/40 px-2 py-1 rounded">CERRADO</span>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: "🥇 P1 (Ganador)", state: p1Driver, setter: setP1Driver },
                        { label: "🥈 P2 (Segundo)", state: p2Driver, setter: setP2Driver },
                        { label: "🥉 P3 (Tercero)", state: p3Driver, setter: setP3Driver },
                      ].map((pos, idx) => (
                        <div key={idx}>
                          <label className="text-xs text-slate-400 font-bold block mb-1">{pos.label}</label>
                          <select
                            value={pos.state}
                            onChange={(e) => pos.setter(e.target.value)}
                            disabled={!isRaceOpen}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 disabled:opacity-50"
                          >
                            <option value="">Selecciona piloto...</option>
                            {DRIVERS_LIST.map((d) => (
                              <option key={d.id} value={d.id}>{d.lastName.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "telemetria" && (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-bold text-white">Tiempo Estimado de Pole</h3>
                    {!isQualyOpen && (
                      <span className="text-xs text-red-400 font-bold bg-red-950/40 px-2 py-1 rounded">
                        CERRADO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Récord de pista histórico:{" "}
                    <span className="font-mono text-cyan-400 font-bold">{fastestLapText}</span>
                  </p>

                  <PoleTimeInput
                    initialMs={poleTimeMs}
                    disabled={!isQualyOpen}
                    onChange={(totalMs) => setPoleTimeMs(totalMs)}
                  />
                </div>
              )}

              {activeTab === "caos" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-bold text-white flex justify-between mb-2">
                      Banderas Rojas
                      {!isRaceOpen && <span className="text-xs text-red-400 font-bold bg-red-950/40 px-2 py-1 rounded">CERRADO</span>}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={redFlags}
                      disabled={!isRaceOpen}
                      onChange={(e) => setRedFlags(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-cyan-500 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-white flex justify-between mb-2">
                      Abandonos (DNFs)
                      {!isRaceOpen && <span className="text-xs text-red-400 font-bold bg-red-950/40 px-2 py-1 rounded">CERRADO</span>}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={dnfs}
                      disabled={!isRaceOpen}
                      onChange={(e) => setDnfs(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono focus:border-cyan-500 disabled:opacity-50"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-cyan-900/50 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">¡Todo listo!</h3>
              <p className="text-sm text-slate-400">Tus predicciones para {schedule.raceName} están guardadas.</p>
            </div>
            
            {(isQualyOpen || isRaceOpen || isSprintQualyOpen || isSprintRaceOpen) ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all shadow-md whitespace-nowrap cursor-pointer"
              >
                ✏️ Editar
              </button>
            ) : (
              <div className="px-6 py-2 bg-slate-950 text-slate-500 font-bold rounded-xl border border-slate-800 flex items-center gap-2 whitespace-nowrap">
                🔒 Evento Cerrado
              </div>
            )}
          </div>
        )}
      </section>

      {/* =========================================
          SECCIÓN 2: HISTORIAL GENERAL DE PREDICCIONES
      ========================================= */}
      <section className="border-t border-slate-800 pt-12 space-y-6">
        <h2 className="text-2xl font-black">Historial de Predicciones</h2>

        {sortedHistory.length === 0 ? (
          <p className="text-slate-400 text-sm">Aún no tienes predicciones guardadas.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sortedHistory.map((pred) => {
              const raceInfo = allRaces.find((r) => r.raceId === pred.raceId);
              const isSprint = raceInfo?.isSprintWeekend;

              return (
                <div 
                  key={pred._id} 
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
                >
                  {/* Encabezado del Evento */}
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                        R{raceInfo?.round || "-"}: {raceInfo?.circuitName}
                      </span>
                      <h3 className="text-lg font-black text-white">{raceInfo?.raceName || pred.raceId}</h3>
                    </div>
                    {isSprint && (
                      <span className="text-[10px] font-black bg-purple-950 text-purple-300 border border-purple-800/60 px-2.5 py-1 rounded-full uppercase">
                        ⚡ Sprint Weekend
                      </span>
                    )}
                  </div>

                  {/* Bloques de Sesiones Independientes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Bloque 1: Sesión Sprint (Solo si aplica) */}
                    {isSprint && (
                      <div className="bg-slate-950/60 border border-purple-900/40 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center border-b border-purple-900/20 pb-2">
                          <span className="text-xs font-bold text-purple-400 uppercase">⚡ Evento Sprint</span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-slate-400 block">Pole Sprint:</span>
                            <span className="font-bold text-white capitalize">{pred.official?.sprintPoleDriverId || "-"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Podio Sprint:</span>
                            <div className="font-medium text-slate-200 mt-0.5 capitalize">
                              🥇 {pred.official?.sprintPodium?.p1 || "-"} | 🥈 {pred.official?.sprintPodium?.p2 || "-"} | 🥉 {pred.official?.sprintPodium?.p3 || "-"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bloque 2: Sesión Principal (Clasificación + Carrera + Caos) */}
                    <div className={`bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3 ${!isSprint ? "md:col-span-2" : ""}`}>
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-cyan-400 uppercase">🏆 Evento Principal</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block">Poleman:</span>
                          <span className="font-bold text-white capitalize">{pred.official?.qualifyingPoleDriverId || "-"}</span>
                          <span className="text-slate-500 text-[10px] block font-mono">
                            {formatMsToTime(pred.telemetry?.poleTimeMillis)}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block">Podio Principal:</span>
                          <div className="font-medium text-slate-200 mt-0.5 capitalize">
                            🥇 {pred.official?.mainPodium?.p1 || "-"} | 🥈 {pred.official?.mainPodium?.p2 || "-"} | 🥉 {pred.official?.mainPodium?.p3 || "-"}
                          </div>
                        </div>

                        <div className="sm:col-span-2 border-t border-slate-800/60 pt-2 flex gap-4 text-slate-400 text-[11px]">
                          <span>B. Rojas: <strong className="text-white font-mono">{pred.chaos?.redFlagsCount ?? 0}</strong></span>
                          <span>DNFs: <strong className="text-white font-mono">{pred.chaos?.dnfCount ?? 0}</strong></span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal de Éxito */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}