# Arquitectura del Sistema F1 News API

```mermaid
graph TB
    subgraph Client["Frontend (Next.js)"]
        App["React App"]
        Hook["useF1Data Hook"]
        App -->|uses| Hook
    end
    
    subgraph API["API Layer"]
        Route["GET /api/f1/[...path]"]
        Validate["Validar Endpoint"]
        Route -->|request| Validate
    end
    
    subgraph Cache["Caché Layer"]
        Service["f1Service.ts"]
        Validate -->|fetch| Service
        Service -->|check| Cache["MongoDB Cache"]
        Cache -->|valid| Service
    end
    
    subgraph External["Open F1 API"]
        F1["https://api.openf1.org/v1"]
        Service -->|fetch if expired| F1
        F1 -->|response| Service
    end
    
    subgraph Auto["Automatización"]
        Cron["node-cron"]
        RaceDetect["racingWeekend.ts"]
        Sync["syncF1Data.ts"]
        Cron -->|check| RaceDetect
        RaceDetect -->|every 5min or 6h| Sync
        Sync -->|update cache| Cache
    end
    
    subgraph Response["Respuesta"]
        CacheControl["Cache-Control Headers"]
        JSON["JSON Response"]
        Route -->|response| JSON
        Route -->|headers| CacheControl
    end
    
    Hook -->|fetch| Route
    JSON -->|data| Hook
    
    style Client fill:#e1f5ff
    style API fill:#f3e5f5
    style Cache fill:#fce4ec
    style External fill:#fff3e0
    style Auto fill:#e8f5e9
    style Response fill:#f1f8e9
```

## Flujo de Datos Detallado

### 1. Primera Request (Cache Miss)

```
Cliente: GET /api/f1/drivers
   ↓
Route Handler
   ↓
f1Service.fetchF1Data('drivers')
   ↓
¿MongoDB tiene cache válido?
   ↓ NO
Fetch: https://api.openf1.org/v1/drivers
   ↓
MongoDB: Insert/Update documento
   ↓
Retornar datos (⚡ rápido porque ya están en caché)
```

### 2. Segunda Request (Cache Hit)

```
Cliente: GET /api/f1/drivers
   ↓
Route Handler
   ↓
f1Service.fetchF1Data('drivers')
   ↓
¿MongoDB tiene cache válido?
   ↓ SÍ (menos de 5 min / 6 horas)
Retornar datos ⚡ INSTANT
```

### 3. Sincronización Automática

```
node-cron
   ↓
¿Es fin de semana de carrera?
   ├─ SÍ → Ejecutar cada 5 minutos
   └─ NO → Ejecutar cada 6 horas (2 AM, 8 AM, 2 PM, 8 PM)
   ↓
Para cada endpoint:
   ├─ drivers
   ├─ races
   ├─ sessions
   ├─ laps
   ├─ weather
   └─ ... (todos)
   ↓
f1Service.fetchF1Data(endpoint)
   ↓
Actualizar MongoDB
   ↓
Log: "✓ Synced: endpoint"
```

## Componentes Clave

### 1. API Dinámica
- Endpoint: `/api/f1/[...path]`
- Soporta todos los endpoints de Open F1
- Valida endpoints automáticamente
- Soporta query parameters

### 2. Servicio de Caché
- Verifica MongoDB primero
- Si no hay/expirado: Fetch a Open F1
- Almacena con TTL automático
- Fallback a caché stale si falla API

### 3. Sincronización Automática
- Cron jobs cada 5 minutos (fin de semana)
- Cron jobs cada 6 horas (entre semana)
- Detecta fin de semana automáticamente
- Sincroniza todos los endpoints

### 4. Frontend Integration
- Hook React `useF1Data`
- Auto-refetch opcional
- Error handling incluido
- Type-safe con TypeScript

## Base de Datos MongoDB

```
Database: f1news
│
└── Collection: f1caches
    │
    ├── _id: ObjectId
    ├── endpoint: String (unique, indexed)
    ├── data: Object (mixed JSON)
    ├── lastUpdated: Date
    └── expiresAt: Date (TTL index)
```

## Timing TTL

```
Request en tiempo t
   ↓
MongoDB check → Valid if (now - lastUpdated) < TTL
   │
   ├─ Fin de semana (Vie-Lun): TTL = 5 minutos
   └─ Entre semana: TTL = 6 horas
   ↓
Si expired → Fetch Open F1
Si valid → Retornar desde MongoDB
```

## Escalabilidad

- **Frontend**: Puede haber muchos usuarios
- **API Next.js**: Stateless, puede escalarse horizontalmente
- **MongoDB**: Puede almacenar millones de cachés
- **Cron**: Una instancia sincroniza para todos
- **Open F1**: API pública, sin límite de requests (en general)

## Seguridad

- Variables de entorno protegidas (.env.local)
- MongoDB URI en variables
- Validación de endpoints
- TTL automático para limpiar datos viejos
- Logs de sincronización para auditar

---

*Arquitectura diseñada para ser eficiente, escalable y sin mantenimiento manual.*
