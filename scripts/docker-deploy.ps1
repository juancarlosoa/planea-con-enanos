# Script para desplegar la aplicación completa con Docker

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("build", "up", "down", "restart", "logs", "clean")]
    [string]$Action,
    
    [switch]$WithAdmin
)

$composeFiles = @("-f", "docker-compose.yml")
if ($WithAdmin) {
    $composeFiles += @("--profile", "admin")
}

switch ($Action) {
    "build" {
        Write-Host "[BUILD] Construyendo imágenes Docker..." -ForegroundColor Green
        docker-compose @composeFiles build --no-cache
        Write-Host "[OK] Imágenes construidas" -ForegroundColor Green
    }
    "up" {
        Write-Host "[DEPLOY] Desplegando aplicación completa..." -ForegroundColor Green
        docker-compose @composeFiles up -d
        Write-Host "[OK] Aplicación desplegada:" -ForegroundColor Green
        Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor Cyan
        Write-Host "   - API: http://localhost:7001" -ForegroundColor Cyan
        Write-Host "   - PostgreSQL: localhost:5432" -ForegroundColor Cyan
        Write-Host "   - Redis: localhost:6379" -ForegroundColor Cyan
        if ($WithAdmin) {
            Write-Host "   - PgAdmin: http://localhost:8080" -ForegroundColor Cyan
        }
    }
    "down" {
        Write-Host "[STOP] Deteniendo aplicación..." -ForegroundColor Yellow
        docker-compose @composeFiles down
        Write-Host "[OK] Aplicación detenida" -ForegroundColor Green
    }
    "restart" {
        Write-Host "[RESTART] Reiniciando aplicación..." -ForegroundColor Yellow
        docker-compose @composeFiles restart
        Write-Host "[OK] Aplicación reiniciada" -ForegroundColor Green
    }
    "logs" {
        Write-Host "[LOGS] Mostrando logs de la aplicación..." -ForegroundColor Cyan
        docker-compose @composeFiles logs -f
    }
    "clean" {
        Write-Host "[CLEAN] Limpiando todo el entorno..." -ForegroundColor Red
        docker-compose @composeFiles down -v --rmi all
        docker system prune -f
        Write-Host "[OK] Limpieza completada" -ForegroundColor Green
    }
}