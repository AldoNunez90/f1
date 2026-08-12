// app/actions/scoring.ts
"use server";

import clientPromise from "@/lib/mongodb";
import { F1_CALENDAR_2026 } from "@/lib/data/calendar";
import { fetchRaceResultsFromOpenF1 } from "@/lib/services/openf1";
import { calculatePredictionPoints, assignTelemetryBonus } from "@/lib/services/scoring";
import type { FullRacePrediction } from "@/lib/types/prode";
import { ObjectId } from "mongodb"

export async function processRaceResultsAndScores(raceId: string) {
  const db = (await clientPromise).db();

  // 1. Verificar si la carrera ya fue procesada previamente
  const existingResult = await db.collection("results").findOne({ raceId });
  if (existingResult?.isFinal) {
    return { success: true, message: "La carrera ya fue procesada." };
  }

  // 2. Buscar datos de sesión en nuestro calendario
  const raceInfo = F1_CALENDAR_2026.find((r) => r.raceId === raceId);
  if (!raceInfo) throw new Error("Carrera no encontrada en el calendario.");

  // 3. Obtener resultados de OpenF1
  const result = await fetchRaceResultsFromOpenF1(raceInfo.openF1Keys, raceInfo.isSprintWeekend);
  if (!result || !result.isComplete) {
    return { success: false, message: "Los resultados oficiales aún no están disponibles en OpenF1." };
  }
 
  // 4. Guardar resultado oficial
  await db.collection("results").updateOne(
    { raceId },
    { $set: { ...result, raceId, isFinal: true, updatedAt: new Date() } },
    { upsert: true }
  );

  // 5. Obtener todas las predicciones de los usuarios para este Gran Premio
  const predictions = (await db
    .collection("predictions")
    .find({ raceId })
    .toArray()) as unknown as FullRacePrediction[];

  if (predictions.length === 0) {
    return { success: true, message: "No hubo apuestas registradas para esta carrera." };
  }

  // 6. Calcular el bonus de telemetría (tiempo de pole)
  const telemetryBonusMap = assignTelemetryBonus(predictions, result.poleTimeMillis);

  // 7. Actualizar el acumulado de cada usuario en `leaderboard`
  for (const pred of predictions) {
  const { officialPoints, chaosPoints } = calculatePredictionPoints(pred, result);
  const bonus = telemetryBonusMap.get(pred.userId) || 0;
  const totalOfficial = officialPoints + bonus;

  // Intentar buscar el usuario convirtiendo a ObjectId o usando string directo
  let queryFilter: Record<string, unknown> = { _id: pred.userId };
  if (ObjectId.isValid(pred.userId)) {
    queryFilter = { _id: new ObjectId(pred.userId) };
  }

  const user = await db.collection("users").findOne(queryFilter);

 await db.collection("leaderboard").updateOne(
  { userId: pred.userId },
  {
    $inc: {
      officialPoints: totalOfficial,
      chaosPoints: chaosPoints,
      telemetryWins: bonus > 0 ? 1 : 0,
    },
    $set: {
      userName: user?.name || user?.email || "Piloto Anónimo",
      userImage: user?.image || "",
      updatedAt: new Date(),
    },
  },
  { upsert: true }
);
}

  return { success: true, message: "Puntajes procesados y tabla de posiciones actualizada." };
}

export async function getLeaderboard() {
  const db = (await clientPromise).db();
  const leaderboard = await db
    .collection("leaderboard")
    .find({})
    .sort({ officialPoints: -1 })
    .toArray();

  return JSON.parse(JSON.stringify(leaderboard));
}

export async function getLastRaceResult() {
  const db = (await clientPromise).db();
  
  // Buscar el resultado más reciente guardado en la colección results
  const lastResult = await db
    .collection("results")
    .find({ isFinal: true })
    .sort({ updatedAt: -1 })
    .limit(1)
    .toArray();

  if (!lastResult || lastResult.length === 0) return null;
  return JSON.parse(JSON.stringify(lastResult[0]));
}



