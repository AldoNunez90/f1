import axios from 'axios';
import connectDB from '@/lib/db/connection';
import F1Cache from '@/lib/models/F1Cache';
import { getCacheTTL } from '@/lib/utils/racingWeekend';
import type { Session } from '@/lib/types/f1';

const OPEN_F1_API = 'https://api.openf1.org/v1';
const SESSION_GRACE_PERIOD_MS = 10 * 60 * 1000; // Esperar 10 minutos tras el fin real de la sesión
const DYNAMIC_SESSION_ENDPOINTS = new Set([
  'sessions',
  'laps',
  'intervals',
  'pit_stops',
  'weather',
  'position',
  'qualifying',
  'race_control_events',
  'session_result',
]);

function hasActualEndTime(dateEnd?: string): boolean {
  return typeof dateEnd === 'string' && dateEnd.length > 0 && !dateEnd.includes('T00:00:00');
}

function parseGmtOffsetToMinutes(offset?: string): number | null {
  if (!offset || typeof offset !== 'string') return null;
  const parts = offset.split(':').map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null;
  const [hours, minutes, seconds] = parts;
  return hours * 60 + minutes + seconds / 60;
}

function getLocalDate(dateString?: string, gmtOffset?: string): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  const offsetMinutes = parseGmtOffsetToMinutes(gmtOffset);
  if (offsetMinutes === null) return date;

  return new Date(date.getTime() + offsetMinutes * 60 * 1000);
}

function getSessionDurationMs(sessionType?: string): number {
  switch (sessionType) {
    case 'Race':
      return 2 * 60 * 60 * 1000;
    case 'Qualifying':
    case 'SprintQualifying':
      return 60 * 60 * 1000;
    case 'Sprint':
      return 35 * 60 * 1000;
    case 'Practice':
      return 75 * 60 * 1000;
    default:
      return 90 * 60 * 1000;
  }
}

function getEffectiveEndDate(session: Session): Date | null {
  if (hasActualEndTime(session.date_end)) {
    const date = new Date(session.date_end!);
    if (!Number.isNaN(date.getTime())) return date;
  }

  if (session.date_start) {
    const start = new Date(session.date_start);
    if (!Number.isNaN(start.getTime())) {
      return new Date(start.getTime() + getSessionDurationMs(session.session_type));
    }
  }

  return null;
}

function normalizeSessions(data: unknown): Session[] {
  if (!Array.isArray(data)) return [];

  return data.filter(
    (item): item is Session =>
      typeof item === 'object' &&
      item !== null &&
      'date_start' in item &&
      typeof (item as Record<string, unknown>).date_start === 'string'
  );
}

interface SessionMarker {
  session_key?: number;
  session_name?: string;
  date_start?: string;
  date_end?: string;
  local_start?: string;
  local_end?: string;
  scheduledEnd?: string;
  isFinished: boolean;
  shouldUpdate: boolean;
  graceUntil?: string;
}

function getSessionMarker(data: unknown): SessionMarker {
  const sessions = normalizeSessions(data)
    .filter((session) => {
      const start = session.date_start ? new Date(session.date_start) : undefined;
      return start instanceof Date && !Number.isNaN(start.getTime());
    })
    .sort((a, b) => new Date(a.date_start!).getTime() - new Date(b.date_start!).getTime());

  if (sessions.length === 0) {
    return { isFinished: false, shouldUpdate: true };
  }

  const now = new Date();
  const liveSessions = sessions.filter((session) => {
    const start = new Date(session.date_start!);
    const end = getEffectiveEndDate(session);
    return start <= now && end !== null && now.getTime() < end.getTime();
  });

  let marker = liveSessions.length ? liveSessions[liveSessions.length - 1] : undefined;

  if (!marker) {
    const upcoming = sessions.filter((session) => new Date(session.date_start!).getTime() > now.getTime());
    marker = upcoming.length ? upcoming[0] : sessions[sessions.length - 1];
  }

  const effectiveEnd = getEffectiveEndDate(marker);
  const localStart = getLocalDate(marker.date_start, marker.gmt_offset);
  const localEnd = getLocalDate(effectiveEnd ? effectiveEnd.toISOString() : marker.date_end, marker.gmt_offset);

  const isFinished = effectiveEnd ? now.getTime() > effectiveEnd.getTime() : false;
  let shouldUpdate = false;
  let graceUntil: string | undefined;

  if (effectiveEnd) {
    graceUntil = new Date(effectiveEnd.getTime() + SESSION_GRACE_PERIOD_MS).toISOString();
    shouldUpdate = now.getTime() > effectiveEnd.getTime() + SESSION_GRACE_PERIOD_MS;
  }

  return {
    session_key: marker.session_key,
    session_name: marker.session_name,
    date_start: marker.date_start,
    date_end: marker.date_end,
    local_start: localStart?.toISOString(),
    local_end: localEnd?.toISOString(),
    scheduledEnd: marker.date_end,
    isFinished,
    shouldUpdate,
    graceUntil,
  };
}

