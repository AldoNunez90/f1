// lib/services/openf1.ts

import { RaceEvent } from "@/lib/data/calendar";
import { normalizeDriverId } from "@/lib/data/drivers-mapping";

export interface RaceResultSummary {
  sprintPoleDriverId?: string;
  sprintPodium?: { p1: string; p2: string; p3: string };
  qualifyingPoleDriverId?: string;
  poleTimeMillis?: number;
  mainPodium?: { p1: string; p2: string; p3: string };
  redFlagsCount?: number;
  dnfCount?: number;
  isComplete: boolean;
}

const BASE_URL = "https://api.openf1.org/v1";

export async function fetchRaceResultsFromOpenF1(keys: RaceEvent["openF1Keys"], isSprint: boolean): Promise<RaceResultSummary | null> {
  try {
    // 1. POLE PRINCIPAL Y TIEMPO (starting_grid)
    const gridRes = await fetch(`${BASE_URL}/starting_grid?session_key=${keys.qualifyingSessionKey}`);
    const gridData = await gridRes.json();
    const polePosition = gridData.find((item: { position: number }) => item.position === 1);

    if (!polePosition) return null; // Si no hay grilla oficial aún, la sesión no cerró datos

    // 2. PODIO Y DNFS DE CARRERA PRINCIPAL (session_result)
    const resultRes = await fetch(`${BASE_URL}/session_result?session_key=${keys.mainRaceSessionKey}`);
    const resultData = await resultRes.json();
    
    if (!resultData || resultData.length === 0) return null;

    const p1 = resultData.find((r: { position: number }) => r.position === 1)?.driver_number?.toString();
    const p2 = resultData.find((r: { position: number }) => r.position === 2)?.driver_number?.toString();
    const p3 = resultData.find((r: { position: number }) => r.position === 3)?.driver_number?.toString();

    const dnfCount = resultData.filter((r: { dnf: boolean }) => r.dnf === true).length;

    // 3. BANDERAS ROJAS DE CARRERA PRINCIPAL (race_control)
    const controlRes = await fetch(`${BASE_URL}/race_control?session_key=${keys.mainRaceSessionKey}&flag=RED`);
    const controlData = await controlRes.json();
    const redFlagsCount = Array.isArray(controlData) ? controlData.length : 0;

    // 4. DATOS SPRINT (Opcional según si es Sprint Weekend)
    let sprintPoleDriverId: string | undefined;
    let sprintPodium: { p1: string; p2: string; p3: string } | undefined;

    if (isSprint && keys.sprintRaceSessionKey) {
      const sprintRes = await fetch(`${BASE_URL}/session_result?session_key=${keys.sprintRaceSessionKey}`);
      const sprintData = await sprintRes.json();

      if (sprintData && sprintData.length > 0) {
        sprintPodium = {
          p1: sprintData.find((r: { position: number }) => r.position === 1)?.driver_number?.toString() || "",
          p2: sprintData.find((r: { position: number }) => r.position === 2)?.driver_number?.toString() || "",
          p3: sprintData.find((r: { position: number }) => r.position === 3)?.driver_number?.toString() || "",
        };
      }

      if (keys.sprintShootoutSessionKey) {
        const sprintGridRes = await fetch(`${BASE_URL}/starting_grid?session_key=${keys.sprintShootoutSessionKey}`);
        const sprintGridData = await sprintGridRes.json();
        sprintPoleDriverId = sprintGridData.find((item: { position: number }) => item.position === 1)?.driver_number?.toString();
      }
    }

    return {
      qualifyingPoleDriverId: normalizeDriverId(polePosition.driver_number?.toString()),
  poleTimeMillis: polePosition.lap_duration ? Math.round(polePosition.lap_duration * 1000) : undefined,
  mainPodium: p1 && p2 && p3 ? {
    p1: normalizeDriverId(p1),
    p2: normalizeDriverId(p2),
    p3: normalizeDriverId(p3),
  } : undefined,
  redFlagsCount: typeof redFlagsCount === "number" ? redFlagsCount : 0,
  dnfCount: typeof dnfCount === "number" ? dnfCount : 0,
  sprintPoleDriverId: normalizeDriverId(sprintPoleDriverId),
  sprintPodium: sprintPodium ? {
    p1: normalizeDriverId(sprintPodium.p1),
    p2: normalizeDriverId(sprintPodium.p2),
    p3: normalizeDriverId(sprintPodium.p3),
  } : undefined,
  isComplete: true,
};
  } catch (error) {
    console.error("Error consultando OpenF1:", error);
    return null;
  }
}