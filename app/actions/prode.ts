// app/actions/prode.ts
"use server";

import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { FullRacePrediction } from "@/lib/types/prode";
import { F1_CALENDAR_2026, getCurrentOrNextRace } from "@/lib/data/calendar";

export async function saveFullPrediction(
  prediction: FullRacePrediction,
  lockouts: {
    qualifyingSprintLockout?: string;
    mainRaceSprintLockout?: string;
    qualifyingLockout: string;
    mainRaceLockout: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Debes iniciar sesión para guardar tus predicciones.");
  }

  const now = new Date();
  const db = (await clientPromise).db();

  const existing = await db.collection("predictions").findOne({
    userId: session.user.id,
    raceId: prediction.raceId,
  });

  const updatePayload: Record<string, unknown> = {
    userId: session.user.id,
    raceId: prediction.raceId,
    updatedAt: new Date(),
  };

  // 1. Validar Sprint Qualy (Pole Sprint)
  if (lockouts.qualifyingSprintLockout) {
    if (now < new Date(lockouts.qualifyingSprintLockout)) {
      updatePayload["official.sprintPoleDriverId"] = prediction.official.sprintPoleDriverId;
    } else if (existing?.official?.sprintPoleDriverId) {
      updatePayload["official.sprintPoleDriverId"] = existing.official.sprintPoleDriverId;
    }
  }

  // 2. Validar Carrera Sprint (Podio Sprint)
  if (lockouts.mainRaceSprintLockout) {
    if (now < new Date(lockouts.mainRaceSprintLockout)) {
      updatePayload["official.sprintPodium"] = prediction.official.sprintPodium;
    } else if (existing?.official?.sprintPodium) {
      updatePayload["official.sprintPodium"] = existing.official.sprintPodium;
    }
  }

  // 3. Validar Clasificación Principal
  if (now < new Date(lockouts.qualifyingLockout)) {
    updatePayload["official.qualifyingPoleDriverId"] = prediction.official.qualifyingPoleDriverId;
    updatePayload["telemetry.poleTimeMillis"] = prediction.telemetry.poleTimeMillis;
  } else if (existing?.official?.qualifyingPoleDriverId) {
    updatePayload["official.qualifyingPoleDriverId"] = existing.official.qualifyingPoleDriverId;
    updatePayload["telemetry.poleTimeMillis"] = existing.telemetry.poleTimeMillis;
  }

  // 4. Validar Carrera Principal
  if (now < new Date(lockouts.mainRaceLockout)) {
    updatePayload["official.mainPodium"] = prediction.official.mainPodium;
    updatePayload["chaos"] = prediction.chaos;
  } else if (existing?.official?.mainPodium) {
    updatePayload["official.mainPodium"] = existing.official.mainPodium;
    updatePayload["chaos"] = existing.chaos;
  }

  await db.collection("predictions").updateOne(
    { userId: session.user.id, raceId: prediction.raceId },
    { $set: updatePayload },
    { upsert: true }
  );

  revalidatePath("/prode");
  return { success: true };
}

export async function getPredictionForRace(raceId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const db = (await clientPromise).db();
  const prediction = await db.collection("predictions").findOne({
    userId: session.user.id,
    raceId: raceId,
  });

  // Next.js requiere que los objetos pasados de Server a Client estén serializados
  return prediction ? JSON.parse(JSON.stringify(prediction)) : null;
}

export async function getProdePageData(selectedRaceId?: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Determinar carrera: la seleccionada por el usuario o la activa por fecha desde memoria
  let currentRace = F1_CALENDAR_2026.find((r) => r.raceId === selectedRaceId);
  if (!currentRace) {
    currentRace = getCurrentOrNextRace();
  }

  const db = (await clientPromise).db();

  // Consulta a MongoDB ÚNICAMENTE para las predicciones del usuario
  const prediction = await db.collection("predictions").findOne({
    userId: session.user.id,
    raceId: currentRace.raceId,
  });

  // Obtener todo el historial de predicciones del usuario
  const history = await db.collection("predictions")
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray();

  return {
    allRaces: F1_CALENDAR_2026,
    currentRace,
    currentPrediction: prediction ? JSON.parse(JSON.stringify(prediction)) : null,
    history: JSON.parse(JSON.stringify(history)),
  };
}