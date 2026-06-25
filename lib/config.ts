/**
 * Configuración de variables de entorno
 */

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/f1news';

// Open F1 API (gratuita, sin autenticación necesaria)
export const OPEN_F1_API = 'https://api.openf1.org/v1';

// Timeouts y límites
export const FETCH_TIMEOUT = 10000; // 10 segundos
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // 1 segundo
