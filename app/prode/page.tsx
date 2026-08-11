// app/prode/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProdeClient from "./ProdeClient";
import { getPredictionForRace, getUserPredictionsHistory } from "@/app/actions/prode";

// 1. Lógica del próximo evento (Más adelante esto vendrá de una BD de calendario)
const NEXT_RACE = {
  raceId: "monaco-2026",
  raceName: "GP de Mónaco 2026",
  qualifyingLockout: new Date(Date.now() + 86400000).toISOString(), // Cierra en 24hs
  mainRaceLockout: new Date(Date.now() + 172800000).toISOString(), // Cierra en 48hs
};


export default async function ProdePageServer() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/prode");
  }


  // 2. Calcular estado de bloqueo en el servidor
  const now = new Date();
  const isQualyOpen = now < new Date(NEXT_RACE.qualifyingLockout);
  const isRaceOpen = now < new Date(NEXT_RACE.mainRaceLockout);

  // 3. Obtener datos de MongoDB
  const currentPrediction = await getPredictionForRace(NEXT_RACE.raceId);
  const history = await getUserPredictionsHistory();

  return (
    <ProdeClient 
      userId={session.user.id} 
      schedule={NEXT_RACE}
      isQualyOpen={isQualyOpen}
      isRaceOpen={isRaceOpen}
      initialData={currentPrediction}
      history={history}
    />
  );
}