async function findSessionsCache(queryParams?: Record<string, string | number>) {
  const year = queryParams?.year ? String(queryParams.year) : String(new Date().getFullYear());
  let cached = await F1Cache.findOne({ endpoint: `sessions?year=${year}` });

  if (!cached) {
    cached = await F1Cache.findOne({ endpoint: { $regex: /^sessions(\?.*)?$/ } });
  }

  return cached;
}

/**
 * Determina si los datos ya no necesitan actualizarse (fijos o finalizados)
 */
export function isDataCompleted(endpoint: string, data: unknown ): boolean {
  // 1. Pilotos: Se consideran fijos una vez guardados en MongoDB por primera vez
  if (endpoint === 'drivers') return true;

  // 2. Sesiones: Verificamos si la sesión próxima/actual ya finalizó definitivamente.
  if (endpoint.startsWith('sessions') && Array.isArray(data) && data.length > 0) {
    const marker = getSessionMarker(data);
    return marker.isFinished;
  }

  return false;
}

/**
 * Fetch a Open F1 API endpoint con caché
 */
export async function fetchF1Data(
  endpoint: string,
  queryParams?: Record<string, string | number>
): Promise<unknown> {
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
    const cacheTTL = getCacheTTL();

    if (cached) {
      const now = new Date();
      const cacheAge = now.getTime() - cached.lastUpdated.getTime();

      // Optimización de marcador final: Si la data es definitiva (sesión cerrada o pilotos fijos),
      // evitamos cualquier llamada externa a la API sin importar el TTL.
      if (isDataCompleted(endpoint, cached.data)) return cached.data;

      if (endpoint === 'sessions') {
        const marker = getSessionMarker(cached.data);
        if (!marker.shouldUpdate) return cached.data;
      }

      if (DYNAMIC_SESSION_ENDPOINTS.has(endpoint) && endpoint !== 'sessions') {
        const sessionsCache = await findSessionsCache(queryParams);
        if (sessionsCache) {
          const marker = getSessionMarker(sessionsCache.data);
          if (!marker.shouldUpdate) return cached.data;
        } else if (cacheAge < cacheTTL) {
          return cached.data;
        }
      }

      if (!DYNAMIC_SESSION_ENDPOINTS.has(endpoint) && cacheAge < cacheTTL) {
        return cached.data;
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
    let metadata: Record<string, unknown> | undefined;

    if (endpoint === 'drivers' || isDataCompleted(endpoint, data) || endpoint === 'sessions' || DYNAMIC_SESSION_ENDPOINTS.has(endpoint)) {
      expiresAt = new Date('2099-12-31T23:59:59Z');
    } else {
      expiresAt = new Date(Date.now() + getCacheTTL());
    }

    if (endpoint === 'sessions') {
      metadata = { sessionMarker: getSessionMarker(data) };
    }

    await F1Cache.updateOne(
      { endpoint: cacheKey },
      {
        endpoint: cacheKey,
        data,
        metadata,
        lastUpdated: new Date(),
        expiresAt,
      },
      { upsert: true }
    );

    return data;
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
        return cached.data;
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
  return (AVAILABLE_ENDPOINTS as readonly string[]).includes(baseEndpoint);
}
