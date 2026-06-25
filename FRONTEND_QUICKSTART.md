# 🎨 Frontend - Getting Started

## ⚡ 5 Minutos para Empezar

### ✅ Prerequisitos
- `pnpm dev` corriendo (backend y MongoDB)
- `MONGODB_URI` configurada en `.env.local`

### 🚀 Iniciar

```bash
# En otra terminal (mantén pnpm dev corriendo):
pnpm dev
```

Abre: **http://localhost:3000** 🎉

---

## 📱 Secciones del Frontend

| Ruta | Descripción | Componente |
|------|-------------|-----------|
| `/` | Home con Dashboard | `app/page.tsx` |
| `/drivers` | Lista de Pilotos | `DriverCard` |
| `/teams` | Lista de Equipos | `TeamCard` |
| `/races` | Lista de Carreras | `RaceCard` |
| `/sessions` | Lista de Sesiones | `SessionCard` |

---

## 🎨 Componentes Principales

### DriverCard
```tsx
<DriverCard
  driver_number={1}
  first_name="Max"
  last_name="Verstappen"
  team="RED_BULL"
  country_code="NL"
  headshot_url="..."
/>
```

**Muestra:**
- Número del piloto
- Nombre completo
- Bandera del país
- Equipo con color personalizado

### TeamCard
```tsx
<TeamCard
  name="RED_BULL"
  drivers={[...]}
  points={500}
/>
```

**Muestra:**
- Nombre del equipo
- Lista de pilotos
- Puntos del campeonato

### RaceCard
```tsx
<RaceCard
  year={2024}
  round={5}
  location="Monaco"
  circuit_name="Circuit de Monaco"
  date="2024-05-26"
/>
```

**Muestra:**
- Año y ronda
- Circuito
- Fecha
- País

### SessionCard
```tsx
<SessionCard
  session_type="Race"
  circuit_name="Monza"
  date_start="2024-09-01"
  date_end="2024-09-01"
  is_open={false}
  year={2024}
  round={16}
/>
```

**Muestra:**
- Tipo de sesión (con emoji)
- Circuito
- Fechas
- Status (En vivo / Completada)

---

## 🪝 Hook - useF1Data

### Básico

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
      {Array.isArray(data) && data.map(item => (
        <div key={item.id}>{/* renderizar */}</div>
      ))}
    </div>
  );
}
```

### Con Filtros

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

## 🛠️ Funciones Utiles

### Formatters

```tsx
import {
  formatDate,
  formatDateTime,
  formatSessionType,
  getCountryFlag,
  formatTeamName,
} from '@/lib/utils/formatters';

// Uso
<p>{formatDate('2024-03-15')}</p>  // "15 mar 2024"
<span>{getCountryFlag('ES')}</span>  // "🇪🇸"
<p>{formatSessionType('Race')}</p>  // "🏎️ Carrera"
<p>{formatTeamName('RED_BULL')}</p>  // "Red Bull"
```

---

## 📂 Agregar Nueva Sección

### 1. Crear Page

```bash
mkdir -p app/(sections)/new-section
touch app/(sections)/new-section/page.tsx
```

### 2. Crear Componente

```tsx
// app/(sections)/new-section/page.tsx
'use client';

import { useF1Data } from '@/lib/hooks/useF1Data';

export default function NewSectionPage() {
  const { data, loading, error } = useF1Data({
    endpoint: 'new_endpoint',
  });

  if (loading) return <LoadingGrid />;
  if (error) return <ErrorMessage />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* renderizar cards */}
    </div>
  );
}
```

### 3. Agregar Link en Navbar

```tsx
// app/components/layout/Navbar.tsx
const links = [
  { href: '/new-section', label: '🆕 Nueva Sección' },
];
```

---

## 🎨 Personalizaciones

### Cambiar Colores

Edita `lib/utils/formatters.ts`:

```typescript
const teamColors: Record<string, string> = {
  'RED_BULL': 'from-blue-600 to-blue-800',
  // Agregar más colores...
};
```

### Cambiar Emojis

```tsx
const sessionEmoji = {
  'Practice': '🏁',
  'Qualifying': '⏱️',
  'Race': '🏎️',
  // Personalizar...
};
```

---

## 🔧 Troubleshooting

| Problema | Solución |
|----------|----------|
| Las cards no cargan | Revisa que MongoDB está corriendo |
| Error "Cannot find module" | Ejecuta `pnpm install` |
| Datos no se actualizan | Haz click en "Actualizar" o espera TTL |
| Estilos no se ven | Reinicia servidor: `Ctrl+C` y `pnpm dev` |

---

## 📚 Documentación

- [FRONTEND_DOCS.md](./FRONTEND_DOCS.md) - Guía completa
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Estructura detallada
- [FRONTEND_COMPLETE.txt](./FRONTEND_COMPLETE.txt) - Resumen visual

---

## ✨ Tips y Tricks

### Loading State Personalizado

```tsx
import { LoadingSpinner, LoadingGrid } from '@/app/components/common/Loading';

// Para un elemento
<LoadingSpinner />

// Para grid
<LoadingGrid />
```

### Error Handling Completo

```tsx
import { ErrorMessage, EmptyState } from '@/app/components/common/Error';

// Error con retry
<ErrorMessage message="Fallo al cargar" onRetry={refetch} />

// Estado vacío
<EmptyState title="Sin datos" icon="📭" />
```

### Responsive Grid

```tsx
// 1 col mobile, 2 tablet, 3-4 desktop
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
```

---

## 🚀 Deploy

### Vercel

```bash
# 1. Push a GitHub
# 2. Conecta Vercel
# 3. Agrega MONGODB_URI en Environment Variables
# 4. Deploy automático 🎉
```

### Otros

```bash
# Build
pnpm build

# Start
pnpm start
```

---

## 🎯 Next Steps

1. ✅ Páginas creadas
2. ✅ Componentes creados
3. 🔜 Personalizar colores/emojis
4. 🔜 Agregar más filtros
5. 🔜 Agregar detalle de piloto
6. 🔜 Agregar gráficos

---

**¡Listo para usar!** 🚀 Ejecuta `pnpm dev` y navega a http://localhost:3000
