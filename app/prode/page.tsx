// app/prode/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProdeClient from "./ProdeClient";
import { getProdePageData } from "@/app/actions/prode";

interface PageProps {
  searchParams: Promise<{ raceId?: string }>;
}

export default async function ProdePageServer({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/prode");
  }

  const resolvedParams = await searchParams;
  const data = await getProdePageData(resolvedParams.raceId);

  if (!data || !data.currentRace) {
    return <div className="p-10 text-center text-white">No hay carreras configuradas en el calendario.</div>;
  }

  const now = new Date();
  
  // Calculamos todo una sola vez
  const isQualyOpen = now < new Date(data.currentRace.qualifyingLockout);
  const isRaceOpen = now < new Date(data.currentRace.mainRaceLockout);
  
  const isSprintQualyOpen = data.currentRace.qualifyingSprintLockout
    ? now < new Date(data.currentRace.qualifyingSprintLockout)
    : false;

  const isSprintRaceOpen = data.currentRace.mainRaceSprintLockout
    ? now < new Date(data.currentRace.mainRaceSprintLockout)
    : false;

  return (
    <ProdeClient 
      userId={session.user.id} 
      schedule={data.currentRace}
      allRaces={data.allRaces}
      isQualyOpen={isQualyOpen}
      isRaceOpen={isRaceOpen}
      isSprintQualyOpen={isSprintQualyOpen}
      isSprintRaceOpen={isSprintRaceOpen}
      initialData={data.currentPrediction}
      history={data.history}
    />
  );
}