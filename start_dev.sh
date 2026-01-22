#!/bin/bash
# Script para iniciar el servidor de desarrollo usando Node v20 explícitamente
echo "Iniciando con Node v20..."
export PATH=/home/dvillablanca/.nvm/versions/node/v20.19.6/bin:$PATH
npm run dev
