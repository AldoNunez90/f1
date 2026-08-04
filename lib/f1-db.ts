import { getF1Db } from "@/lib/db/connection";
import { unstable_cache } from "next/cache";

// Interface base para asegurarle a TypeScript que _id es string
interface CustomDocument {
  _id: string;
  [key: string]: unknown;
}

// Interfaces de apoyo estrictas (sin 'any')
interface FamilyRelationship {
  relatedDriverId: string;
  type: string;
}

export interface TeamDriverLink {
  _id: string;
  fullName: string;
  permanentNumber?: number;
  countryId?: string;
  alpha2Code?: string;
  imageUrl?: string;
}

export interface TeamProfileIndex {
  _id: string; // ej: "alpine", "ferrari"
  name: string;
  fullName?: string;
  countryId?: string;
  alpha2Code?: string;
  teamColour?: string;
  chassisName?: string;
  engineName?: string;
  engineManufacturer?: string;
  stats?: {
    championships?: number;
    wins?: number;
    podiums?: number;
    poles?: number;
  };
  drivers?: TeamDriverLink[];
}

export interface DriverLink {
  _id: string;
  fullName: string;
}

export type DriverViewMode = "active" | "rookies" | "all";
export type TeamViewMode = "active" | "all";

// Helper interno para procesar el string de rondas ("1;2;3;4") a un Set numérico
function parseRounds(roundsStr?: string): Set<number> {
  if (!roundsStr) return new Set();
  return new Set(
    roundsStr
      .split(";")
      .map((r) => parseInt(r.trim(), 10))
      .filter((r) => !isNaN(r))
  );
}

// Helper interno para validar la conexión
async function getValidatedDb() {
  const db = await getF1Db();
  if (!db) {
    throw new Error(
      "No se pudo establecer conexión con la base de datos de MongoDB."
    );
  }
  return db;
}

// ========================================================
// 🏎️ CONSULTAS DE PILOTOS (drivers_profile)
// ========================================================

/**
 * Obtiene el perfil completo de un piloto por su ID (ej: 'max-verstappen')
 * e incluye el alpha2Code del país desde la colección 'countries'
 */
