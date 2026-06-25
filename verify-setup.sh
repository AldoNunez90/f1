#!/bin/bash

# Script de verificación de instalación
# Uso: bash verify-setup.sh

set -e

echo "🔍 Verificando instalación de F1 News API..."
echo ""

# Verificar Node.js
echo "📦 Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js instalado: $NODE_VERSION"
else
    echo "❌ Node.js no encontrado. Descárgalo de https://nodejs.org"
    exit 1
fi

# Verificar pnpm
echo ""
echo "📦 Verificando pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo "✅ pnpm instalado: $PNPM_VERSION"
else
    echo "⚠️ pnpm no encontrado. Instalando..."
    npm install -g pnpm
fi

# Verificar node_modules
echo ""
echo "📦 Verificando dependencias instaladas..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules encontrado"
else
    echo "❌ node_modules no encontrado"
    echo "   Ejecuta: pnpm install"
    exit 1
fi

# Verificar archivos clave
echo ""
echo "📁 Verificando archivos clave..."
FILES=(
    "lib/db/connection.ts"
    "lib/models/F1Cache.ts"
    "lib/services/f1Service.ts"
    "lib/cron/syncF1Data.ts"
    "app/api/f1/[...path]/route.ts"
    "lib/hooks/useF1Data.ts"
    ".env.example"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file no encontrado"
        exit 1
    fi
done

# Verificar .env.local
echo ""
echo "⚙️ Verificando variables de entorno..."
if [ -f ".env.local" ]; then
    if grep -q "MONGODB_URI" ".env.local"; then
        echo "✅ .env.local encontrado con MONGODB_URI"
    else
        echo "⚠️ .env.local encontrado pero sin MONGODB_URI"
    fi
else
    echo "⚠️ .env.local no encontrado"
    echo "   Ejecuta: cp .env.example .env.local"
    echo "   y edita con tu MONGODB_URI"
fi

echo ""
echo "✅ Verificación completada!"
echo ""
echo "Próximos pasos:"
echo "1. Asegúrate de tener MONGODB_URI en .env.local"
echo "2. Ejecuta: pnpm dev"
echo "3. Prueba: curl http://localhost:3000/api/f1/drivers"
