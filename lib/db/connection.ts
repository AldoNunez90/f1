import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_F1DB_URI = process.env.MONGODB_F1DB_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Por favor define la variable MONGODB_URI en .env.local');
}

// 1. Tipados específicos para cada conexión
interface DefaultCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

interface F1DbCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

interface DualMongooseCache {
  defaultCache: DefaultCache;
  f1dbCache: F1DbCache;
}

declare global {
  var mongooseDualCache: DualMongooseCache | undefined;
}

const cached: DualMongooseCache = global.mongooseDualCache || {
  defaultCache: { conn: null, promise: null },
  f1dbCache: { conn: null, promise: null },
};

if (!global.mongooseDualCache) {
  global.mongooseDualCache = cached;
}

/**
 * Conexión por defecto (apunta a 'test' / MONGODB_URI original)
 */
export default async function connectDB(): Promise<typeof mongoose> {
  if (cached.defaultCache.conn) return cached.defaultCache.conn;

  if (!cached.defaultCache.promise) {
    cached.defaultCache.promise = mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
    });
  }

  try {
    cached.defaultCache.conn = await cached.defaultCache.promise;
  } catch (e) {
    cached.defaultCache.promise = null;
    throw e;
  }

  return cached.defaultCache.conn;
}

/**
 * Conexión para datos históricos de F1 (apunta a 'f1db' / MONGODB_F1DB_URI)
 */
export async function getF1Db(): Promise<mongoose.mongo.Db> {
  if (cached.f1dbCache.conn && cached.f1dbCache.conn.db) {
    return cached.f1dbCache.conn.db;
  }

  if (!cached.f1dbCache.promise) {
    const uriToUse = MONGODB_F1DB_URI!;
    // createConnection retorne una instancia de mongoose.Connection
    cached.f1dbCache.promise = mongoose.createConnection(uriToUse, {
      bufferCommands: false,
    }).asPromise();
  }

  try {
    const conn = await cached.f1dbCache.promise;
    cached.f1dbCache.conn = conn;

    // Retornamos el objeto Db de la conexión conectada a f1db
    const db = conn.useDb('f1db').db;
    if (!db) {
      throw new Error('No se pudo obtener el objeto Db de f1db');
    }
    return db;
  } catch (e) {
    cached.f1dbCache.promise = null;
    throw e;
  }
}