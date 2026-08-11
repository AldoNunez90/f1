// app/prode/ProdeClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DRIVERS_LIST } from "@/lib/data/f1-catalog";
import { saveFullPrediction } from "@/app/actions/prode";
import type { FullRacePrediction } from "@/lib/types/prode";

// Definimos los props que nos envía el servidor (app/prode/page.tsx)
interface ScheduleProps {
  raceId: string;
  raceName: string;
  qualifyingLockout: string;
  mainRaceLockout: string;
}

interface Props {
  userId: string;
  schedule: ScheduleProps;
  isQualyOpen: boolean;
  isRaceOpen: boolean;
  initialData: FullRacePrediction | null;
  history: FullRacePrediction[];
}

// Función auxiliar para pasar los milisegundos de Mongo de vuelta a texto "M:SS.ms"
function formatMsToTime(ms?: number) {
  if (!ms) return "";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}

export default function ProdeClient({ userId, schedule, isQualyOpen, isRaceOpen, initialData, history }: Props) {
  const router = useRouter();
  // Si initialData existe (ya apostó), iniciamos en modo "vista". Si no, en modo "edición".
  const [isEditing, setIsEditing] = useState(!initialData);
  const [activeTab, setActiveTab] = useState<"oficial" | "telemetria" | "caos">("oficial");
  const [isSaving, setIsSaving] = useState(false);

  // Precargamos los estados con la base de datos (o vacíos si es la primera vez)
  const [poleDriver, setPoleDriver] = useState(initialData?.official?.qualifyingPoleDriverId || "");
  const [p1Driver, setP1Driver] = useState(initialData?.official?.mainPodium?.p1 || "");
  const [p2Driver, setP2Driver] = useState(initialData?.official?.mainPodium?.p2 || "");
  const [p3Driver, setP3Driver] = useState(initialData?.official?.mainPodium?.p3 || "");
  const [poleTime, setPoleTime] = useState(formatMsToTime(initialData?.telemetry?.poleTimeMillis));
  const [redFlags, setRedFlags] = useState(initialData?.chaos?.redFlagsCount || 0);
  const [dnfs, setDnfs] = useState(initialData?.chaos?.dnfCount || 0);

  // Verificamos repetidos
  const selectedPodium = [p1Driver, p2Driver, p3Driver].filter(Boolean);
  const hasDuplicates = new Set(selectedPodium).size !== selectedPodium.length;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const [min, secMs] = poleTime.split(":");
      const [sec, ms] = (secMs || "").split(".");
      const totalMs = (Number(min || 0) * 60 + Number(sec || 0)) * 1000 + Number(ms || 0);

      await saveFullPrediction(
        {
          raceId: schedule.raceId,
          userId: userId,
          official: {
            qualifyingPoleDriverId: poleDriver,
            mainPodium: { p1: p1Driver, p2: p2Driver, p3: p3Driver },
          },
          telemetry: { poleTimeMillis: totalMs },
          chaos: { redFlagsCount: redFlags, dnfCount: dnfs },
          updatedAt: new Date(),
        },
        schedule
      );
      
      alert("¡Predicciones guardadas correctamente!");
      setIsEditing(false); // Ocultamos el formulario
      router.refresh(); // Refrescamos los datos del servidor para actualizar el historial
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

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 max-w-5xl mx-auto space-y-12">
      
      {/* =========================================
          SECCIÓN 1: APUESTA DEL EVENTO ACTUAL
      ========================================= */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Próximo Evento • {schedule.raceName}
            </span>
            <h1 className="text-3xl font-black mt-1">Centro de Predicciones</h1>
          </div>

          {/* Botonera Superior (Solo se muestra en modo edición) */}
          {isEditing && (
            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              {initialData && (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-sm font-bold text-slate-400 hover:text-white"
                >
                  Cancelar edición
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || hasDuplicates}
                className="w-full md:w-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Guardando..." : "💾 Guardar Apuestas"}
              </button>
            </div>
          )}
        </div>

        {/* 
          LÓGICA CONDICIONAL: 
          Si está en modo edición, mostramos el formulario con las pestañas.
          Si NO está en edición, mostramos el resumen de lo que ya guardó. 
        */}
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
                    ⚠️ Tienes pilotos repetidos
                  </span>
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              {activeTab === "oficial" && (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">Poleman (Clasificación)</h3>
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
                      <h3 className="text-lg font-bold text-white">Podio de Carrera</h3>
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
                    {!isQualyOpen && <span className="text-xs text-red-400 font-bold bg-red-950/40 px-2 py-1 rounded">CERRADO</span>}
                  </div>
                  <p className="text-xs text-slate-400">
                    Récord de pista histórico: <span className="font-mono text-cyan-400">1:10.166</span>
                  </p>
                  <input
                    type="text"
                    placeholder="Ej: 1:11.450"
                    value={poleTime}
                    disabled={!isQualyOpen}
                    onChange={(e) => setPoleTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-lg focus:border-cyan-500 disabled:opacity-50"
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
              <h3 className="text-xl font-bold text-white mb-1">¡Apuesta registrada!</h3>
              <p className="text-sm text-slate-400">Tus predicciones para {schedule.raceName} están guardadas.</p>
            </div>
            
            {/* Solo mostramos el botón de Editar si alguna sesión sigue abierta */}
            {(isQualyOpen || isRaceOpen) ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all shadow-md whitespace-nowrap"
              >
                ✏️ Editar Apuesta
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
          SECCIÓN 2: HISTORIAL GENERAL
      ========================================= */}
      <section className="border-t border-slate-800 pt-12">
        <h2 className="text-2xl font-black mb-6">Tu Historial de Predicciones</h2>
        
        {history.length === 0 ? (
          <p className="text-slate-400 text-sm">Aún no tienes predicciones guardadas. ¡Haz tu primera apuesta arriba!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((pred) => (
              <div key={pred._id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-3">
                  {pred.raceId.replace("-", " ")}
                </p>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>🏎️ <span className="font-bold">Pole:</span> {pred.official?.qualifyingPoleDriverId || "-"}</p>
                  <p>🥇 <span className="font-bold">P1:</span> {pred.official?.mainPodium?.p1 || "-"}</p>
                  <p>🥈 <span className="font-bold">P2:</span> {pred.official?.mainPodium?.p2 || "-"}</p>
                  <p>🥉 <span className="font-bold">P3:</span> {pred.official?.mainPodium?.p3 || "-"}</p>
                  <p> <span>Banderas rojas: {pred.chaos?.redFlagsCount } </span></p>
                  <p> <span>DNF: {pred.chaos?.dnfCount } </span></p>
                  <p> <span>Tiempo de pole: {pred.telemetry.poleTimeMillis } </span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}