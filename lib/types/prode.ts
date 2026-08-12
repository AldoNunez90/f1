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


export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userImage?: string;
  officialPoints: number; // Puntos acumulados Torneo Oficial
  chaosPoints: number;    // Puntos acumulados Torneo Caos
  telemetryWins: number;  // Veces que ganó el bonus de tiempo de pole
  racesPredicted: number; // Cantidad de Grandes Premios en los que participó
  updatedAt: Date;
}