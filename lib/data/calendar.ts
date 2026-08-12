// lib/data/calendar.ts

export interface RaceEvent {
  raceId: string;
  round: number;
  raceName: string;
  circuitName: string;
  isSprintWeekend: boolean;
  gmt_offset: string;
  qualifyingSprintLockout?: string;
  mainRaceSprintLockout?: string;
  qualifyingLockout: string;
  mainRaceLockout: string;
  openF1Keys: {
    sprintShootoutSessionKey?: number;
    sprintRaceSessionKey?: number;
    qualifyingSessionKey: number;
    mainRaceSessionKey: number;
  };
}

export const F1_CALENDAR_2026: RaceEvent[] = [
  {
    raceId: "australia-2026",
    round: 1,
    raceName: "GP de Australia",
    circuitName: "Albert Park Circuit",
    isSprintWeekend: false,
    gmt_offset: "11:00:00",
    qualifyingLockout: "2026-03-07T05:00:00",
    mainRaceLockout: "2026-03-08T04:00:00",
    openF1Keys: {
      qualifyingSessionKey: 11230,
      mainRaceSessionKey: 11234,
    }
  },
  {
    raceId: "china-2026",
    round: 2,
    raceName: "GP de China",
    circuitName: "Shanghai International Circuit",
    isSprintWeekend: true,
    gmt_offset: "8:00:00",
    qualifyingSprintLockout: "2026-03-13T07:30:00",
    mainRaceSprintLockout: "2026-03-14T03:00:00",
    qualifyingLockout: "2026-03-14T06:50:00Z",
    mainRaceLockout: "2026-03-15T06:50:00Z",
    openF1Keys: {
      sprintShootoutSessionKey: 11236,
      sprintRaceSessionKey: 11240,
      qualifyingSessionKey: 11241,
      mainRaceSessionKey: 11245,
    }
  },
  {
    raceId: "japan-2026",
    round: 3,
    raceName: "GP de Japón",
    circuitName: "Suzuka Circuit",
    isSprintWeekend: false,
    gmt_offset: "9:00:00",
    qualifyingLockout: "2026-03-28T05:50:00Z",
    mainRaceLockout: "2026-03-29T04:50:00Z",
    openF1Keys: {
      qualifyingSessionKey: 11249,
      mainRaceSessionKey: 11253,
    }
  },
  {
    raceId: "bahrain-2026",
    round: 4,
    raceName: "GP de Bahréin",
    circuitName: "Bahrain International Circuit",
    isSprintWeekend: false,
    gmt_offset: "4:00:00",
    qualifyingLockout: "2026-04-11T15:50:00Z",
    mainRaceLockout: "2026-04-12T14:50:00Z",
    openF1Keys: {
      qualifyingSessionKey: 11257,
      mainRaceSessionKey: 11261,
    }
  },
  {
    raceId: "saudi-arabia-2026",
    round: 5,
    raceName: "GP de Arabia Saudita",
    circuitName: "Jeddah Corniche Circuit",
    isSprintWeekend: false,
    gmt_offset: "3:00:00",
    qualifyingLockout: "2026-04-18T16:50:00Z",
    mainRaceLockout: "2026-04-19T16:50:00Z",
    openF1Keys: {
      qualifyingSessionKey: 11265,
      mainRaceSessionKey: 11269,
    }
  },
  {
    raceId: "miami-2026",
    round: 6,
    raceName: "GP de Miami",
    circuitName: "Miami International Autodrome",
    isSprintWeekend: true,
    gmt_offset: "5:00:00",
    qualifyingSprintLockout: "2026-05-01T19:50:00",
    mainRaceSprintLockout: "2026-05-02T16:00:00",
    qualifyingLockout: "2026-05-02T19:50:00Z",
    mainRaceLockout: "2026-05-03T16:50:00Z",
    openF1Keys: {
      sprintShootoutSessionKey: 11271,
      sprintRaceSessionKey: 11275,
      qualifyingSessionKey: 11276,
      mainRaceSessionKey: 11280,
    }
  },
  {
    raceId: "montreal-2026",
    round: 7,
    raceName: "GP de Montreal",
    circuitName: "Circuit Gilles-Villeneuve",
    isSprintWeekend: true,
    gmt_offset: "-04:00:00",
    qualifyingSprintLockout: "2026-05-22T20:30:00",
    mainRaceSprintLockout: "2026-05-23T16:00:00",
    qualifyingLockout: "2026-05-23T20:00:00",
    mainRaceLockout: "2026-05-24T20:00:00",
    openF1Keys: {
      sprintShootoutSessionKey: 11282,
      sprintRaceSessionKey: 11286,
      qualifyingSessionKey: 11287,
      mainRaceSessionKey: 11291,
    }
  },
  {
    raceId: "monaco-2026",
    round: 8,
    raceName: "GP de Mónaco",
    circuitName: "Circuit de Monaco",
    isSprintWeekend: false,
    gmt_offset: "02:00:00",
    qualifyingLockout: "2026-06-06T14:00:00",
    mainRaceLockout: "2026-06-07T13:00:00",
    openF1Keys: {
      qualifyingSessionKey: 11295,
      mainRaceSessionKey: 11299,
    }
  },
  {
    raceId: "Barcelona-2026",
    round: 9,
    raceName: "GP de Catalunya",
    circuitName: "Circuit de Barcelona-Catalunya",
    isSprintWeekend: false,
    gmt_offset: "02:00:00",
    qualifyingLockout: "2026-06-13T14:00:00",
    mainRaceLockout: "2026-06-13T15:00:00",
    openF1Keys: {
      qualifyingSessionKey: 11303,
      mainRaceSessionKey: 11307,
    }
  },
   {
    raceId: "austria-2026",
    round: 10,
    raceName: "GP de Austria",
    circuitName: "Red Bull Ring",
    isSprintWeekend: false,
    gmt_offset: "02:00:00",
    qualifyingLockout: "2026-06-27T14:00:00",
    mainRaceLockout: "2026-06-28T13:00:00",
    openF1Keys: {
      qualifyingSessionKey: 11311,
      mainRaceSessionKey: 11315,
    }
  },
  {
    raceId: "great-britain-2026",
    round: 11,
    raceName: "GP de Gran Bretaña",
    circuitName: "Silverstone Circuit",
    isSprintWeekend: true,
    gmt_offset: "01:00:00",
    qualifyingSprintLockout: "2026-07-03T15:30:00",
    mainRaceSprintLockout: "2026-07-04T11:00:00",
    qualifyingLockout: "2026-07-04T15:00:00",
    mainRaceLockout: "2026-07-05T14:00:00",
    openF1Keys: {
      sprintShootoutSessionKey: 11317,
      sprintRaceSessionKey: 11321,
      qualifyingSessionKey: 11322,
      mainRaceSessionKey: 11326,
    }
  },
  {
    raceId: "belgium-2026",
    round: 12,
    raceName: "GP de Bélgica",
    circuitName: "Circuit de Spa-Francorchamps",
    isSprintWeekend: false,
    gmt_offset: "02:00:00",
    qualifyingLockout: "2026-07-18T14:00:00",
    mainRaceLockout: "2026-07-19T13:00:00",
    openF1Keys: {
      qualifyingSessionKey: 11330,
      mainRaceSessionKey: 11334,
    }
  },
  {
    raceId: "hungary-2026",
    round: 13,
    raceName: "GP de Hungría",
    circuitName: "Hungaroring",
    isSprintWeekend: false,
    gmt_offset: "02:00:00",
    qualifyingLockout: "2026-07-25T14:00:00",
    mainRaceLockout: "2026-07-26T13:00:00",
    openF1Keys: {
      qualifyingSessionKey: 11338,
      mainRaceSessionKey: 11342,
    }
  },
  {
    raceId: "netherlands-2026",
    round: 14,
    raceName: "GP de los Países Bajos",
    circuitName: "Circuit Zandvoort",
    isSprintWeekend: true,
    gmt_offset: "02:00:00",
    qualifyingSprintLockout: "2026-08-21T14:20:00",
    mainRaceSprintLockout: "2026-08-22T09:50:00",
    qualifyingLockout: "2026-08-22T13:50:00",
    mainRaceLockout: "2026-08-23T12:50:00",
    openF1Keys: {
      sprintShootoutSessionKey: 11344,
      sprintRaceSessionKey: 11348,
      qualifyingSessionKey: 11349,
      mainRaceSessionKey: 11353,
    }
  },
  {
    raceId: "italy-2026",
    round: 15,
    raceName: "GP de Italia",
    circuitName: "Autodromo Nazionale Monza",
    isSprintWeekend: false,
    gmt_offset: "02:00:00",
    qualifyingLockout: "2026-09-05T13:50:00",
    mainRaceLockout: "2026-09-06T12:50:00",
    openF1Keys: {
      qualifyingSessionKey: 11357,
      mainRaceSessionKey: 11361,
    }
  },
  {
    raceId: "madrid-2026",
    round: 16,
    raceName: "GP de Madrid",
    circuitName: "Madring International Circuit",
    isSprintWeekend: false,
    gmt_offset: "02:00:00",
    qualifyingLockout: "2026-09-12T13:50:00",
    mainRaceLockout: "2026-09-13T12:50:00",
    openF1Keys: {
      qualifyingSessionKey: 11365,
      mainRaceSessionKey: 11369,
    }
  },
  {
    raceId: "baku-2026",
    round: 17,
    raceName: "GP de Azerbaiyán",
    circuitName: "Baku City Circuit",
    isSprintWeekend: false,
    gmt_offset: "04:00:00",
    qualifyingLockout: "2026-09-25T11:50:00",
    mainRaceLockout: "2026-09-26T10:50:00",
    openF1Keys: {
      qualifyingSessionKey: 11373,
      mainRaceSessionKey: 11377,
    }
  },
  {
    raceId: "kuala-lumpur-2026",
    round: 18,
    raceName: "GP de Bahrain",
    circuitName: "Kuala Lumpur Circuit",
    isSprintWeekend: false,
    gmt_offset: "08:00:00",
    qualifyingLockout: "2026-10-03T07:50:00",
    mainRaceLockout: "2026-10-04T06:50:00",
    openF1Keys: {
      qualifyingSessionKey: 11730,
      mainRaceSessionKey: 11731,
    }
  },
  {
    raceId: "singapore-2026",
    round: 19,
    raceName: "GP de Singapore",
    circuitName: "Marina Bay Street Circuit",
    isSprintWeekend: true,
    gmt_offset: "08:00:00",
    qualifyingSprintLockout: "2026-10-09T12:20:00",
    mainRaceSprintLockout: "2026-10-10T08:50:00",
    qualifyingLockout: "2026-10-10T12:50:00",
    mainRaceLockout: "2026-10-11T11:50:00",
    openF1Keys: {
      sprintShootoutSessionKey: 11379,
      sprintRaceSessionKey: 11383,
      qualifyingSessionKey: 11384,
      mainRaceSessionKey: 11388,
    }
  },
  {
    raceId: "austin-2026",
    round: 20,
    raceName: "GP de Austin",
    circuitName: "Austin Street Circuit",
    isSprintWeekend: false,
    gmt_offset: "-05:00:00",
    qualifyingLockout: "2026-10-24T20:50:00",
    mainRaceLockout: "2026-10-25T19:50:00",
    openF1Keys: {
      qualifyingSessionKey: 11392,
      mainRaceSessionKey: 11396,
    }
  },
  {
    raceId: "mexico-city-2026",
    round: 21,
    raceName: "GP de Mexico",
    circuitName: "Hermanos Rodríguez Circuit",
    isSprintWeekend: false,
    gmt_offset: "-06:00:00",
    qualifyingLockout: "2026-10-31T20:50:00",
    mainRaceLockout: "2026-11-01T19:50:00",
    openF1Keys: {
      qualifyingSessionKey: 11400,
      mainRaceSessionKey: 11404,
    }
  },
   {
    raceId: "brazil-2026",
    round: 22,
    raceName: "GP de Interlagos",
    circuitName: "Interlagos Circuit",
    isSprintWeekend: false,
    gmt_offset: "-03:00:00",
    qualifyingLockout: "2026-11-07T17:50:00",
    mainRaceLockout: "2026-11-08T16:50:00",
    openF1Keys: {
      qualifyingSessionKey: 11408,
      mainRaceSessionKey: 11412,
    }
  },
   {
    raceId: "las-vegas-2026",
    round: 23,
    raceName: "GP de Las Vegas",
    circuitName: "Las Vegas Strip Circuit",
    isSprintWeekend: false,
    gmt_offset: "-08:00:00",
    qualifyingLockout: "2026-11-21T03:50:00",
    mainRaceLockout: "2026-11-22T03:50:00",
    openF1Keys: {
      qualifyingSessionKey: 11416,
      mainRaceSessionKey: 11420,
    }
  },
  {
    raceId: "qatar-2026",
    round: 24,
    raceName: "GP de Catar",
    circuitName: "Lusail International Circuit",
    isSprintWeekend: false,
    gmt_offset: "03:00:00",
    qualifyingLockout: "2026-11-28T17:50:00",
    mainRaceLockout: "2026-11-29T15:50:00",
    openF1Keys: {
      qualifyingSessionKey: 11424,
      mainRaceSessionKey: 11428,
  }
},
  {
    raceId: "abu-dhabi-2026",
    round: 25,
    raceName: "GP de Abu Dabi",
    circuitName: "Yas Marina Circuit",
    isSprintWeekend: false,
    gmt_offset: "04:00:00",
    qualifyingLockout: "2026-12-05T13:50:00Z",
    mainRaceLockout: "2026-12-06T12:50:00Z",
    openF1Keys: {
      qualifyingSessionKey: 11432,
      mainRaceSessionKey: 11436,
      }
  },
];

export function getCurrentOrNextRace(): RaceEvent {
  const now = new Date();
  const upcoming = F1_CALENDAR_2026.find((r) => new Date(r.mainRaceLockout) > now);
  return upcoming || F1_CALENDAR_2026[F1_CALENDAR_2026.length - 1];
}