// Cron jobs disabled: import removed to avoid automatic short-interval syncs

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
    // Inicializar programador de sesiones en el servidor
    // (no reinstala crons de intervalo corto; usa marcadores por sesión)
    import('./cron/sessionScheduler').then((mod) => {
      mod.initSessionScheduler().catch((err) => console.warn('Session scheduler init failed:', err));
    });
    cronJobsInitialized = true;
    console.log('App services initialized successfully');
  } catch (error) {
    console.error('Error initializing app services:', error);
  }
}
