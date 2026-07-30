import { getF1Db } from "@/lib/db/connection";
import { unstable_cache } from "next/cache";

// Interface base para asegurarle a TypeScript que _id es string
interface CustomDocument {
  _id: string;
  [key: string]: unknown;
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
 */
export const getDriverProfile = (driverId: string) =>
  unstable_cache(
    async () => {
      const db = await getValidatedDb();
      return await db
        .collection<CustomDocument>("drivers_profile")
        .findOne({ _id: driverId });
    },
    [`driver-profile-${driverId}`],
    { revalidate: 3600 }, // Cambiado a revalidate en segundos para producción
  )();

export const getAllDriversIndex = (mode: DriverViewMode = "active") =>
  unstable_cache(
    async () => {
      const db = await getValidatedDb();

      // Condición base: Tienen actividad/participación en 2026
      const in2026Season = {
        $or: [
          { active: true },
          { "teamsHistory.year": 2026 },
          { "teamsHistory.year": "2026" },
          { "seasons.year": 2026 },
          { "seasons.year": "2026" },
        ],
      };

      // Condición para número permanente de carrera (titular)
      const hasPermanentNumber = {
        $or: [
          { permanentNumber: { $exists: true, $ne: null } },
          { driverNumber: { $exists: true, $ne: null } },
        ],
      };

      let query = {};

      if (mode === "active") {
        // Titulares 2026: Están en la temporada Y tienen número oficial asignado
        query = {
          $and: [in2026Season, hasPermanentNumber],
        };
      } else if (mode === "rookies") {
        // Rookies / FP1: Tienen actividad en 2026 PERO NO tienen número permanente asignado
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
        // "all": Histórico completo sin filtros de temporada ni dorsales
        query = {};
      }

      const drivers = await db
        .collection<CustomDocument>("drivers_profile")
        .find(query, {
          projection: {
            name: 1,
            fullName: 1,
            countryId: 1,
            stats: 1,
            active: 1,
            teamsHistory: 1,
            permanentNumber: 1,
            driverNumber: 1,
            role: 1, // Por si guardás 'Reserve' / 'Test Driver'
          },
        })
        .sort({ "stats.wins": -1 })
        .toArray();

      return drivers;
    },
    [`all-drivers-index-mode-${mode}-v9`],
    { revalidate: 3600 },
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
        .findOne({ _id: circuitId });
    },
    [`circuit-profile-${circuitId}`],
    { revalidate: 3600 },
  )();

export const getAllCircuitsIndex = unstable_cache(
  async () => {
    const db = await getValidatedDb();
    return await db
      .collection<CustomDocument>("circuits_profile")
      .find({})
      .sort({ totalRaces: -1 })
      .toArray();
  },
  ["all-circuits-index-v3"],
  { revalidate: 3600 },
);