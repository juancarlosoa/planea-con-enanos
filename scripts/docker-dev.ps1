# Script para gestionar el entorno de desarrollo con Docker

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "logs", "clean")]
    [string]$Action
)

switch ($Action) {
    "start" {
        Write-Host "[INICIO] Iniciando servicios de desarrollo (PostgreSQL + Redis + PgAdmin)..." -ForegroundColor Green
        docker-compose -f docker-compose.dev.yml up -d
        Write-Host "[OK] Servicios iniciados:" -ForegroundColor Green
        Write-Host "   - PostgreSQL: localhost:5432" -ForegroundColor Cyan
        Write-Host "   - Redis: localhost:6379" -ForegroundColor Cyan
        Write-Host "   - PgAdmin: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "     Usuario: admin@escaperoom.com" -ForegroundColor Yellow
        Write-Host "     Contraseña: admin123" -ForegroundColor Yellow
    }
    "stop" {
        Write-Host "[STOP] Deteniendo servicios de desarrollo..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml down
        Write-Host "[OK] Servicios detenidos" -ForegroundColor Green
    }
    "restart" {
        Write-Host "[RESTART] Reiniciando servicios de desarrollo..." -ForegroundColor Yellow
        docker-compose -f docker-compose.dev.yml restart
        Write-Host "[OK] Servicios reiniciados" -ForegroundColor Green
    }
    "logs" {
        Write-Host "[LOGS] Mostrando logs de los servicios..." -ForegroundColor Cyan
        docker-compose -f docker-compose.dev.yml logs -f
    }
    "clean" {
        Write-Host "[CLEAN] Limpiando contenedores y volúmenes..." -ForegroundColor Red
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        Write-Host "[OK] Limpieza completada" -ForegroundColor Green
    }
}