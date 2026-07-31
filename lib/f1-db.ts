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
      "No se pudo establecer conexión con la base de datos de MongoDB.",
    );
  }
  return db;
}

export type DriverViewMode = "active" | "rookies" | "all";

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

      // Consultar las participaciones del piloto actual (excluyendo testDriver)
      const myEntrances = await db
        .collection<CustomDocument>("seasons_entrants_drivers")
        .find({
          driverId: driverId,
          testDriver: { $ne: true },
        })
        .toArray();

      if (myEntrances.length > 0) {
        // Construimos filtros para buscar otros pilotos en los mismos años y escuderías
        const searchConditions = myEntrances
          .filter((e) => Boolean(e.constructorId) && Boolean(e.year))
          .map((e) => ({
            year: e.year,
            constructorId: e.constructorId,
          }));

        if (searchConditions.length > 0) {
          // Buscamos todas las participaciones de compañeros titulares en esas mismas condiciones
          const matchedEntrances = await db
            .collection<CustomDocument>("seasons_entrants_drivers")
            .find({
              driverId: { $ne: driverId },
              testDriver: { $ne: true },
              $or: searchConditions as unknown as Record<string, unknown>[],
            })
            .toArray();

          if (matchedEntrances.length > 0) {
            // Obtenemos las identidades de los pilotos encontrados
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

            // Verificamos si coincidieron en al menos una carrera (round)
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

                  // Intersección de rondas: ¿Compartieron al menos 1 Gran Premio?
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
    [`driver-profile-${driverId}-v13`], // Incrementado a v13 para refrescar el caché
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