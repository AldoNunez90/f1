import axios from 'axios';
import connectDB from '@/lib/db/connection';
import F1Cache from '@/lib/models/F1Cache';
import { getCacheTTL, getNextRacingWeekendDate } from '@/lib/utils/racingWeekend';

const OPEN_F1_API = 'https://api.openf1.org/v1';

interface F1CacheEntry {
  data: Record<string, unknown>;
  lastUpdated: Date;
}

/**
 * Determina si los datos ya no necesitan actualizarse (fijos o finalizados)
 */
export function isDataCompleted(endpoint: string, data: any): boolean {
  // 1. Pilotos: Se consideran fijos una vez guardados en MongoDB por primera vez
  if (endpoint === 'drivers') return true;

  // 2. Sesiones: Verificamos el marcador 'date_end'
  // Si todas las sesiones en el conjunto de datos han terminado (+ margen de seguridad),
  // consideramos que la información es definitiva y no requiere más fetchs.
  if (endpoint.startsWith('sessions') && Array.isArray(data) && data.length > 0) {
    const now = new Date();
    const BUFFER_MS = 15 * 60 * 1000; // Margen de 15 minutos tras el fin oficial

    return data.every(session => {
      // Si no hay date_end o es un marcador inválido/futuro, la sesión sigue "abierta"
      if (!session.date_end) return false; 
      const endDate = new Date(session.date_end);
      return !isNaN(endDate.getTime()) && (endDate.getTime() + BUFFER_MS) < now.getTime();
    });
  }

  return false;
}

/**
 * Fetch a Open F1 API endpoint con caché
 */
export async function fetchF1Data(
  endpoint: string,
  queryParams?: Record<string, string | number>
): Promise<any> {
  try {
    await connectDB();

    // Generar clave de caché con query params
    const cacheKey = queryParams
      ? `${endpoint}?${new URLSearchParams(
          Object.entries(queryParams).map(([k, v]) => [k, String(v)])
        ).toString()}`
      : endpoint;

    // Buscar en caché
    const cached = await F1Cache.findOne({ endpoint: cacheKey });

    if (cached) {
      const now = new Date();

      // Optimización de marcador final: Si la data es definitiva (sesión cerrada o pilotos fijos),
      // evitamos cualquier llamada externa a la API sin importar el TTL.
      if (isDataCompleted(endpoint, cached.data)) return cached.data;

      const cacheTTL = getCacheTTL();
      const cacheAge = now.getTime() - cached.lastUpdated.getTime();

      if (cacheAge < cacheTTL) {
        return cached.data as Record<string, unknown>;
      }
    }

    // Si no hay caché válido, fetch a la API
    const response = await axios.get(`${OPEN_F1_API}/${endpoint}`, {
      params: queryParams,
      timeout: 10000,
    });
    const data = response.data;

    // Calcular fecha de expiración personalizada para evitar que MongoDB borre los datos automáticamente
    let expiresAt: Date;
    
    if (isDataCompleted(endpoint, data)) {
      // Pilotos o Sesiones terminadas: Quedan fijos hasta el 15 de diciembre de 2026
      expiresAt = new Date('2026-12-15T23:59:59Z');
    } else if (endpoint.startsWith('sessions')) {
      // Sesiones activas/futuras: Se mantienen hasta el próximo viernes de carrera
      expiresAt = getNextRacingWeekendDate();
    } else {
      // Otros datos (clima, vueltas, etc.): TTL estándar (6h o 8h)
      expiresAt = new Date(Date.now() + getCacheTTL());
    }

    await F1Cache.updateOne(
      { endpoint: cacheKey },
      {
        endpoint: cacheKey,
        data,
        lastUpdated: new Date(),
        expiresAt,
      },
      { upsert: true }
    );

    return data as Record<string, unknown>;
  } catch (error) {
    // Si hay error, intentar retornar datos en caché aunque estén expirados
    const cacheKey = queryParams
      ? `${endpoint}?${new URLSearchParams(
          Object.entries(queryParams).map(([k, v]) => [k, String(v)])
        ).toString()}`
      : endpoint;

    try {
      await connectDB();
      const cached = await F1Cache.findOne({ endpoint: cacheKey });
      if (cached) {
        console.warn(
          `Error fetching ${cacheKey}, using stale cache from ${cached.lastUpdated}`
        );
        return cached.data as Record<string, unknown>;
      }
    } catch (cacheError) {
      console.error('Error reading cache:', cacheError);
    }

    throw error;
  }
}

/**
 * Retorna todos los endpoints disponibles en Open F1
 */
export const AVAILABLE_ENDPOINTS = [
  'drivers',
  'championship_teams',
  'championship_drivers',
  'sessions',
  'laps',
  'intervals',
  'pit_stops',
  'weather',
  'position',
  'weather',
  'qualifying',
  'race_control_events',
  'session_result',
] as const;

/**
 * Valida si un endpoint es válido
 */
export function isValidEndpoint(endpoint: string): boolean {
  // Permitir endpoints con query parameters
  const baseEndpoint = endpoint.split('?')[0];
  return AVAILABLE_ENDPOINTS.includes(baseEndpoint as any);
}
