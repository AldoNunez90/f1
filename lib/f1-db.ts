import { getF1Db } from '@/lib/db/connection';
import { unstable_cache } from 'next/cache';

// Interface base para asegurarle a TypeScript que _id es string
interface CustomDocument {
  _id: string;
  [key: string]: unknown;
}

// Helper interno para validar la conexión
async function getValidatedDb() {
  const db = await getF1Db();
  if (!db) {
    throw new Error('No se pudo establecer conexión con la base de datos de MongoDB.');
  }
  return db;
}

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
      return await db.collection<CustomDocument>('drivers_profile').findOne({ _id: driverId });
    },
    [`driver-profile-${driverId}`],
    { revalidate: false }
  )();

export const getAllDriversIndex = (activeOnly = true) =>
  unstable_cache(
    async () => {
      const db = await getValidatedDb();

      // Query flexible: acepta números o strings (2026 o "2026")
      const activeQuery = {
        $or: [
          { active: true },
          { "teamsHistory.year": 2026 },
          { "teamsHistory.year": "2026" },
          { "seasons.year": 2026 },
          { "seasons.year": "2026" },
        ],
        $and: [
          {"permanentNumber": { $exists: true, $ne: null }},
        ]
      };

      const query = activeOnly ? activeQuery : {};

      const drivers = await db
        .collection<CustomDocument>('drivers_profile')
        .find(query, { 
          projection: { 
            name: 1, 
            fullName: 1, 
            countryId: 1, 
            stats: 1, 
            active: 1, 
            teamsHistory: 1,
            permanentNumber: 1,
          } 
        })
        .sort({ "stats.wins": -1 })
        .toArray();


      return drivers;
    },
    [`all-drivers-index-${activeOnly ? 'active-v5' : 'all-v5'}`], // Forzamos v5 para invalidar cache
    { revalidate: false }
  )();

// ========================================================
// 🏁 CONSULTAS DE CIRCUITOS (circuits_profile)
// ========================================================

/**
 * Obtiene el perfil de un circuito por su ID (ej: 'monaco')
 */
export const getCircuitProfile = (circuitId: string) =>
  unstable_cache(
    async () => {
      const db = await getValidatedDb();
      return await db.collection<CustomDocument>('circuits_profile').findOne({ _id: circuitId });
    },
    [`circuit-profile-${circuitId}`],
    { revalidate: false }
  )();

/**
 * Obtiene todos los circuitos ordenados por cantidad de Grandes Premios
 */
export const getAllCircuitsIndex = unstable_cache(
  async () => {
    const db = await getValidatedDb();
    return await db
      .collection<CustomDocument>('circuits_profile')
      .find({})
      .sort({ totalRaces: -1 })
      .toArray();
  },
  ['all-circuits-index-v2'],
  { revalidate: false }
);