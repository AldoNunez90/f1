# Guía de Instalación y Configuración

## Requisitos Previos

- Node.js 18+
- pnpm (o npm)
- MongoDB (Atlas o local)

## Pasos de Instalación

### 1. Clonar e Instalar Dependencias

```bash
# Instalar pnpm si no lo tienes
npm install -g pnpm

# Instalar dependencias
pnpm install
```

### 2. Configurar MongoDB

#### Opción A: MongoDB Atlas (Recomendado)

1. Ir a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear una cuenta gratuita
3. Crear un cluster gratuito
4. Ir a "Database Access" y crear un usuario
5. Ir a "Network Access" y permitir acceso desde `0.0.0.0/0` (o tu IP)
6. Ir a "Databases" → "Connect" → "Drivers"
7. Copiar la connection string

#### Opción B: MongoDB Local

```bash
# Instalar MongoDB en tu sistema
# En Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
# En Mac: brew tap mongodb/brew && brew install mongodb-community
# En Linux: sigue la documentación oficial

# Iniciar MongoDB
mongod
```

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local
```

Editar `.env.local` y reemplazar:

```env
# Para MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/f1news?retryWrites=true&w=majority

# Para MongoDB Local:
MONGODB_URI=mongodb://localhost:27017/f1news
```

Reemplaza:
- `username`: Tu usuario de MongoDB
- `password`: Tu contraseña
- `cluster`: Tu cluster de MongoDB Atlas
- `f1news`: Nombre de la base de datos

### 4. Iniciar el Servidor de Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Verificar la Instalación

### 1. Probar Endpoints

```bash
# Obtener pilotos
curl http://localhost:3000/api/f1/drivers

# Obtener carreras
curl http://localhost:3000/api/f1/races?year=2024

# Obtener sesiones
curl http://localhost:3000/api/f1/sessions?year=2024
```

### 2. Verificar MongoDB

Abre MongoDB Compass o Atlas UI y verifica que:
- La base de datos `f1news` se haya creado
- La colección `f1caches` contenga documentos

### 3. Ver Logs de Sincronización

Revisa la consola de Next.js para ver:
```
✅ F1 cron jobs initialized
✓ Synced: drivers
✓ Synced: races
...
```

## Configuración de Producción

### Deployment en Vercel

1. Push tu código a GitHub
2. Conecta tu repositorio a [Vercel](https://vercel.com)
3. Agrega las variables de entorno en Settings → Environment Variables
4. Deploy

### Deployment Manual

```bash
# Build
pnpm build

# Start
pnpm start
```

## Troubleshooting

### Error: "Please define the MONGODB_URI environment variable"

**Solución**: Verifica que `.env.local` existe y tiene `MONGODB_URI` configurada.

### Error: "connect ECONNREFUSED"

**Solución**: 
- Si usas MongoDB local: Asegúrate que `mongod` está corriendo
- Si usas Atlas: Verifica que tu IP está en Network Access
- Verifica que la connection string es correcta

### Datos no se actualizan

**Solución**:
- Verifica que es fin de semana de carrera (viernes-lunes, marzo-noviembre)
- Revisa los logs en la consola de Next.js
- Intenta hacer un request manual: `curl http://localhost:3000/api/f1/drivers`

### Caché no funciona

**Solución**:
- Verifica MongoDB está corriendo
- Intenta resetear: Elimina todos los documentos de `f1caches` en MongoDB
- Reinicia el servidor Next.js

## Siguientes Pasos

1. Ver [API_DOCS.md](./API_DOCS.md) para documentación completa de la API
2. Ver [app/examples/page.tsx](./app/examples/page.tsx) para ejemplos de uso
3. Ver [lib/hooks/useF1Data.ts](./lib/hooks/useF1Data.ts) para el hook de React

## Recursos Adicionales

- [Open F1 API Docs](https://openf1.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [node-cron Documentation](https://www.npmjs.com/package/node-cron)
