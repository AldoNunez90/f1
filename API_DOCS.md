# F1 News API - Open F1 Integration

## Configuración

### Variables de Entorno

Copia `.env.example` a `.env.local` y configura:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/f1news?retryWrites=true&w=majority
```

### Instalación de Dependencias

```bash
pnpm install
```

## API Endpoints

### Endpoints Disponibles

La API de Open F1 proporciona los siguientes endpoints:

- `/api/f1/drivers` - Lista de pilotos
- `/api/f1/races` - Calendario de carreras
- `/api/f1/sessions` - Sesiones de entrenamiento, clasificación y carrera
- `/api/f1/laps` - Datos de vueltas
- `/api/f1/intervals` - Intervalos entre pilotos
- `/api/f1/pit_stops` - Paradas en pits
- `/api/f1/weather` - Datos meteorológicos
- `/api/f1/positions` - Posiciones en vivo
- `/api/f1/qualifying` - Datos de clasificación
- `/api/f1/race_control_events` - Eventos de control de carrera

### Ejemplos de Uso

```bash
# Obtener todos los pilotos
curl http://localhost:3000/api/f1/drivers

# Obtener carreras de una temporada específica
curl http://localhost:3000/api/f1/races?year=2024

# Obtener vueltas de una sesión específica
curl http://localhost:3000/api/f1/laps?session_key=9158

# Obtener datos meteorológicos de una sesión
curl http://localhost:3000/api/f1/weather?session_key=9158
```

## Caché y Sincronización Automática

### Comportamiento del Caché

El sistema implementa un caché inteligente basado en el calendario de F1:

**Durante fin de semana de carrera (Viernes a Lunes):**
- Caché: 5 minutos
- Sincronización automática: cada 5 minutos
- Objetivo: Mantener datos en tiempo real durante las sesiones

**Durante semana normal:**
- Caché: 6 horas
- Sincronización automática: 2 AM, 8 AM, 2 PM, 8 PM
- Objetivo: Reducir llamadas a API, mantener datos frescos

### Sincronización Automática

Los datos se sincronizan automáticamente a través de:

1. **Cron Jobs** - Ejecutados según el cronograma anterior
2. **Lazy Loading** - Si los datos están expirados, se actualizan en tiempo real
3. **Fallback en Caché Stale** - Si falla la API, se retornan datos en caché aunque estén expirados

## Arquitectura

### Estructura de Carpetas

```
lib/
├── db/
│   └── connection.ts         # Conexión a MongoDB
├── models/
│   └── F1Cache.ts            # Modelo de caché
├── services/
│   └── f1Service.ts          # Servicio de fetch y caché
├── utils/
│   └── racingWeekend.ts      # Utilidades de detectar fin de semana
├── cron/
│   └── syncF1Data.ts         # Jobs automáticos
├── config.ts                 # Configuración
├── init.ts                   # Inicialización de servicios
```

### Flujo de Datos

```
Request → Route Handler (/api/f1/[...path])
         ↓
    Validar Endpoint
         ↓
    f1Service.fetchF1Data()
         ↓
    ┌────────────────────┐
    ├→ ¿Caché válido?    │
    │   Sí → Retornar    │
    │   No → Fetch API   │
    └────────────────────┘
         ↓
    MongoDB (Guardar/Actualizar)
         ↓
    Retornar Response con Headers de Caché
```

## Ventajas del Sistema

✅ **Dinámico**: Soporta todos los endpoints de Open F1 automáticamente
✅ **Eficiente**: Caché inteligente con MongoDB
✅ **Automático**: Sincronización sin intervención manual
✅ **Escalable**: MongoDB permite crecer sin límites
✅ **Resiliente**: Fallback a caché en caso de error
✅ **Rápido**: Respuestas en caché sin latencia de API
✅ **Flexible**: TTL y sincronización adaptable

## Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev

# Build
pnpm build

# Production
pnpm start

# Linting
pnpm lint
```

## Open F1 API

Documentación oficial: https://openf1.org/

Los datos de Open F1 son libres y no requieren autenticación. El servicio:
- Proporciona datos de F1 actualizados
- Actualiza en tiempo real durante sesiones
- Incluye telemetría, posiciones, timings, etc.

## Próximas Mejoras

- [ ] Endpoints específicos con datos históricos
- [ ] Estadísticas agregadas (wins, poles, etc.)
- [ ] Comparativas entre pilotos
- [ ] Alertas de cambios en sesiones
- [ ] Rate limiting
- [ ] Logs de sincronización
