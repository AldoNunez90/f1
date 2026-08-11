// app/actions/prode.ts
"use server";

import { auth } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { revalidatePath } from "next/cache";
import { FullRacePrediction } from "@/lib/types/prode";

export async function saveFullPrediction(prediction: FullRacePrediction, lockouts: {
  qualifyingLockout: string;
  mainRaceLockout: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Debes iniciar sesión para guardar tus predicciones.");
  }

  const now = new Date();
  const db = (await clientPromise).db();

  // 1. Obtener la predicción actual guardada
  const existing = await db.collection("predictions").findOne({
    userId: session.user.id,
    raceId: prediction.raceId,
  });

  // 2. Construir actualización parcial según sesiones abiertas
  const updatePayload: Record<string, unknown> = {
    userId: session.user.id,
    raceId: prediction.raceId,
    updatedAt: new Date(),
  };

  // Validar sesión de Clasificación
  if (now < new Date(lockouts.qualifyingLockout)) {
    updatePayload["official.qualifyingPoleDriverId"] = prediction.official.qualifyingPoleDriverId;
    updatePayload["telemetry.poleTimeMillis"] = prediction.telemetry.poleTimeMillis;
  } else if (existing?.official?.qualifyingPoleDriverId) {
    updatePayload["official.qualifyingPoleDriverId"] = existing.official.qualifyingPoleDriverId;
    updatePayload["telemetry.poleTimeMillis"] = existing.telemetry.poleTimeMillis;
  }

  // Validar sesión de Carrera
  if (now < new Date(lockouts.mainRaceLockout)) {
    updatePayload["official.mainPodium"] = prediction.official.mainPodium;
    updatePayload["chaos"] = prediction.chaos;
  } else if (existing?.official?.mainPodium) {
    updatePayload["official.mainPodium"] = existing.official.mainPodium;
    updatePayload["chaos"] = existing.chaos;
  }

  // 3. Guardar en MongoDB
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

export async function getUserPredictionsHistory() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const db = (await clientPromise).db();
  const predictions = await db.collection("predictions")
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 }) // Ordenamos de más reciente a más antiguo
    .toArray();

  return JSON.parse(JSON.stringify(predictions));
}