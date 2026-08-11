// lib/utils/prode-session.ts

export interface RaceSessionSchedule {
  raceId: string;
  raceName: string;
  isSprintWeekend: boolean;
  qualifyingLockout: string;  // ISO String (10 min antes de Qualy)
  sprintQualyLockout?: string;
  sprintRaceLockout?: string;
  mainRaceLockout: string;    // ISO String (10 min antes de Carrera)
}

export function getSessionStatus(schedule: RaceSessionSchedule) {
  const now = new Date();

  return {
    isQualyOpen: now < new Date(schedule.qualifyingLockout),
    isSprintOpen: schedule.isSprintWeekend && schedule.sprintRaceLockout
      ? now < new Date(schedule.sprintRaceLockout)
      : false,
    isMainRaceOpen: now < new Date(schedule.mainRaceLockout),
  };
}