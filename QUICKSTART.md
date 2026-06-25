# 🏁 Quick Start - F1 News API

## 5 Minutos para Empezar

### 1️⃣ Instalar (30 segundos)

```bash
pnpm install
```

### 2️⃣ Configurar MongoDB (2 minutos)

**Opción A - Recomendado (MongoDB Atlas):**

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear cluster M0 (gratuito)
3. Crear usuario en "Database Access"
4. Permitir acceso desde "Network Access"
5. Copiar connection string
6. Crear `.env.local`:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/f1news
```

**Opción B - Local:**

```bash
# Instalar MongoDB Community
# Mac: brew tap mongodb/brew && brew install mongodb-community
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# Linux: https://docs.mongodb.com/manual/installation/

# Iniciar
mongod

# En .env.local:
MONGODB_URI=mongodb://localhost:27017/f1news
```

### 3️⃣ Iniciar (10 segundos)

```bash
pnpm dev
```

### 4️⃣ Probar (1 minuto)

```bash
# En otra terminal:

# Obtener pilotos
curl http://localhost:3000/api/f1/drivers

# Obtener carreras de 2024
curl http://localhost:3000/api/f1/races?year=2024

# Obtener vueltas de una sesión
curl http://localhost:3000/api/f1/laps?session_key=9158
```

### ✅ ¡Listo!

Ya tienes:
- ✅ API funcionando
- ✅ Caché automático
- ✅ Sincronización cada 5 minutos (fin de semana) o 6 horas (entre semana)
- ✅ Almacenamiento en MongoDB

## 📖 Usar en React

```tsx
'use client';

import { useF1Data } from '@/lib/hooks/useF1Data';

export function Drivers() {
  const { data, loading } = useF1Data({ endpoint: 'drivers' });
  
  if (loading) return <p>Cargando...</p>;
  
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
```

## 🔗 Endpoints Principales

| Endpoint | Query |
|----------|-------|
| Pilotos | `/api/f1/drivers` |
| Carreras | `/api/f1/races?year=2024` |
| Sesiones | `/api/f1/sessions?year=2024` |
| Vueltas | `/api/f1/laps?session_key=123` |
| Clima | `/api/f1/weather?session_key=123` |
| Pit Stops | `/api/f1/pit_stops?session_key=123` |

## ⚙️ Cómo Funciona

```
Client Request
      ↓
/api/f1/[endpoint]
      ↓
¿Cache válido? 
   Sí → Retornar al instante
    No → Fetch Open F1 API
      ↓
Guardar en MongoDB
      ↓
Retornar respuesta
```

**Cache Duration:**
- Fin de semana de carrera: 5 minutos
- Días normales: 6 horas

## 🚨 Problemas Comunes

| Problema | Solución |
|----------|----------|
| `MONGODB_URI not defined` | Crea `.env.local` con MongoDB URI |
| `connection refused` | Verifica que MongoDB está corriendo |
| Los datos no se actualizan | Espera a que se cumpla el TTL o sincroniza con `pnpm sync-f1-data` |

## 📚 Documentación Completa

- [SETUP.md](./SETUP.md) - Guía detallada
- [API_DOCS.md](./API_DOCS.md) - Referencia de API
- [SOLUTION_SUMMARY.md](./SOLUTION_SUMMARY.md) - Arquitectura

## 🎯 Qué Hace Este Sistema

1. **Fetch automático** a Open F1 cada 5 minutos (fin de semana) o 6 horas (entre semana)
2. **Almacena en MongoDB** para acceso rápido
3. **Cache inteligente** que sirve datos al instante
4. **Fallback automático** si falla la API
5. **Type-safe** con TypeScript completo

¡Todo automático, sin mantenimiento manual! 🚀
