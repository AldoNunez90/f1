# 📁 Estructura del Proyecto - F1 News

## Vista Completa

```
f1news/
│
├── 📁 app/                                 [Next.js App Router]
│   ├── 📁 (sections)/                    [Rutas principales]
│   │   ├── 📁 drivers/
│   │   │   └── page.tsx                  ✅ Página de pilotos
│   │   ├── 📁 teams/
│   │   │   └── page.tsx                  ✅ Página de equipos
│   │   ├── 📁 races/
│   │   │   └── page.tsx                  ✅ Página de carreras
│   │   └── 📁 sessions/
│   │       └── page.tsx                  ✅ Página de sesiones
│   │
│   ├── 📁 api/                           [API Routes]
│   │   └── 📁 f1/
│   │       └── 📁 [...path]/
│   │           └── route.ts              ✅ Endpoint dinámico
│   │
│   ├── 📁 components/                    [Componentes React]
│   │   ├── 📁 cards/
│   │   │   ├── DriverCard.tsx            ✅ Card de piloto
│   │   │   ├── TeamCard.tsx              ✅ Card de equipo
│   │   │   ├── RaceCard.tsx              ✅ Card de carrera
│   │   │   └── SessionCard.tsx           ✅ Card de sesión
│   │   │
│   │   ├── 📁 layout/
│   │   │   └── Navbar.tsx                ✅ Navbar principal
│   │   │
│   │   ├── 📁 common/
│   │   │   ├── Loading.tsx               ✅ Componentes de loading
│   │   │   └── Error.tsx                 ✅ Componentes de error
│   │   │
│   │   └── 📁 examples/
│   │       └── page.tsx                  ✅ Ejemplos de uso
│   │
│   ├── globals.css                       ✅ Estilos globales
│   ├── layout.tsx                        ✅ Root layout
│   └── page.tsx                          ✅ Home/Dashboard
│
├── 📁 lib/                               [Lógica de negocio]
│   ├── 📁 db/
│   │   └── connection.ts                 ✅ Conexión MongoDB
│   │
│   ├── 📁 models/
│   │   └── F1Cache.ts                    ✅ Modelo Mongoose
│   │
│   ├── 📁 services/
│   │   └── f1Service.ts                  ✅ Servicio de datos
│   │
│   ├── 📁 cron/
│   │   └── syncF1Data.ts                 ✅ Sync automático
│   │
│   ├── 📁 utils/
│   │   ├── formatters.ts                 ✅ Funciones de formato
│   │   └── racingWeekend.ts              ✅ Detección de fin de semana
│   │
│   ├── 📁 hooks/
│   │   └── useF1Data.ts                  ✅ Hook React
│   │
│   ├── 📁 types/
│   │   └── f1.ts                         ✅ Tipos TypeScript
│   │
│   ├── config.ts                         ✅ Configuración
│   ├── init.ts                           ✅ Inicialización
│   └── README.md                         ✅ Documentación
│
├── 📁 scripts/
│   └── sync-f1-data.js                   ✅ Script manual
│
├── 📁 public/                            [Assets estáticos]
│
├── 📄 Documentación
│   ├── QUICKSTART.md                     ✅ Inicio rápido
│   ├── SETUP.md                          ✅ Instalación
│   ├── API_DOCS.md                       ✅ API Reference
│   ├── FRONTEND_DOCS.md                  ✅ Frontend Guide
│   ├── ARCHITECTURE.md                   ✅ Arquitectura
│   ├── SOLUTION_SUMMARY.md               ✅ Resumen
│   ├── IMPLEMENTATION_CHECKLIST.md       ✅ Checklist
│   ├── IMPLEMENTATION_COMPLETE.txt       ✅ Vista rápida
│   └── USAGE_GUIDE.js                    ✅ Guía de uso
│
├── 📄 Configuración
│   ├── package.json                      ✅ Dependencias
│   ├── tsconfig.json                     ✅ TypeScript
│   ├── next.config.ts                    ✅ Next.js
│   ├── tailwind.config.ts                ✅ Tailwind
│   ├── postcss.config.mjs                ✅ PostCSS
│   ├── eslint.config.mjs                 ✅ ESLint
│   ├── .env.example                      ✅ Variables ejemplo
│   ├── .gitignore                        ✅ Git ignore
│   └── pnpm-workspace.yaml               ✅ pnpm config
│
└── 📁 .next/                             [Build output]


RESUMEN POR CAPAS
═══════════════════════════════════════════════════════════════════════════

🎨 FRONTEND LAYER
├── app/page.tsx                    Dashboard principal
├── app/(sections)/*                Páginas de secciones
└── app/components/                 Componentes reutilizables

🔌 API LAYER
├── app/api/f1/[...path]           Endpoint dinámico
└── Soporta todos los endpoints de Open F1

💾 DATA LAYER
├── lib/services/f1Service         Fetch + Caché
├── lib/db/connection              MongoDB
└── lib/models/F1Cache             Modelo de datos

⚙️ BUSINESS LAYER
├── lib/utils/formatters           Formateo de datos
├── lib/utils/racingWeekend        Lógica de fin de semana
├── lib/hooks/useF1Data            Hook React
└── lib/cron/syncF1Data            Sincronización automática

📦 EXTERNAL
├── Open F1 API (https://api.openf1.org/v1)
└── MongoDB (Atlas o local)


FLUJO DE DATOS
═══════════════════════════════════════════════════════════════════════════

USUARIO
  ↓
FRONTEND (React Component)
  ├─ useF1Data hook
  └─ Renderiza cards
  ↓
API ROUTE (/api/f1/drivers)
  ├─ Validación
  └─ Query params
  ↓
F1 SERVICE (f1Service.ts)
  ├─ Valida endpoint
  └─ Busca en caché
  ↓
MONGODB (Caché)
  ├─ ¿Válido? → Retornar
  └─ ¿Expirado? → Fetch API
  ↓
OPEN F1 API
  └─ Fetch datos
  ↓
MONGODB (Guardar)
  ↓
RESPONSE
  ↓
FRONTEND
  └─ Renderiza con datos


COLORES Y TEMAS
═══════════════════════════════════════════════════════════════════════════

EQUIPOS:
  RED_BULL       from-blue-600 to-blue-800
  FERRARI        from-red-600 to-red-800
  MERCEDES       from-cyan-400 to-cyan-600
  MCLAREN        from-orange-500 to-orange-700
  ASTON_MARTIN   from-green-600 to-green-800
  ALPINE         from-blue-500 to-blue-700
  ALFA_ROMEO     from-red-700 to-red-900
  HAAS           from-gray-600 to-gray-800
  WILLIAMS       from-blue-400 to-blue-600
  KICK_SAUBER    from-red-700 to-red-900

SESIONES:
  Practice       🏁 Gradiente gris
  Qualifying     ⏱️ Gradiente amarillo
  Race           🏎️ Gradiente rojo
  Sprint         ⚡ Gradiente púrpura


CARPETAS CLAVE
═══════════════════════════════════════════════════════════════════════════

app/components/
  └─ Componentes React reutilizables
     ├─ Cards (DriverCard, TeamCard, RaceCard, SessionCard)
     ├─ Layout (Navbar)
     └─ Common (Loading, Error)

app/(sections)/
  └─ Páginas de rutas principales
     ├─ drivers/page.tsx
     ├─ teams/page.tsx
     ├─ races/page.tsx
     └─ sessions/page.tsx

lib/
  └─ Lógica de negocio
     ├─ services/ (f1Service.ts - fetch + caché)
     ├─ db/ (connection.ts - conexión MongoDB)
     ├─ utils/ (formatters.ts, racingWeekend.ts)
     ├─ hooks/ (useF1Data.ts - hook React)
     └─ types/ (f1.ts - interfaces TypeScript)


CÓMO AGREGAR NUEVA SECCIÓN
═══════════════════════════════════════════════════════════════════════════

1. Crear carpeta: app/(sections)/new-section/
2. Crear page.tsx con useF1Data
3. Crear card en app/components/cards/NewCard.tsx
4. Agregar link en Navbar
5. Agregar formatters si es necesario en lib/utils/formatters.ts


TECNOLOGÍAS PRINCIPALES
═══════════════════════════════════════════════════════════════════════════

FRONTEND:
  ✅ Next.js 16.2.9      - React framework
  ✅ React 19.2.4        - UI library
  ✅ TypeScript 5         - Type safety
  ✅ Tailwind CSS 4       - Styling

BACKEND/API:
  ✅ Next.js Routes      - API endpoints
  ✅ Mongoose 8.3.1      - MongoDB ODM
  ✅ Axios 1.7.9         - HTTP client
  ✅ node-cron 3.0.3     - Job scheduler

DATABASE:
  ✅ MongoDB 7+          - NoSQL database
  ✅ Atlas o Local       - Deployment options


DEPENDENCIAS CLAVE
═══════════════════════════════════════════════════════════════════════════

PROD:
  "next": "16.2.9"
  "react": "19.2.4"
  "react-dom": "19.2.4"
  "mongoose": "^8.3.1"
  "axios": "^1.7.9"
  "node-cron": "^3.0.3"

DEV:
  "typescript": "^5"
  "@types/node": "^20"
  "@types/react": "^19"
  "@types/react-dom": "^19"
  "tailwindcss": "^4"
  "@tailwindcss/postcss": "^4"
  "eslint": "^9"
  "eslint-config-next": "16.2.9"


RUTAS DISPONIBLES
═══════════════════════════════════════════════════════════════════════════

GET  /                  → Home/Dashboard
GET  /drivers           → Lista de pilotos
GET  /teams             → Lista de equipos
GET  /races             → Lista de carreras
GET  /sessions          → Lista de sesiones

GET  /api/f1/drivers          → API de pilotos
GET  /api/f1/races?year=2024  → API de carreras con filtro
GET  /api/f1/sessions         → API de sesiones
GET  /api/f1/laps?session_key=123 → API de vueltas


FORMATO DE ARCHIVOS
═══════════════════════════════════════════════════════════════════════════

Componentes:         .tsx (client-side)
Funciones:           .ts  (server-side utilities)
Pages:               .tsx (can be client or server)
Hooks:               .ts  (client-side, con 'use client')
Estilos:             Inline Tailwind (no .css separados)
Configuración:       .ts/.js/.mjs


ESTRUCTURA DE COMMITS
═══════════════════════════════════════════════════════════════════════════

✨ feat: Agregar nueva página/componente
🐛 fix: Corregir bug
🔧 chore: Actualizar dependencias
📝 docs: Actualizar documentación
🎨 style: Cambios de formato/estilos
♻️ refactor: Reorganizar código
⚡ perf: Mejoras de performance
```

---

## 🎯 Próximos Pasos

1. **Personalización**: Agregar logo, colores personalizados
2. **Funcionalidades**: Detalle de piloto, comparador
3. **Gráficos**: Integrar librería de gráficos
4. **SEO**: Mejorar meta tags y Open Graph
5. **PWA**: Hacer la app instalable

---

## 📞 Ayuda Rápida

- **¿Dónde están los componentes?** → `app/components/`
- **¿Dónde están las páginas?** → `app/(sections)/`
- **¿Dónde está la API?** → `app/api/f1/`
- **¿Dónde está la lógica?** → `lib/`
- **¿Dónde están los estilos?** → Inline (Tailwind)