export const getDriverProfile = (driverId: string) =>
  unstable_cache(
    async () => {
      const db = await getValidatedDb();

      // 1. Usar 'as unknown' para castear _id sin activar la regla 'no-explicit-any'
      const driver = await db
        .collection<CustomDocument>("drivers_profile")
        .findOne({ _id: driverId as unknown as string });

      if (!driver) return null;

      // 2. Traer la bandera (alpha2Code)
      const countryId = driver.countryId as string | undefined;
      const country = countryId
        ? await db.collection("countries").findOne({ id: countryId })
        : null;
      const alpha2Code = (country?.alpha2Code as string) || null;

      // 3. Resolver los nombres de la Familia (priorizando 'name')
      let familyWithDetails: Array<{ driverId: string; name: string; relationship: string }> = [];
      const familyRelationships = driver.familyRelationships as FamilyRelationship[] | undefined;

      if (Array.isArray(familyRelationships) && familyRelationships.length > 0) {
        const familyIds = familyRelationships.map((f: FamilyRelationship) => f.relatedDriverId);

        const relativeDocs = await db
          .collection<CustomDocument>("drivers_profile")
          .find(
            { _id: { $in: familyIds as unknown as string[] } },
            { projection: { _id: 1, name: 1, fullName: 1 } }
          )
          .toArray();

        const relativeMap = new Map(
          relativeDocs.map((d: CustomDocument) => [
            d._id,
            (d.name as string) || (d.fullName as string) || d._id,
          ])
        );

        familyWithDetails = familyRelationships.map((f: FamilyRelationship) => ({
          driverId: f.relatedDriverId,
          name: relativeMap.get(f.relatedDriverId) || f.relatedDriverId,
          relationship: f.type,
        }));
      }

      // 4. Calcular compañeros de equipo exactos mediante intersección de GPs (seasons_entrance_drivers)
      const teammatesByYear: Record<number, Array<{ id: string; name: string; constructorId: string }>> = {};

      const myEntrances = await db
        .collection<CustomDocument>("seasons_entrants_drivers")
        .find({
          driverId: driverId,
          testDriver: { $ne: true },
        })
        .toArray();

      if (myEntrances.length > 0) {
        const searchConditions = myEntrances
          .filter((e) => Boolean(e.constructorId) && Boolean(e.year))
          .map((e) => ({
            year: e.year,
            constructorId: e.constructorId,
          }));

        if (searchConditions.length > 0) {
          const matchedEntrances = await db
            .collection<CustomDocument>("seasons_entrants_drivers")
            .find({
              driverId: { $ne: driverId },
              testDriver: { $ne: true },
              $or: searchConditions as unknown as Record<string, unknown>[],
            })
            .toArray();

          if (matchedEntrances.length > 0) {
            const teammateDriverIds = Array.from(
              new Set(matchedEntrances.map((e) => e.driverId as string))
            );

            const teammateDocs = await db
              .collection<CustomDocument>("drivers_profile")
              .find(
                { _id: { $in: teammateDriverIds as unknown as string[] } },
                { projection: { _id: 1, name: 1, fullName: 1 } }
              )
              .toArray();

            const teammateMap = new Map(
              teammateDocs.map((d: CustomDocument) => [
                d._id,
                (d.name as string) || (d.fullName as string) || d._id,
              ])
            );

            myEntrances.forEach((mySeason) => {
              const myRounds = parseRounds(mySeason.rounds as string | undefined);
              const seasonYear = mySeason.year as number;
              const constructorId = mySeason.constructorId as string;

              matchedEntrances.forEach((hisSeason) => {
                if (
                  hisSeason.year === seasonYear &&
                  hisSeason.constructorId === constructorId
                ) {
                  const hisRounds = parseRounds(hisSeason.rounds as string | undefined);

                  const sharedGP = Array.from(myRounds).some((round) =>
                    hisRounds.has(round)
                  );

                  if (sharedGP) {
                    const tmDriverId = hisSeason.driverId as string;

                    if (!teammatesByYear[seasonYear]) {
                      teammatesByYear[seasonYear] = [];
                    }

                    if (!teammatesByYear[seasonYear].some((x) => x.id === tmDriverId)) {
                      teammatesByYear[seasonYear].push({
                        id: tmDriverId,
                        name: teammateMap.get(tmDriverId) || tmDriverId,
                        constructorId: constructorId,
                      });
                    }
                  }
                }
              });
            });
          }
        }
      }

      return {
        ...driver,
        alpha2Code,
        familyWithDetails,
        teammatesByYear,
      };
    },
    [`driver-profile-${driverId}-v13`],
    { revalidate: 3600 }
  )();

