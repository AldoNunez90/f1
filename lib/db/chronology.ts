import { MongoClient } from 'mongodb';

export interface ChronologyDocument {
  _id: string;
  parentConstructorId: string;
  positionDisplayOrder: number;
  constructorId: string;
  yearFrom: number;
  yearTo: number | null | { $numberDouble: string } | typeof NaN;
}

// Configuración de tu conexión de Mongo
const uri = process.env.MONGODB_F1DB_URI || '';
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_F1DB_URI) {
  throw new Error('Por favor agrega MONGODB_URI a tus variables de entorno.');
}

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

/**
 * Obtiene todas las cronologías agrupadas por su parentConstructorId
 */
export async function getAllChronologiesGrouped(): Promise<
  Record<string, ChronologyDocument[]>
> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || 'f1');
  
  const documents = await db
    .collection<ChronologyDocument>('constructors_chronology')
    .find({})
    .sort({ positionDisplayOrder: 1 })
    .toArray();

  // Mapear ObjectId a String de manera limpia
  const sanitized = documents.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
  }));

  // Agrupar por parentConstructorId
  const grouped: Record<string, ChronologyDocument[]> = {};

  sanitized.forEach((item) => {
    const parent = item.parentConstructorId;
    if (!grouped[parent]) {
      grouped[parent] = [];
    }
    grouped[parent].push(item);
  });

  return grouped;
}

/**
 * Obtiene la cronología específica para un parentConstructorId
 */
export async function getChronologyByParent(
  parentConstructorId: string
): Promise<ChronologyDocument[]> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || 'f1');

  const documents = await db
    .collection<ChronologyDocument>('constructors_chronology')
    .find({ parentConstructorId })
    .sort({ positionDisplayOrder: 1 })
    .toArray();

  return documents.map((doc) => ({
    ...doc,
    _id: doc._id.toString(),
  }));
}