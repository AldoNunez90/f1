# 🎨 Frontend - F1 News

## Descripción General

Frontend profesional y escalable para F1 News, desarrollado con Next.js 16, TypeScript y Tailwind CSS.

### Características

✅ **Componentes Reutilizables**
- Cards para cada tipo de dato (Drivers, Teams, Races, Sessions)
- Componentes comunes (Loading, Error, Empty State)
- Layout con Navbar responsivo

✅ **Páginas Dinámicas**
- Dashboard principal (Home)
- Página de Pilotos
- Página de Equipos
- Página de Carreras
- Página de Sesiones

✅ **Integración con API**
- Hook React `useF1Data` para consumir datos
- Auto-refetch opcional
- Caché automático desde MongoDB

✅ **Diseño Responsivo**
- Mobile-first approach
- Dark mode incluido
- Tailwind CSS 4

✅ **Type-Safe**
- TypeScript completo
- Interfaces tipadas
- Error handling

---

## 📂 Estructura de Carpetas

```
app/
├── (sections)/                     # Rutas principales
│   ├── drivers/
│   │   └── page.tsx               # Página de pilotos
│   ├── teams/
│   │   └── page.tsx               # Página de equipos
│   ├── races/
│   │   └── page.tsx               # Página de carreras
│   └── sessions/
│       └── page.tsx               # Página de sesiones
│
├── components/
│   ├── cards/                      # Componentes de cards
│   │   ├── DriverCard.tsx
│   │   ├── TeamCard.tsx
│   │   ├── RaceCard.tsx
│   │   └── SessionCard.tsx
│   │
│   ├── layout/                     # Componentes de layout
│   │   └── Navbar.tsx
│   │
│   └── common/                     # Componentes comunes
│       ├── Loading.tsx
│       └── Error.tsx
│
├── layout.tsx                      # Root layout
└── page.tsx                        # Home (Dashboard)

lib/
├── utils/
│   └── formatters.ts              # Funciones de formato
├── hooks/
│   └── useF1Data.ts               # Hook para datos
└── types/
    └── f1.ts                      # Tipos TypeScript
```

---

## 🎨 Componentes Disponibles

### Cards

#### DriverCard
```tsx
<DriverCard
  driver_number={1}
  first_name="Max"
  last_name="Verstappen"
  team="RED_BULL"
  country_code="NL"
/>
```

#### TeamCard
```tsx
<TeamCard
  name="RED_BULL"
  drivers={[...]}
  points={500}
/>
```

#### RaceCard
```tsx
<RaceCard
  year={2024}
  round={5}
  location="Monaco"
  circuit_name="Circuit de Monaco"
  date="2024-05-26"
/>
```

#### SessionCard
```tsx
<SessionCard
  session_type="Race"
  circuit_name="Monza"
  date_start="2024-09-01"
  is_open={false}
  year={2024}
  round={16}
/>
```

### Componentes Comunes

#### Loading
```tsx
import { LoadingSpinner, LoadingGrid } from '@/app/components/common/Loading';

<LoadingSpinner />
<LoadingGrid /> // Grid de 8 items en skeleton
```

#### Error
```tsx
import { ErrorMessage, EmptyState } from '@/app/components/common/Error';

<ErrorMessage message="Error al cargar" onRetry={() => {}} />
<EmptyState title="Sin datos" icon="📭" />
```

---

## 🪝 Hook React - useF1Data

### Uso Básico

```tsx
'use client';

import { useF1Data } from '@/lib/hooks/useF1Data';

export function MyComponent() {
  const { data, loading, error, refetch } = useF1Data({
    endpoint: 'drivers',
  });

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

### Con Query Parameters

```tsx
const { data } = useF1Data({
  endpoint: 'races',
  queryParams: { year: 2024 },
});
```

### Con Auto-Refetch

```tsx
const { data } = useF1Data({
  endpoint: 'laps',
  queryParams: { session_key: 9158 },
  refetchInterval: 5000, // Cada 5 segundos
});
```

---

## 🎨 Funciones de Formato

### Disponibles en `lib/utils/formatters.ts`

```typescript
formatDate(dateString)              // "15 mar 2024"
formatDateTime(dateString)          // "15 mar 2024, 14:30"
formatSessionType(type)             // "🏎️ Carrera"
formatTeamName(team)                // "Red Bull" (from RED_BULL)
getTeamColor(team)                  // "#0600EF" (color del equipo)
getCountryFlag(countryCode)         // "🇪🇸" (bandera del país)
formatNumber(num, decimals)         // "123.45"
getSessionStatusBadge(isOpen)       // { text: "En vivo", color: "..." }
```

### Ejemplo

```tsx
import { formatDate, getCountryFlag } from '@/lib/utils/formatters';