export const getAllDriversIndex = (mode: DriverViewMode = "active") =>
  unstable_cache(
    async () => {
      const db = await getValidatedDb();

      const in2026Season = {
        $or: [
          { active: true },
          { "teamsHistory.year": 2026 },
          { "teamsHistory.year": "2026" },
          { "seasons.year": 2026 },
          { "seasons.year": "2026" },
        ],
      };

      const hasPermanentNumber = {
        $or: [
          { permanentNumber: { $exists: true, $ne: null } },
          { driverNumber: { $exists: true, $ne: null } },
        ],
      };

      let query = {};

      if (mode === "active") {
        query = {
          $and: [in2026Season, hasPermanentNumber],
        };
      } else if (mode === "rookies") {
        query = {
          $and: [
            in2026Season,
            {
              $nor: [
                { permanentNumber: { $exists: true, $ne: null } },
                { driverNumber: { $exists: true, $ne: null } },
              ],
            },
          ],
        };
      } else {
        query = {};
      }

      const drivers = await db
        .collection<CustomDocument>("drivers_profile")
        .aggregate([
          { $match: query },
          { $sort: { "stats.wins": -1 } },
          {
            $lookup: {
              from: "countries",
              localField: "countryId",
              foreignField: "id",
              as: "countryInfo",
            },
          },
          {
            $addFields: {
              alpha2Code: {
                $arrayElemAt: ["$countryInfo.alpha2Code", 0],
              },
            },
          },
          {
            $project: {
              name: 1,
              fullName: 1,
              countryId: 1,
              alpha2Code: 1,
              stats: 1,
              active: 1,
              teamsHistory: 1,
              permanentNumber: 1,
              driverNumber: 1,
              role: 1,
              imageUrl: 1,
            },
          },
        ])
        .toArray();

      return drivers;
    },
    [`all-drivers-index-mode-${mode}-v10`],
    { revalidate: 3600 }
  )();

// ========================================================
// 🏁 CONSULTAS DE CIRCUITOS (circuits_profile)
// ========================================================

export const getCircuitProfile = (circuitId: string) =>
  unstable_cache(
    async () => {
      const db = await getValidatedDb();
      return await db
        .collection<CustomDocument>("circuits_profile")
        .findOne({ _id: circuitId as unknown as string });
    },
    [`circuit-profile-${circuitId}`],
    { revalidate: 3600 }
  )();

// ========================================================
// 🏢 CONSULTAS DE EQUIPOS / CONSTRUCTORES (constructors)
// ========================================================

