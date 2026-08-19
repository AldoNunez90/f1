// app/prode/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProdeClient from "./ProdeClient";
import { getProdePageData } from "@/app/actions/prode";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "PRODE - F1 HUB", 

  description: "Únete al Prode Argentino de F1 Hub. Predice resultados y compite en el ranking.", 

  openGraph: {
    title: "PRODE - F1 HUB",
    description: "Participa en el mejor Prode de F1. Predice y gana.",
    url: "https://www.f1hub.com.ar/prode", 
    siteName: "F1 HUB",
    images: [
      {
         url: "https://www.f1hub.com.ar/cascoDrivers.webp", 
        width: 512,
        height: 512,
        alt: "Casco F1 HUB",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image", 
    title: "F1 HUB - Prode & Estadísticas",
    description: "Participa en el mejor Prode de F1. Predice y gana.",
    images: ["https://www.f1hub.com.ar/og-image-1200x630.jpeg"],
  },
};

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
    key={data.currentRace.raceId}
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