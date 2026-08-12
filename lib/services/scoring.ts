// lib/services/scoring.ts
import type { FullRacePrediction } from "@/lib/types/prode";
import type { RaceResultSummary } from "@/lib/services/openf1";

export function calculatePredictionPoints(
  prediction: FullRacePrediction, 
  result: RaceResultSummary
) {
  let officialPoints = 0;
  let chaosPoints = 0;

  // --- TORNEO OFICIAL ---
  // 1. Pole Principal (3 pts)
  if (
    prediction.official?.qualifyingPoleDriverId &&
    result.qualifyingPoleDriverId &&
    prediction.official.qualifyingPoleDriverId.toLowerCase() === result.qualifyingPoleDriverId.toLowerCase()
  ) {
    officialPoints += 3;
  }

  // 2. Podio Principal
  if (prediction.official?.mainPodium && result.mainPodium) {
    const userPodium = [
      prediction.official.mainPodium.p1?.toLowerCase(), 
      prediction.official.mainPodium.p2?.toLowerCase(), 
      prediction.official.mainPodium.p3?.toLowerCase()
    ].filter(Boolean);

    const realPodium = [
      result.mainPodium.p1?.toLowerCase(), 
      result.mainPodium.p2?.toLowerCase(), 
      result.mainPodium.p3?.toLowerCase()
    ].filter(Boolean);

    userPodium.forEach((driver, index) => {
      if (!driver) return;
      if (driver === realPodium[index]) {
        officialPoints += 5; // Posición exacta
      } else if (realPodium.includes(driver)) {
        officialPoints += 2; // Estaba en el podio pero en otro puesto
      }
    });
  }

  // 3. Pole Sprint y Podio Sprint
  if (
    prediction.official?.sprintPoleDriverId && 
    result.sprintPoleDriverId &&
    prediction.official.sprintPoleDriverId.toLowerCase() === result.sprintPoleDriverId.toLowerCase()
  ) {
    officialPoints += 3;
  }

  if (prediction.official?.sprintPodium && result.sprintPodium) {
    const userSprint = [
      prediction.official.sprintPodium.p1?.toLowerCase(), 
      prediction.official.sprintPodium.p2?.toLowerCase(), 
      prediction.official.sprintPodium.p3?.toLowerCase()
    ].filter(Boolean);

    const realSprint = [
      result.sprintPodium.p1?.toLowerCase(), 
      result.sprintPodium.p2?.toLowerCase(), 
      result.sprintPodium.p3?.toLowerCase()
    ].filter(Boolean);

    userSprint.forEach((driver, index) => {
      if (!driver) return;
      if (driver === realSprint[index]) {
        officialPoints += 5;
      } else if (realSprint.includes(driver)) {
        officialPoints += 2;
      }
    });
  }

  // --- TORNEO CAOS ---
  // 1. Banderas Rojas (3 pts exacto, 1 pt por ±1)
  const userRedFlags = Number(prediction.chaos?.redFlagsCount);
  const realRedFlags = Number(result.redFlagsCount);

  if (!isNaN(userRedFlags) && !isNaN(realRedFlags)) {
    const diff = Math.abs(userRedFlags - realRedFlags);
    if (diff === 0) chaosPoints += 3;
    else if (diff === 1) chaosPoints += 1;
  }

  // 2. DNFs (3 pts exacto, 1 pt por ±1)
  const userDnfs = Number(prediction.chaos?.dnfCount);
  const realDnfs = Number(result.dnfCount);

  if (!isNaN(userDnfs) && !isNaN(realDnfs)) {
    const diff = Math.abs(userDnfs - realDnfs);
    if (diff === 0) chaosPoints += 3;
    else if (diff === 1) chaosPoints += 1;
  }

  return { officialPoints, chaosPoints };
}

export function assignTelemetryBonus(
  predictions: FullRacePrediction[], 
  realPoleTimeMs?: number
): Map<string, number> {
  const bonusMap = new Map<string, number>();

  if (!realPoleTimeMs || predictions.length === 0) {
    return bonusMap;
  }

  const validPredictions = predictions.filter(
    (p) => p.telemetry?.poleTimeMillis && Number(p.telemetry.poleTimeMillis) > 0
  );

  if (validPredictions.length === 0) return bonusMap;

  let minDifference = Infinity;

  validPredictions.forEach((p) => {
    const diff = Math.abs(Number(p.telemetry?.poleTimeMillis) - realPoleTimeMs);
    if (diff < minDifference) {
      minDifference = diff;
    }
  });

  validPredictions.forEach((p) => {
    const diff = Math.abs(Number(p.telemetry?.poleTimeMillis) - realPoleTimeMs);
    if (diff === minDifference) {
      bonusMap.set(p.userId, 3);
    }
  });

  return bonusMap;
}