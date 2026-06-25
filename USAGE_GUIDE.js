#!/usr/bin/env node

/**
 * Comando: pnpm dev
 * Inicia el servidor en modo desarrollo
 *
 * Qué hace:
 * 1. Inicia Next.js en puerto 3000
 * 2. Inicializa los cron jobs automáticamente
 * 3. Conecta a MongoDB
 * 4. Sincroniza datos de Open F1
 */

/**
 * Comando: pnpm build && pnpm start
 * Para producción
 *
 * Qué hace:
 * 1. Build del proyecto TypeScript
 * 2. Optimización de código
 * 3. Inicia servidor en puerto 3000
 * 4. Los cron jobs funcionan igual
 */

/**
 * Comando: pnpm sync-f1-data
 * Sincronización manual de datos
 *
 * Qué hace:
 * 1. Conecta a MongoDB
 * 2. Sincroniza todos los endpoints
 * 3. Muestra progreso
 * 4. Reporta éxitos/fallos
 *
 * Cuándo usar:
 * - Después de un fallo de sincronización
 * - Para llenar caché inicialmente
 * - Para forzar actualización inmediata
 */

/**
 * Comando: pnpm lint
 * Verificar código
 *
 * Qué hace:
 * 1. Ejecuta ESLint
 * 2. Verifica TypeScript
 */

/**
 * Cómo usar los endpoints:
 */

// Opción 1: Curl desde terminal
// $ curl http://localhost:3000/api/f1/drivers
// $ curl "http://localhost:3000/api/f1/races?year=2024"

// Opción 2: Fetch desde JavaScript
fetch('http://localhost:3000/api/f1/drivers')
  .then(res => res.json())
  .then(data => console.log(data.data));

// Opción 3: Hook React (RECOMENDADO)
import { useF1Data } from '@/lib/hooks/useF1Data';

export function MyComponent() {
  const { data, loading, error } = useF1Data({
    endpoint: 'drivers',
    // refetchInterval: 5000, // Actualizar cada 5s (opcional)
  });

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {/* Usar data */}
    </div>
  );
}

/**
 * Estructura de respuesta de API:
 */
{
  "success": true,
  "endpoint": "drivers",
  "queryParams": null,
  "data": [
    {
      "driver_number": 1,
      "first_name": "Max",
      "last_name": "Verstappen",
      // ... más campos
    }
  ],
  "cached": true,
  "timestamp": "2024-03-15T10:30:00Z"
}

/**
 * Archivos importantes a conocer:
 */

// 1. Para agregar nuevo endpoint:
// → Editar lib/services/f1Service.ts
// → Agregar a AVAILABLE_ENDPOINTS

// 2. Para cambiar timing de caché:
// → Editar lib/utils/racingWeekend.ts
// → Modificar getCacheTTL()

// 3. Para cambiar schedule de cron:
// → Editar lib/cron/syncF1Data.ts
// → Modificar cron.schedule()

// 4. Para agregar tipos adicionales:
// → Editar lib/types/f1.ts
// → Agregar interfaces

// 5. Para cambiar comportamiento del hook:
// → Editar lib/hooks/useF1Data.ts
// → Ajustar lógica de fetch/refetch

/**
 * Debugging:
 */

// Logs en consola:
// ✅ F1 cron jobs initialized
// ✓ Synced: drivers
// ✗ Failed to sync races: Error message

// Ver MongoDB:
// → Abre MongoDB Compass o Atlas UI
// → Database: f1news
// → Collection: f1caches
// → Ver documentos y su TTL

// Ver headers HTTP:
// → Chrome DevTools → Network
// → Request a /api/f1/...
// → Ver Cache-Control headers

/**
 * Monitoreo:
 */

// 1. Ver logs de Next.js en terminal
// 2. Contar documentos en MongoDB: db.f1caches.countDocuments()
// 3. Ver documentos más antiguos: db.f1caches.find().sort({ lastUpdated: 1 }).limit(5)

/**
 * Optimización:
 */

// 1. En fin de semana: Aumentar TTL a 2 minutos si es muy frecuente
// 2. Entre semana: Puede ser más de 6 horas si no necesita data fresca
// 3. Limitar endpoints sincronizados si hay muchos
// 4. Usar índices en MongoDB para queries frecuentes
