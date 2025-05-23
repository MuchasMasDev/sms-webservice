#!/bin/bash

# Script de deployment para aplicación NestJS con PM2
# Uso: ./deploy.sh [nombre-de-la-app]

set -e  # Salir si algún comando falla

# Configuración
APP_NAME=${1:-"nestjs-app"}  # Nombre de la app (primer parámetro o default)
APP_DIR=$(pwd)              # Directorio actual
ECOSYSTEM_FILE="ecosystem.config.js"
BUILD_DIR="dist"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    error "PM2 no está instalado. Instálalo con: npm install -g pm2"
    exit 1
fi

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    error "Node.js no está instalado"
    exit 1
fi

log "Iniciando deployment de $APP_NAME..."

# Crear archivo ecosystem.config.js si no existe
if [ ! -f "$ECOSYSTEM_FILE" ]; then
    warning "Archivo ecosystem.config.js no encontrado. Creando uno por defecto..."
    cat > $ECOSYSTEM_FILE << 'EOF'
module.exports = {
  apps: [{
    name: 'nestjs-app',
    script: './dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Configuración para zero-downtime deployment
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    // Configuración de logs
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Configuración de reinicio
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
    success "Archivo ecosystem.config.js creado"
fi

# Crear directorio de logs si no existe
mkdir -p logs

# Instalar dependencias
log "Instalando dependencias..."
if [ -f "package-lock.json" ]; then
    npm ci --only=production
elif [ -f "yarn.lock" ]; then
    yarn install --frozen-lockfile --production
else
    npm install --only=production
fi

# Construir la aplicación
log "Construyendo la aplicación..."
if [ -f "package-lock.json" ]; then
    npm run build
elif [ -f "yarn.lock" ]; then
    yarn build
else
    npm run build
fi

# Verificar que el build se creó correctamente
if [ ! -d "$BUILD_DIR" ] || [ ! -f "$BUILD_DIR/main.js" ]; then
    error "El build falló. No se encontró $BUILD_DIR/main.js"
    exit 1
fi

success "Build completado exitosamente"

# Verificar si la aplicación ya está corriendo en PM2
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
    log "La aplicación $APP_NAME ya está corriendo. Realizando reload..."
    
    # Hacer reload (zero-downtime deployment)
    pm2 reload "$APP_NAME" --update-env
    
    # Verificar que el reload fue exitoso
    if [ $? -eq 0 ]; then
        success "Reload completado exitosamente"
    else
        error "Error durante el reload"
        exit 1
    fi
else
    log "La aplicación $APP_NAME no está corriendo. Iniciando por primera vez..."
    
    # Iniciar la aplicación por primera vez
    pm2 start $ECOSYSTEM_FILE --env production
    
    if [ $? -eq 0 ]; then
        success "Aplicación iniciada exitosamente"
    else
        error "Error al iniciar la aplicación"
        exit 1
    fi
fi

# Guardar la configuración de PM2
pm2 save

# Mostrar el estado de la aplicación
log "Estado actual de la aplicación:"
pm2 show "$APP_NAME"

# Mostrar logs recientes
log "Últimas líneas del log:"
pm2 logs "$APP_NAME" --lines 10 --nostream

success "Deployment completado exitosamente!"

# Información adicional
echo ""
echo "Comandos útiles:"
echo "  pm2 logs $APP_NAME          # Ver logs en tiempo real"
echo "  pm2 monit                   # Monitor interactivo"
echo "  pm2 restart $APP_NAME       # Reiniciar la aplicación"
echo "  pm2 stop $APP_NAME          # Detener la aplicación"
echo "  pm2 delete $APP_NAME        # Eliminar la aplicación de PM2"