export const getTeamsIndex = (viewMode: TeamViewMode = "active") =>
  unstable_cache(
    async (): Promise<TeamProfileIndex[]> => {
      const db = await getValidatedDb();

      // 1. Colecciones con los nombres exactos de MongoDB
      const constructorsCol = db.collection<CustomDocument>("constructors");
      const entrantsConstructorsCol = db.collection<CustomDocument>("seasons_entrants_constructors");
      const entrantsChassisCol = db.collection<CustomDocument>("seasons_entrants_chassis");
      const entrantsEnginesCol = db.collection<CustomDocument>("seasons_entrants_engines");
      const chassisCol = db.collection<CustomDocument>("chassis");
      const enginesCol = db.collection<CustomDocument>("engines");
      
      // ⚠️ CORRECCIÓN CLAVE: Usar 'seasons_entrants_drivers' (con entrants en plural)
      const entranceDriversCol = db.collection<CustomDocument>("seasons_entrants_drivers");
      const driversCol = db.collection<CustomDocument>("drivers_profile");

      // 2. Obtener el año más reciente de forma segura
      const latestSeasonDoc = await entrantsConstructorsCol
        .find({})
        .sort({ year: -1 })
        .limit(1)
        .toArray();

      const rawYear = latestSeasonDoc.length > 0 ? latestSeasonDoc[0].year : 2026;
      const latestYearNum = typeof rawYear === "number" ? rawYear : parseInt(String(rawYear), 10);
      const yearQuery = { $in: [latestYearNum, String(latestYearNum)] };

      // 3. Filtrar constructores según viewMode
      let constructors: CustomDocument[] = [];

      if (viewMode === "active") {
        const activeEntrants = await entrantsConstructorsCol
          .find({ year: yearQuery })
          .toArray();

        const activeIds = Array.from(
          new Set(
            activeEntrants
              .flatMap((e) => [
                e.constructorId as string,
                e.entrantId as string,
                e.id as string,
              ])
              .filter(Boolean)
          )
        );

        constructors = await constructorsCol
          .find({
            $or: [
              { _id: { $in: activeIds as unknown as string[] } },
              { id: { $in: activeIds } },
              { constructorId: { $in: activeIds } },
              { name: { $in: activeIds } },
            ],
          })
          .toArray();
      } else {
        constructors = await constructorsCol.find({}).sort({ name: 1 }).toArray();
      }

      // 4. Mapear y enriquecer la información
      const enrichedTeams = await Promise.all(
        constructors.map(async (team) => {
          const mongoId = team._id.toString();
          const teamSlug = (team.id as string) || (team.constructorId as string) || (team.name as string)?.toLowerCase().replace(/\s+/g, '-');

          const teamMatchFilter = {
            $or: [
              { constructorId: mongoId },
              { constructorId: teamSlug },
              { entrantId: mongoId },
              { entrantId: teamSlug },
            ],
          };

          const entrantRecord = await entrantsConstructorsCol
            .find({
              ...(viewMode === "active" ? { year: yearQuery } : {}),
              ...teamMatchFilter,
            })
            .sort({ year: -1 })
            .limit(1)
            .toArray();

          const targetYear = entrantRecord.length > 0 ? entrantRecord[0].year : latestYearNum;
          const targetYearQuery = { $in: [targetYear, String(targetYear)] };

          // --- CHASSIS ---
          let chassisName: string | undefined = undefined;
          const chassisRel = await entrantsChassisCol.findOne({
            year: targetYearQuery,
            ...teamMatchFilter,
          });

          if (chassisRel?.chassisId) {
            const chassisDoc = await chassisCol.findOne({
              $or: [
                { id: chassisRel.chassisId },
                { _id: chassisRel.chassisId as unknown as string },
              ],
            });
            chassisName = (chassisDoc?.fullName as string) || (chassisDoc?.name as string) || (chassisRel.chassisId as string);
          }

          // --- MOTOR (POWER UNIT) ---
          let engineName: string | undefined = undefined;
          const engineManufacturer = entrantRecord[0]?.engineManufacturerId as string | undefined;

          const engineRel = await entrantsEnginesCol.findOne({
            year: targetYearQuery,
            ...teamMatchFilter,
          });

          if (engineRel?.engineId) {
            const engineDoc = await enginesCol.findOne({
              $or: [
                { id: engineRel.engineId },
                { _id: engineRel.engineId as unknown as string },
              ],
            });
            engineName = (engineDoc?.fullName as string) || (engineDoc?.name as string) || (engineRel.engineId as string);
          } else if (engineManufacturer) {
            engineName = engineManufacturer.toUpperCase();
          }

          // --- PILOTOS (seasons_entrants_drivers) ---
          const driverRels = await entranceDriversCol
            .find({
              year: targetYearQuery,
              ...teamMatchFilter,
              testDriver: { $ne: true }, // Excluir pilotos de prueba si solo queremos titulares
            })
            .toArray();

          const driverIds = Array.from(
            new Set(driverRels.map((d) => (d.driverId as string) || (d.id as string)).filter(Boolean))
          );

          let teamDrivers: TeamDriverLink[] = [];
          if (driverIds.length > 0) {
            const driverDocs = await driversCol
              .find({
                $or: [
                  { _id: { $in: driverIds as unknown as string[] } },
                  { id: { $in: driverIds } },
                ],
              })
              .toArray();

            teamDrivers = driverDocs.map((d) => ({
              _id: d._id.toString(),
              fullName: (d.name as string) || `${(d.name as string) || ""} ${(d.surname as string) || ""}`.trim(),
              permanentNumber: (d.permanentNumber as number) || (d.driverNumber as number),
              countryId: d.countryId as string | undefined,
              alpha2Code: d.alpha2Code as string | undefined,
              imageUrl: d.imageUrl as string | undefined,
            }));
          }

          return {
            _id: mongoId,
            name: (team.name as string) || teamSlug || mongoId,
            fullName: team.fullName as string | undefined,
            countryId: team.countryId as string | undefined,
            alpha2Code: team.alpha2Code as string | undefined,
            teamColour: team.teamColour as string | undefined,
            chassisName,
            engineName,
            engineManufacturer,
            stats: (team.stats as TeamProfileIndex["stats"]) || {},
            drivers: teamDrivers,
          };
        })
      );

      return enrichedTeams;
    },
    [`teams-index-mode-${viewMode}-v4`], // Version bump para refrescar la caché de Next.js
    { revalidate: 3600 }
  )();

