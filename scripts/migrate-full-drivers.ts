// scripts/migrate-full-drivers.ts
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_F1DB_URI;
const DB_NAME = 'f1_dashboard';
const COLLECTION_NAME = 'drivers_profile';

// Asegúrate de que esta ruta apunte a donde tienes guardado f1db-drivers.csv
const CSV_FILE_PATH = path.join(process.cwd(), 'data', 'f1db-drivers.csv');

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI no está definida en .env.local');
  process.exit(1);
}

// Helpers para sanitizar datos
const parseNumber = (val?: string): number => {
  if (!val || val.trim() === '') return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

const parseNullableNumber = (val?: string): number | null => {
  if (!val || val.trim() === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
};

const parseString = (val?: string): string | null => {
  if (!val || val.trim() === '') return null;
  return val.trim();
};

async function migrate() {
  console.log('🚀 Iniciando re-importación completa desde f1db-drivers.csv...');
  
  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`❌ No se encontró el archivo CSV en: ${CSV_FILE_PATH}`);
    console.log('👉 Verifica la carpeta donde guardaste f1db-drivers.csv');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI as string);

  try {
    await client.connect();
    console.log(`✅ Conectado a MongoDB -> Base de datos: ${DB_NAME}`);
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const rows: Record<string, string>[] = [];

    // 1. Leer el archivo CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on('data', (data) => rows.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📥 CSV leído exitosamente. Se encontraron ${rows.length} registros.`);

    let updatedCount = 0;

    // 2. Procesar fila por fila y actualizar MongoDB
    for (const row of rows) {
      const driverId = row.id;

      if (!driverId) continue;

      // Mapeamos nationalityCountryId a countryId para que coincida con tus componentes existentes
      const countryId = parseString(row.nationalityCountryId) || parseString(row.countryOfBirthCountryId);

      const updatedPayload = {
        name: row.name,
        firstName: parseString(row.firstName),
        lastName: parseString(row.lastName),
        fullName: parseString(row.fullName) || row.name,
        abbreviation: parseString(row.abbreviation),
        permanentNumber: parseNullableNumber(row.permanentNumber),
        gender: parseString(row.gender),
        dateOfBirth: parseString(row.dateOfBirth),
        dateOfDeath: parseString(row.dateOfDeath),
        placeOfBirth: parseString(row.placeOfBirth),

        // Mapeo de Nacionalidades / Banderas
        countryId: countryId, // 👈 Usado por tus DriverCards existentes
        countryOfBirthCountryId: parseString(row.countryOfBirthCountryId),
        nationalityCountryId: parseString(row.nationalityCountryId),
        secondNationalityCountryId: parseString(row.secondNationalityCountryId),

        // Estadísticas completas
        stats: {
          wins: parseNumber(row.totalRaceWins),
          podiums: parseNumber(row.totalPodiums),
          poles: parseNumber(row.totalPolePositions),
          championships: parseNumber(row.totalChampionshipWins),
          fastestLaps: parseNumber(row.totalFastestLaps),
          entries: parseNumber(row.totalRaceEntries),
          starts: parseNumber(row.totalRaceStarts),
          laps: parseNumber(row.totalRaceLaps),
          points: parseNumber(row.totalPoints),
          sprintRaceStarts: parseNumber(row.totalSprintRaceStarts),
          sprintRaceWins: parseNumber(row.totalSprintRaceWins),
          driverOfTheDay: parseNumber(row.totalDriverOfTheDay),
          grandSlams: parseNumber(row.totalGrandSlams),
        },

        // Mejores marcas e hitos
        records: {
          bestChampionshipPosition: parseNullableNumber(row.bestChampionshipPosition),
          bestStartingGridPosition: parseNullableNumber(row.bestStartingGridPosition),
          bestRaceResult: parseNullableNumber(row.bestRaceResult),
          bestSprintRaceResult: parseNullableNumber(row.bestSprintRaceResult),
        },
      };

      // $set actualiza/agrega los nuevos campos sin borrar los existentes (como teamsHistory)
      await collection.updateOne(
        { _id: driverId },
        { $set: updatedPayload },
        { upsert: true }
      );

      updatedCount++;
      if (updatedCount % 150 === 0) {
        console.log(`⏳ Procesados ${updatedCount}/${rows.length} pilotos...`);
      }
    }

    console.log(`🎉 ¡Migración finalizada! ${updatedCount} documentos actualizados en 'drivers_profile'.`);

  } catch (error) {
    console.error('❌ Error ejecutando la migración:', error);
  } finally {
    await client.close();
    console.log('🔌 Conexión con MongoDB cerrada.');
  }
}

migrate();