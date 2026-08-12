// app/api/test-score/route.ts
import { NextResponse } from "next/server";
import { processRaceResultsAndScores } from "@/app/actions/scoring";

export async function GET() {
  const raceId = "hungary-2026";

  try {
    const result = await processRaceResultsAndScores(raceId);
    return NextResponse.json({
      success: true,
      raceIdProcessed: raceId,
      result,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error al procesar puntajes",
      },
      { status: 500 }
    );
  }
}