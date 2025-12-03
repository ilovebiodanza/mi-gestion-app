#!/bin/bash

echo "🚀 Iniciando despliegue en GitHub Pages..."

# Construir proyecto
echo "📦 Construyendo proyecto..."
npm run build

# Ofuscar código
echo "🔒 Ofuscando código..."
npm run obfuscate

# Desplegar usando gh-pages
echo "🚀 Desplegando en GitHub Pages..."
npx gh-pages -d dist -t true

echo "✅ Despliegue completado!"
echo "🌐 URL: https://tu-usuario.github.io/mi-gestion-app/"