import { MongoClient } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_F1DB_URI = process.env.MONGODB_F1DB_URI;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!MONGODB_F1DB_URI || !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("❌ ERROR: Faltan variables de entorno requeridas en .env");
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const WIKIMEDIA_HEADERS = {
  "User-Agent": "F1DashboardApp/1.0 (contacto@tu-dominio.com)",
};

async function fetchWikipediaImageUrl(driverName: string): Promise<string | null> {
  try {
    // 👈 Agregado &redirects=1 para resolver automáticamente apodos y desambiguaciones
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      driverName
    )}&prop=pageimages&redirects=1&format=json&pithumbsize=600&origin=*`;

    const res = await fetch(url, { headers: WIKIMEDIA_HEADERS });
    if (!res.ok) return null;

    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;

    const pageKey = Object.keys(pages)[0];
    if (pageKey === "-1") return null;

    return pages[pageKey]?.thumbnail?.source || null;
  } catch {
    return null;
  }
}

async function downloadImageAsBuffer(imageUrl: string): Promise<Buffer | null> {
  try {
    const res = await fetch(imageUrl, { headers: WIKIMEDIA_HEADERS });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

async function run() {
  const client = new MongoClient(MONGODB_F1DB_URI!);

  try {
    await client.connect();
    console.log("✅ Conectado a MongoDB.");

    // 👈 1. ASEGURA EL NOMBRE DE TU BASE DE DATOS AQUÍ
    const db = client.db("f1_dashboard"); // Cambia 'f1_dashboard' si tu DB se llama distinto
    const driversCollection = db.collection("drivers_profile");

    const driversToProcess = await driversCollection.find({}).toArray();

    console.log(`🚀 Procesando ${driversToProcess.length} pilotos encontrados...\n`);

    if (driversToProcess.length === 0) {
      console.warn("⚠️ No se encontraron documentos en la colección 'drivers_profile'. Verifica el nombre de la DB o Colección.");
      return;
    }

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < driversToProcess.length; i++) {
      const driver = driversToProcess[i];
      const driverId = driver._id.toString();
      const queryName = (driver.fullName || driver.name || driverId) as string;

      process.stdout.write(`[${i + 1}/${driversToProcess.length}] Buscando: ${queryName}... `);

      // 1. Intento principal con nombre completo
      let imageUrl = await fetchWikipediaImageUrl(queryName);

      // Fallback A: Intentar agregando "(racing driver)" si no encuentra por nombre directo
      if (!imageUrl) {
        imageUrl = await fetchWikipediaImageUrl(`${queryName} (racing driver)`);
      }

      // Fallback B: Intentar con la propiedad 'name'
      if (!imageUrl && driver.name) {
        imageUrl = await fetchWikipediaImageUrl(driver.name as string);
      }

      if (imageUrl) {
        const imageBuffer = await downloadImageAsBuffer(imageUrl);

        if (imageBuffer) {
          try {
            const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

            const uploadResult = await cloudinary.uploader.upload(base64Image, {
              folder: "f1-dashboard/drivers",
              public_id: driverId,
              overwrite: true,
              transformation: [
                { width: 500, height: 600, crop: "fill", gravity: "face" },
                { quality: "auto", fetch_format: "auto" },
              ],
            });

            await driversCollection.updateOne(
              { _id: driver._id },
              { $set: { imageUrl: uploadResult.secure_url } }
            );

            console.log(`✅ ¡Subido a Cloudinary!`);
            successCount++;
          } catch (uploadErr) {
            console.log(`❌ Error Cloudinary:`, uploadErr);
            failedCount++;
          }
        } else {
          console.log(`❌ Falló la descarga de la imagen`);
          failedCount++;
        }
      } else {
        console.log(`⚠️ Sin foto en Wikipedia`);
        failedCount++;
      }

      await sleep(600);
    }

    console.log("\n==========================================");
    console.log(`🎉 ¡Proceso finalizado!`);
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`⚠️ Sin foto / Errores: ${failedCount}`);
    console.log("==========================================");

  } catch (error) {
    console.error("❌ Error fatal:", error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

run();