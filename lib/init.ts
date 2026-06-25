import { initF1CronJobs } from '@/lib/cron/syncF1Data';

let cronJobsInitialized = false;

/**
 * Inicializa los servicios de la aplicación
 * Se ejecuta solo una vez al inicio del servidor
 */
export function initializeAppServices() {
  if (cronJobsInitialized) {
    return;
  }

  try {
    // Inicializar cron jobs para sincronización automática
    initF1CronJobs();
    cronJobsInitialized = true;
    console.log('App services initialized successfully');
  } catch (error) {
    console.error('Error initializing app services:', error);
  }
}