export function MyComponent() {
  return (
    <div>
      <p>{formatDate('2024-03-15')}</p>
      <span>{getCountryFlag('ES')}</span>
    </div>
  );
}
```

---

## 🌍 Routing

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `app/page.tsx` | Dashboard principal |
| `/drivers` | `app/(sections)/drivers/page.tsx` | Lista de pilotos |
| `/teams` | `app/(sections)/teams/page.tsx` | Lista de equipos |
| `/races` | `app/(sections)/races/page.tsx` | Lista de carreras |
| `/sessions` | `app/(sections)/sessions/page.tsx` | Lista de sesiones |

---

## 🎯 Páginas Detalladas

### Home (Dashboard)

- Hero section con descripción
- Estadísticas generales (count de cada sección)
- Grid de exploración rápida
- Sección de características

**Ubicación:** `app/page.tsx`

### Pilotos

- Grid de cards con todos los pilotos
- Información: número, nombre, equipo, país
- Colores personalizados por equipo
- Botón para actualizar datos

**Ubicación:** `app/(sections)/drivers/page.tsx`

### Equipos

- Grid de cards con equipos (agrupados de drivers)
- Información: nombre, pilotos, puntos
- Colores personalizados por equipo
- Lista de pilotos por equipo

**Ubicación:** `app/(sections)/teams/page.tsx`

### Carreras

- Grid de cards con carreras
- Información: año, ronda, fecha, circuito
- Filtro por año
- Badges con información relevante

**Ubicación:** `app/(sections)/races/page.tsx`

### Sesiones

- Grid de cards con sesiones
- Información: tipo, fecha, circuito, estado
- Color según tipo de sesión
- Status badge (en vivo/completada)

**Ubicación:** `app/(sections)/sessions/page.tsx`

---

## 🎨 Colores de Equipos

```javascript
RED_BULL       → #0600EF (Azul)
FERRARI        → #DC0000 (Rojo)
MERCEDES       → #00D2BE (Cyan)
MCLAREN        → #FF8700 (Naranja)
ASTON_MARTIN   → #006F62 (Verde)
ALPINE         → #0082FA (Azul)
ALFA_ROMEO     → #C8102E (Rojo oscuro)
HAAS           → #FFFFFF (Blanco)
WILLIAMS       → #005AFF (Azul)
KICK_SAUBER    → #C8102E (Rojo oscuro)
```

---

## 🚀 Desarrollo

### Agregar Nueva Card

1. Crear componente en `app/components/cards/NewCard.tsx`
2. Definir interface con props
3. Exportar del componente
4. Usar en página

```tsx
// app/components/cards/NewCard.tsx
'use client';

interface NewCardProps {
  // props aquí
}

export function NewCard(props: NewCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      {/* contenido */}
    </div>
  );
}
```

### Agregar Nueva Página

1. Crear carpeta en `app/(sections)/new-section/`
2. Crear `page.tsx` en esa carpeta
3. Usar `useF1Data` hook
4. Agregar link en Navbar

```tsx
// app/(sections)/new-section/page.tsx
'use client';

import { useF1Data } from '@/lib/hooks/useF1Data';

export default function NewSectionPage() {
  const { data, loading, error } = useF1Data({
    endpoint: 'new_endpoint',
  });

  return (
    <div>
      {/* contenido */}
    </div>
  );
}
```

---

## 🎨 Tailwind CSS

### Clases Personalizadas Usadas

```css
/* Grid Responsivo */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

/* Cards */
bg-white dark:bg-gray-800
rounded-xl shadow-lg hover:shadow-xl transition

/* Gradientes */
bg-gradient-to-br from-red-600 to-red-800
from-blue-600 to-blue-800

/* Text */
text-gray-900 dark:text-white
text-sm text-gray-500 dark:text-gray-400

/* Espaciado */
px-6 py-4 gap-4 space-y-6
```

---

## 🔗 Integración con API

Todas las páginas usan el hook `useF1Data` que:

1. Consume datos de `/api/f1/[endpoint]`
2. Cachea automáticamente en MongoDB
3. Maneja loading/error states
4. Permite refetch manual

```
Frontend (useF1Data)
    ↓
/api/f1/drivers
    ↓
f1Service.fetchF1Data()
    ↓
MongoDB (caché)
    ↓
Response
```

---

## ✅ Checklist de Desarrollo

- [x] Componentes de cards
- [x] Página de pilotos
- [x] Página de equipos
- [x] Página de carreras
- [x] Página de sesiones
- [x] Dashboard principal
- [x] Navbar con navegación
- [x] Componentes comunes
- [x] Funciones de formato
- [x] Hook useF1Data
- [x] Responsive design
- [x] Dark mode

---

## 📚 Próximas Mejoras

- [ ] Página de detalle de piloto
- [ ] Página de detalle de carrera
- [ ] Búsqueda global
- [ ] Filtros avanzados
- [ ] Favoritos
- [ ] Comparador de pilotos
- [ ] Gráficos de estadísticas
- [ ] Notificaciones en vivo
- [ ] PWA (Progressive Web App)

---

## 🤝 Convenciones

### Componentes Client-Side
```tsx
'use client';

export function ComponentName() {
  // useF1Data, useState, etc.
}
```

### Componentes Server-Side
```tsx
// Sin 'use client'

export async function ComponentName() {
  // Server-side logic
}
```

### Archivos de Estilo
- Tailwind CSS inline
- No hay archivos .module.css separados
- Dark mode con `dark:` prefix

---

## 📞 Soporte

Para preguntas sobre:
- **Componentes**: Revisa `app/components/`
- **Hooks**: Revisa `lib/hooks/`
- **API**: Revisa `lib/services/`
- **Estilos**: Revisa configuración de Tailwind en `tailwind.config.ts`
