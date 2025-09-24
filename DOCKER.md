# Docker Configuration for Escape Room Planner

Este proyecto está configurado para ejecutarse completamente en Docker con PostgreSQL, Redis y la aplicación.

## 🚀 Inicio Rápido

### Opción 1: Solo Base de Datos (Desarrollo Local)

Para desarrollar localmente pero usar PostgreSQL y Redis en Docker:

```powershell
# Iniciar solo PostgreSQL, Redis y PgAdmin
.\scripts\docker-dev.ps1 start

# Detener servicios
.\scripts\docker-dev.ps1 stop

# Ver logs
.\scripts\docker-dev.ps1 logs

# Limpiar todo
.\scripts\docker-dev.ps1 clean
```

Luego ejecuta la API localmente:
```bash
dotnet run --project src/EscapeRoomPlanner.Api
```

### Opción 2: Aplicación Completa en Docker

Para ejecutar todo en Docker:

```powershell
# Construir imágenes
.\scripts\docker-deploy.ps1 build

# Desplegar aplicación completa
.\scripts\docker-deploy.ps1 up

# Con PgAdmin incluido
.\scripts\docker-deploy.ps1 up -WithAdmin

# Detener aplicación
.\scripts\docker-deploy.ps1 down
```

## 🔧 Servicios Disponibles

| Servicio | Puerto | URL | Credenciales |
|----------|--------|-----|--------------|
| Frontend | 5173 | http://localhost:5173 | - |
| API | 7001 | http://localhost:7001 | - |
| PostgreSQL | 5432 | localhost:5432 | postgres/EscapeRoom123! |
| Redis | 6379 | localhost:6379 | - |
| PgAdmin | 8080 | http://localhost:8080 | admin@escaperoom.com/admin123 |

## 🗄️ Configuración de Base de Datos

### Variables de Entorno

La aplicación soporta múltiples proveedores de base de datos:

- `DatabaseProvider=PostgreSQL` (producción y desarrollo con Docker)
- `DatabaseProvider=InMemory` (desarrollo local y testing)

### Cadenas de Conexión

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=postgres;Database=EscapeRoomPlannerDb;Username=postgres;Password=EscapeRoom123!",
    "Redis": "redis:6379"
  }
}
```

## 🐳 Arquitectura Docker

```
┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │       API       │
│   (React/Vite)  │◄──►│   (.NET 8)      │
│   Port: 5173    │    │   Port: 7001    │
└─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   Port: 5432    │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │   Port: 6379    │
                       └─────────────────┘
```

## 📝 Comandos Útiles

### Docker Compose Manual

```bash
# Solo servicios de desarrollo
docker-compose -f docker-compose.dev.yml up -d

# Aplicación completa
docker-compose up -d

# Con PgAdmin
docker-compose --profile admin up -d

# Ver logs de un servicio específico
docker-compose logs -f api
docker-compose logs -f postgres

# Ejecutar migraciones manualmente
docker-compose exec api dotnet ef database update
```

### Gestión de Datos

```bash
# Backup de la base de datos
docker-compose exec postgres pg_dump -U postgres EscapeRoomPlannerDb > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres EscapeRoomPlannerDb < backup.sql

# Conectar a PostgreSQL
docker-compose exec postgres psql -U postgres -d EscapeRoomPlannerDb
```

## 🔍 Troubleshooting

### Problemas Comunes

1. **Puerto ya en uso**
   ```bash
   # Verificar qué está usando el puerto
   netstat -ano | findstr :5432
   
   # Cambiar puerto en docker-compose.yml
   ports:
     - "5433:5432"  # Usar puerto diferente
   ```

2. **Problemas de conexión a la base de datos**
   ```bash
   # Verificar que PostgreSQL esté corriendo
   docker-compose ps
   
   # Ver logs de PostgreSQL
   docker-compose logs postgres
   
   # Verificar conectividad
   docker-compose exec api ping postgres
   ```

3. **Limpiar todo y empezar de nuevo**
   ```bash
   .\scripts\docker-deploy.ps1 clean
   ```

## 🌍 Variables de Entorno

### Desarrollo Local
```env
ASPNETCORE_ENVIRONMENT=Development
DatabaseProvider=InMemory
```

### Docker
```env
ASPNETCORE_ENVIRONMENT=Docker
DatabaseProvider=PostgreSQL
ConnectionStrings__DefaultConnection=Host=postgres;Database=EscapeRoomPlannerDb;Username=postgres;Password=EscapeRoom123!
```

### Producción
```env
ASPNETCORE_ENVIRONMENT=Production
DatabaseProvider=PostgreSQL
ConnectionStrings__DefaultConnection=Host=your-postgres-host;Database=EscapeRoomPlannerDb;Username=your-user;Password=your-secure-password
```