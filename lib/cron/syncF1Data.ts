import connectDB from '@/lib/db/connection';
import { fetchF1Data } from '@/lib/services/f1Service';

/**
 * Los cronjobs automáticos de intervalos cortos están deshabilitados.
 * Se conserva por compatibilidad y uso manual.
 */
export function initF1CronJobs() {
  console.log('F1 cron jobs are disabled (no short-interval syncs).');
}

/**
 * Sincroniza únicamente los datos esenciales y livianos de la F1
 */
export async function syncF1Data() {
  try {
    await connectDB();

    // Definimos explícitamente el tipo del objeto params como Record<string, string | number>
    const essentialEndpoints: { endpoint: string; params?: Record<string, string | number> }[] = [
      { endpoint: 'sessions', params: { year: 2026 } },
      { endpoint: 'drivers', params: { session_key: 'latest' } },
      { endpoint: 'session_result', params: { session_key: 'latest' } },
    ];

    for (const item of essentialEndpoints) {
      try {
        await fetchF1Data(item.endpoint, item.params);
        console.log(`✓ Synced: ${item.endpoint}`);
      } catch (error) {
        console.error(`✗ Failed to sync ${item.endpoint}:`, error);
      }
    }

    console.log('F1 essential data sync completed');
  } catch (error) {
    console.error('Error during F1 data sync:', error);
  }
}

