#!/bin/bash

# Detener el script si cualquier comando falla
set -e

echo "🚀 Iniciando despliegue seguro..."

# 1. Construir proyecto (Vite)
echo "📦 Construyendo versión de producción..."
npm run build

# 2. Ofuscar código (Protección)
echo "🔒 Aplicando ofuscación de código..."
npm run obfuscate

# 3. Validar existencia de dist
if [ ! -d "dist" ]; then
  echo "❌ Error: La carpeta dist no se generó."
  exit 1
fi

# 4. Desplegar
echo "☁️  Subiendo a GitHub Pages..."
# CORRECCIÓN: Usamos -t sin argumentos (activa dotfiles automáticamente)
npx gh-pages -d dist -t

echo "✅ ¡Despliegue completado con éxito!"
echo "🌐 URL: https://ilovebiodanza.github.io/mi-gestion-app/"