export async function getTeamByIdOrSlug(idOrSlug: string) {
  const db = await getValidatedDb();

  // 1. Buscar escudería en 'constructors'
  const team = await db.collection<CustomDocument>('constructors').findOne({
    $or: [
      { id: idOrSlug },
      { constructorId: idOrSlug },
      { _id: idOrSlug as unknown as string },
      {
        $expr: {
          $eq: [{ $toString: '$_id' }, idOrSlug],
        },
      },
    ],
  });

  if (!team) return null;

  const teamIdStr = team._id.toString();
  const teamSlug = (team.id as string) || (team.constructorId as string) || idOrSlug;

  const teamMatchFilter = {
    $or: [
      { constructorId: teamIdStr },
      { constructorId: teamSlug },
      { entrantId: teamIdStr },
      { entrantId: teamSlug },
      {
        $expr: {
          $or: [
            { $eq: [{ $toString: '$constructorId' }, teamIdStr] },
            { $eq: [{ $toString: '$entrantId' }, teamIdStr] },
          ],
        },
      },
    ],
  };

  // 2. Traer todas las temporadas e inscripciones históricas
  const rawSeasons = await db
    .collection<CustomDocument>('seasons_entrants_constructors')
    .find(teamMatchFilter)
    .sort({ year: -1, _id: 1 })
    .toArray();

  // Agrupación visual por año
  const yearCounts = rawSeasons.reduce((acc, item) => {
    const y = item.year as number;
    acc[y] = (acc[y] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const yearIndexTracker: Record<number, number> = {};

  // 3. Enriquecer cada inscripción especificando entrantId y engineManufacturerId
  const seasonHistory = await Promise.all(
    rawSeasons.map(async (s) => {
      const year = s.year as number;
      yearIndexTracker[year] = (yearIndexTracker[year] || 0) + 1;
      const isFirstForYear = yearIndexTracker[year] === 1;
      const totalForYear = yearCounts[year];

      const yearQuery = { $in: [year, String(year)] };
      const currentEntrantId = s.entrantId as string | undefined;
      const entrantEngineId = s.engineManufacturerId as string | undefined;

      // Evaluar si es una inscripción de un equipo cliente/privado
      const isCustomerEntry = Boolean(
        currentEntrantId &&
        currentEntrantId !== teamIdStr &&
        currentEntrantId !== teamSlug
      );

      // Traer nombre del inscriptor (Entrant) si es un equipo cliente
      let entrantName = currentEntrantId || '';
      if (isCustomerEntry && currentEntrantId) {
        const entrantDoc = await db.collection<CustomDocument>('entrants').findOne({
          $or: [{ id: currentEntrantId }, { _id: currentEntrantId as unknown as string }],
        });
        if (entrantDoc) {
          entrantName = (entrantDoc.name as string) || (entrantDoc.fullName as string) || currentEntrantId;
        }
      }

      // 🔍 1. Buscar standing coincidente por AÑO + MOTOR
      const standing = await db.collection<CustomDocument>('seasons_constructor_standings').findOne({
        year: yearQuery,
        ...teamMatchFilter,
        ...(entrantEngineId ? { engineManufacturerId: entrantEngineId } : {}),
      });

      // 🔍 2. Chasis específico de ESTA inscripción
      const chassisRel = await db.collection<CustomDocument>('seasons_entrants_chassis').findOne({
        year: yearQuery,
        ...teamMatchFilter,
        ...(currentEntrantId ? { entrantId: currentEntrantId } : {}),
      });

      let chassisName = 'N/D';
      if (chassisRel?.chassisId) {
        const chassisDoc = await db.collection<CustomDocument>('chassis').findOne({
          $or: [{ id: chassisRel.chassisId }, { _id: chassisRel.chassisId as unknown as string }],
        });
        chassisName = (chassisDoc?.fullName as string) || (chassisDoc?.name as string) || (chassisRel.chassisId as string);
      }

      // 🔍 3. Motor específico de ESTA inscripción
      const engineRel = await db.collection<CustomDocument>('seasons_entrants_engines').findOne({
        year: yearQuery,
        ...teamMatchFilter,
        ...(currentEntrantId ? { entrantId: currentEntrantId } : {}),
      });

      let engineName = (entrantEngineId || (standing?.engineManufacturerId as string))?.toUpperCase() || 'N/D';
      if (engineRel?.engineId) {
        const engineDoc = await db.collection<CustomDocument>('engines').findOne({
          $or: [{ id: engineRel.engineId }, { _id: engineRel.engineId as unknown as string }],
        });
        engineName = (engineDoc?.fullName as string) || (engineDoc?.name as string) || (engineRel.engineId as string);
      }

      // 🔍 4. Pilotos titulares asociados estrictamente a ESTE entrantId y motor
      const driverFilter: Record<string, unknown> = {
        year: yearQuery,
        ...teamMatchFilter,
        testDriver: { $ne: true },
      };

      if (currentEntrantId) {
        driverFilter.entrantId = currentEntrantId;
      }

      const driverRels = await db
        .collection<CustomDocument>('seasons_entrants_drivers')
        .find(driverFilter)
        .toArray();

      const driverIds = Array.from(new Set(driverRels.map((d) => (d.driverId as string) || (d.id as string)).filter(Boolean)));
      let teamDrivers: DriverLink[] = [];

      if (driverIds.length > 0) {
        const driverDocs = await db
          .collection<CustomDocument>('drivers_profile')
          .find({
            $or: [{ _id: { $in: driverIds as unknown as string[] } }, { id: { $in: driverIds } }],
          })
          .toArray();

        teamDrivers = driverDocs.map((d) => ({
          _id: (d.id as string) || d._id.toString(),
          fullName: (d.surname as string) || (d.name as string), // Mantiene regla sin 'fullName'
        }));
      }

      return {
        _id: s._id.toString(),
        year,
        entrantId: currentEntrantId,
        entrantName,
        isCustomerEntry,
        chassisName,
        engineId: engineRel?.engineId || s.engineManufacturerId || null,
        engineName,
        drivers: teamDrivers,
        positionNumber: standing?.positionNumber ?? standing?.positionDisplayOrder ?? null,
        positionText: standing?.positionText ?? null,
        points: standing?.points ?? null,
        championshipWon: Boolean(standing?.championshipWon),
        isFirstForYear,
        totalForYear,
      };
    })
  );

  const uniqueYearsCount = Object.keys(yearCounts).length;

  return {
    team: {
      ...team,
      _id: teamIdStr,
    },
    seasonHistory,
    uniqueYearsCount,
  };
}


export async function getEngineByIdOrSlug(idOrSlug: string) {
  const db = await getValidatedDb();

  const engine = await db.collection<CustomDocument>('engines').findOne({
    $or: [
      { id: idOrSlug },
      { engineId: idOrSlug },
      { _id: idOrSlug as unknown as string },
      {
        $expr: {
          $eq: [{ $toString: '$_id' }, idOrSlug],
        },
      },
    ],
  });

  if (!engine) return null;

  return {
    _id: engine._id.toString(),
    id: engine.id as string,
    engineManufacturerId: engine.engineManufacturerId as string,
    name: engine.name as string,
    fullName: engine.fullName as string,
    capacity: engine.capacity as number | null,
    configuration: engine.configuration as string | null,
    aspiration: engine.aspiration as string | null,
  };
}