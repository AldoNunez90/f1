# 🏁 F1 News API - Solución Completa

## 📋 Resumen de la Solución

He implementado un sistema completo de integración con **Open F1 API** que incluye:

### ✅ Características Implementadas

1. **API Dinámica y Flexible**
   - Endpoint `/api/f1/[...path]` que soporta todos los endpoints de Open F1
   - Soporta query parameters automáticamente
   - Validación de endpoints

2. **Caché Inteligente con MongoDB**
   - Almacenamiento eficiente en MongoDB
   - TTL automático y fallback a caché stale
   - Diferencia entre fin de semana de carrera y días normales

3. **Sincronización Automática**
   - Cron jobs que se ejecutan automáticamente
   - Cada 8 horas durante fin de semana de carrera
   - Una vez al día (2 AM) durante días normales
   - Limitado a fin de semana de carrera (viernes-lunes, marzo-noviembre)

4. **Type Safety**
   - TypeScript completo
   - Tipos definidos para Open F1 API
   - Interfaces para todas las respuestas

5. **Developer Experience**
   - Hook React `useF1Data` para consumir datos fácilmente
   - Ejemplos de uso completos
   - Documentación exhaustiva

## 📂 Estructura de Archivos

```
lib/
├── db/
│   └── connection.ts              # Conexión MongoDB con pool
├── models/
│   └── F1Cache.ts                 # Modelo de Mongoose con TTL
├── services/
│   └── f1Service.ts               # Lógica de fetch y caché
├── utils/
│   └── racingWeekend.ts           # Detección de fin de semana
├── hooks/
│   └── useF1Data.ts               # Hook React para datos
├── cron/
│   └── syncF1Data.ts              # Jobs automáticos
├── types/
│   └── f1.ts                      # Tipos TypeScript
├── config.ts                      # Configuración
└── init.ts                        # Inicialización

app/
├── api/
│   └── f1/
│       └── [...path]/
│           └── route.ts           # Endpoint dinámico
├── examples/
│   └── page.tsx                   # Ejemplos de uso
└── layout.tsx                     # (Actualizado con init)

scripts/
└── sync-f1-data.js                # Script manual de sincronización
```

## 🚀 Comenzar

### 1. Instalar Dependencias

```bash
pnpm install
```

### 2. Configurar MongoDB

Ver [SETUP.md](./SETUP.md) para configuración detallada:
- MongoDB Atlas (recomendado)
- O MongoDB local

### 3. Variables de Entorno

```bash
cp .env.example .env.local
# Editar .env.local con tu MONGODB_URI
```

### 4. Iniciar Servidor

```bash
pnpm dev
```

## 📡 Uso de la API

### Endpoints Disponibles

```bash
# Pilotos
GET /api/f1/drivers

# Carreras
GET /api/f1/races?year=2024

# Sesiones
GET /api/f1/sessions?year=2024&round=1

# Vueltas (con filtros)
GET /api/f1/laps?session_key=9158

# Paradas en pits
GET /api/f1/pit_stops?session_key=9158

# Clima
GET /api/f1/weather?session_key=9158

# Posiciones
GET /api/f1/positions?session_key=9158

# Intervalos
GET /api/f1/intervals?session_key=9158

# Clasificación
GET /api/f1/qualifying?session_key=9158

# Eventos de control de carrera
GET /api/f1/race_control_events?session_key=9158
```

### Respuesta de la API

```json
{
  "success": true,
  "endpoint": "drivers",
  "queryParams": null,
  "data": [...],
  "cached": true,
  "timestamp": "2024-03-15T10:30:00Z"
}
```

## 🎣 Usar el Hook React

```tsx
'use client';

import { useF1Data } from '@/lib/hooks/useF1Data';

export function MyComponent() {
  const { data, loading, error, refetch } = useF1Data({
    endpoint: 'drivers',
  });

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <button onClick={refetch}>Actualizar</button>
      {/* Usar data */}
    </div>
  );
}
```

## 🕐 Sincronización Automática

### Cron Schedule

| Periodo | Frecuencia | Endpoints |
|---------|-----------|-----------|
| Fin de semana de carrera (Vie-Lun) | Cada 8 horas | Todos |
| Fuera de temporada | No | No sincroniza |

### Sincronizar Manualmente

```bash
pnpm sync-f1-data
```

## 💾 Caché

### Tiempo de Vida

| Escenario | TTL |
|-----------|-----|
| Fin de semana de carrera | 8 horas |
| Días normales | 6 horas |

### Comportamiento

1. Request → Buscar en caché
2. Si caché válido → Retornar inmediatamente
3. Si caché expirado → Fetch de API + actualizar
4. Si API falla → Retornar caché stale + log de advertencia

## 📊 MongoDB Estructura

```
Database: f1news
Collection: f1caches
├── _id: ObjectId
├── endpoint: String (indexed, unique)
├── data: Object
├── lastUpdated: Date
└── expiresAt: Date (TTL index)
```

## 🛠️ Ventajas de la Solución

✅ **Dinámico**: Nuevo endpoint sin código - solo query a `endpoint`
✅ **Eficiente**: MongoDB para acceso rápido, no archivos locales
✅ **Automático**: Sincronización sin intervención
✅ **Escalable**: MongoDB crece sin límites
✅ **Resiliente**: Fallback a caché en caso de error
✅ **Flexible**: TTL y sincronización adaptables
✅ **Type-Safe**: TypeScript completo
✅ **Developer-Friendly**: Hook React listo para usar

## 📚 Documentación

- [SETUP.md](./SETUP.md) - Guía de instalación
- [API_DOCS.md](./API_DOCS.md) - Documentación API detallada
- [app/examples/page.tsx](./app/examples/page.tsx) - Ejemplos React

## 🐛 Troubleshooting

Ver [SETUP.md](./SETUP.md#troubleshooting) para solución de problemas comunes.

## 🚀 Próximas Mejoras (Opcionales)

- [ ] Cache warming strategy
- [ ] Estadísticas agregadas
- [ ] Comparativas entre pilotos
- [ ] WebSocket para datos en vivo
- [ ] Rate limiting
- [ ] Dashboard de admin

---

**¡Listo para usar!** Sigue los pasos en [SETUP.md](./SETUP.md) para comenzar.
