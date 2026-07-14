import cron from 'node-cron';
import connectDB from '@/lib/db/connection';
import { fetchF1Data, AVAILABLE_ENDPOINTS, isDataCompleted } from '@/lib/services/f1Service';
import { isRacingWeekend } from '@/lib/utils/racingWeekend';

/**
 * Sincroniza datos de Open F1 automáticamente
 * Ejecuta cada 8 horas durante fin de semana de carrera (viernes a lunes)
 * Ejecuta 1 vez al día (2 AM) el resto de los días (martes a jueves)
 */
export function initF1CronJobs() {
  console.log('Initializing F1 data sync cron jobs...');

  // Cron para fin de semana de carrera (viernes a lunes): cada 8 horas
  cron.schedule('0 */8 * * *', async () => { // A los 0 minutos de cada 8va hora
    if (isRacingWeekend()) {
      // Verificación de marcador de fin: si todas las sesiones del año/GP ya terminaron,
      // no es necesario seguir con la frecuencia de 8 horas.
      try {
        const sessions = await fetchF1Data('sessions', { year: new Date().getFullYear() });
        if (isDataCompleted('sessions', sessions)) {
          console.log('📊 Marcador de fin detectado - Saltando sincronización de alta frecuencia');
          return;
        }
      } catch (e) {
        console.warn('No se pudo verificar el marcador de fin, procediendo con sync normal', e);
      }

      console.log('🏁 GP activo detectado - sincronizando datos F1 cada 8 horas');
      await syncF1Data();
    }
  });

  // Cron para días normales (martes a jueves): 1 vez al día (2 AM)
  cron.schedule('0 2 * * *', async () => { // A las 02:00 AM cada día
    if (!isRacingWeekend()) {
      console.log('📊 Día de semana detectado - sincronizando datos F1 una vez al día a las 2 AM');
      await syncF1Data();
    }
  });



  console.log('✅ F1 cron jobs initialized');
}

/**
 * Sincroniza todos los endpoints disponibles
 */
async function syncF1Data() {
  try {
    await connectDB();

    const syncPromises = AVAILABLE_ENDPOINTS.map(async (endpoint) => {
      try {
        await fetchF1Data(endpoint);
        console.log(`✓ Synced: ${endpoint}`);
      } catch (error) {
        console.error(`✗ Failed to sync ${endpoint}:`, error);
      }
    });

    await Promise.all(syncPromises);
    console.log('F1 data sync completed');
  } catch (error) {
    console.error('Error during F1 data sync:', error);
  }
}
