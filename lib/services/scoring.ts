// lib/services/scoring.ts

import type { FullRacePrediction } from "@/lib/types/prode";
import type { RaceResultSummary } from "@/lib/services/openf1";

// 1. Cálculo individual por predicción (Pole, Podios y Caos)
export function calculatePredictionPoints(
  prediction: FullRacePrediction, 
  result: RaceResultSummary
) {
  let officialPoints = 0;
  let chaosPoints = 0;

  // --- TORNEO OFICIAL ---
  // Pole Principal (3 pts)
  if (prediction.official?.qualifyingPoleDriverId && prediction.official.qualifyingPoleDriverId === result.qualifyingPoleDriverId) {
    officialPoints += 3;
  }

  // Podio Principal (5 pts exacto, 2 pts si termina en podio en otra posición)
  if (prediction.official?.mainPodium && result.mainPodium) {
    const userPodium = [prediction.official.mainPodium.p1, prediction.official.mainPodium.p2, prediction.official.mainPodium.p3];
    const realPodium = [result.mainPodium.p1, result.mainPodium.p2, result.mainPodium.p3];

    userPodium.forEach((driver, index) => {
      if (driver === realPodium[index]) {
        officialPoints += 5;
      } else if (realPodium.includes(driver)) {
        officialPoints += 2;
      }
    });
  }

  // Pole Sprint y Podio Sprint
  if (prediction.official?.sprintPoleDriverId && prediction.official.sprintPoleDriverId === result.sprintPoleDriverId) {
    officialPoints += 3;
  }

  if (prediction.official?.sprintPodium && result.sprintPodium) {
    const userSprintPodium = [prediction.official.sprintPodium.p1, prediction.official.sprintPodium.p2, prediction.official.sprintPodium.p3];
    const realSprintPodium = [result.sprintPodium.p1, result.sprintPodium.p2, result.sprintPodium.p3];

    userSprintPodium.forEach((driver, index) => {
      if (driver === realSprintPodium[index]) {
        officialPoints += 5;
      } else if (realSprintPodium.includes(driver)) {
        officialPoints += 2;
      }
    });
  }

  // --- TORNEO CAOS ---
  // Banderas Rojas (3 pts exacto, 1 pt por ±1)
  if (prediction.chaos?.redFlagsCount !== undefined && result.redFlagsCount !== undefined) {
    const diff = Math.abs(prediction.chaos.redFlagsCount - result.redFlagsCount);
    if (diff === 0) chaosPoints += 3;
    else if (diff === 1) chaosPoints += 1;
  }

  // DNFs (3 pts exacto, 1 pt por ±1)
  if (prediction.chaos?.dnfCount !== undefined && result.dnfCount !== undefined) {
    const diff = Math.abs(prediction.chaos.dnfCount - result.dnfCount);
    if (diff === 0) chaosPoints += 3;
    else if (diff === 1) chaosPoints += 1;
  }

  return { officialPoints, chaosPoints };
}

// 2. Cálculo global del Bonus de Telemetría (Cercanía de tiempo de pole)
export function assignTelemetryBonus(
  predictions: FullRacePrediction[], 
  realPoleTimeMs?: number
): Map<string, number> {
  const bonusMap = new Map<string, number>();

  if (!realPoleTimeMs || predictions.length === 0) {
    return bonusMap;
  }

  // Filtrar predicciones con tiempo cargado
  const validPredictions = predictions.filter(
    (p) => p.telemetry?.poleTimeMillis && p.telemetry.poleTimeMillis > 0
  );

  if (validPredictions.length === 0) return bonusMap;

  // Encontrar la menor diferencia absoluta
  let minDifference = Infinity;

  validPredictions.forEach((p) => {
    const diff = Math.abs((p.telemetry?.poleTimeMillis || 0) - realPoleTimeMs);
    if (diff < minDifference) {
      minDifference = diff;
    }
  });

  // Asignar 3 puntos extra a todos los que hayan logrado la menor diferencia
  validPredictions.forEach((p) => {
    const diff = Math.abs((p.telemetry?.poleTimeMillis || 0) - realPoleTimeMs);
    if (diff === minDifference) {
      bonusMap.set(p.userId, 3);
    }
  });

  return bonusMap;
}