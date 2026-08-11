export interface FullRacePrediction {
  _id?: string;
  userId: string;
  raceId: string;
  
  // 1. Torneo Oficial
  official: {
    qualifyingPoleDriverId?: string;
    sprintPoleDriverId?: string;
    sprintPodium?: { p1: string; p2: string; p3: string };
    mainPodium?: { p1: string; p2: string; p3: string };
  };

  // 2. Desafío Telemetría (Ranking Secundario)
  telemetry: {
    poleTimeMillis?: number;
  };

  // 3. Desafío Caos (Ranking Secundario)
  chaos: {
    redFlagsCount?: number;
    yellowFlagsCount?: number;
    dnfCount?: number;
  };

  createdAt?: Date;
  updatedAt: Date;
}

export interface RaceSessionSchedule {
  raceId: string;
  raceName: string;
  isSprintWeekend: boolean;
  qualifyingLockout: string;
  sprintQualyLockout?: string;
  sprintRaceLockout?: string;
  mainRaceLockout: string;
}