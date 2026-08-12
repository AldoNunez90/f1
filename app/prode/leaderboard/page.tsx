// app/prode/leaderboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLeaderboard } from "@/app/actions/scoring";
import LeaderboardClient from "./LeaderboardClient";

export default async function LeaderboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/prode/leaderboard");
  }

  const entries = await getLeaderboard();

  return <LeaderboardClient entries={entries} />;
}