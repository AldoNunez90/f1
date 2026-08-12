// app/prode/leaderboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLastRaceResult, getLeaderboard } from "@/app/actions/scoring";
import { F1_CALENDAR_2026, getCurrentOrNextRace } from "@/lib/data/calendar";
import LeaderboardClient from "./LeaderboardClient";
import { LastRaceResultCard } from "@/app/components/Prode/LastRaceResultCard";
import { ProdeNav } from "@/app/components/ProdeNav";



export default async function LeaderboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/prode/leaderboard");
  }

  const entries = await getLeaderboard();
  const currentRace = getCurrentOrNextRace();
  const lastResult = await getLastRaceResult();

  return (
    <div>
            <ProdeNav />

      <LastRaceResultCard result={lastResult}/>
    <LeaderboardClient 
      entries={entries} 
      allRaces={F1_CALENDAR_2026}
      currentRaceId={currentRace.raceId}
      />
      </div>
  );
}