# Configuración de PostgreSQL para EscapeRoomPlanner

## ¿Por qué PostgreSQL?

Se eligió PostgreSQL sobre SQL Server por las siguientes ventajas específicas para nuestro dominio:

### Ventajas Técnicas

1. **JSONB Nativo**: Los horarios complejos se almacenan como JSONB indexable
2. **Capacidades Geoespaciales**: Mejor soporte para consultas de proximidad
3. **Tipos Avanzados**: UUID, INTERVAL, TIMESTAMP WITH TIME ZONE
4. **Rendimiento**: Mejor concurrencia con MVCC
5. **Costo**: Completamente gratuito y open source

## Opciones de Instalación

### Opción 1: Docker (Recomendado para Desarrollo)

```bash
# Crear y ejecutar contenedor PostgreSQL
docker run --name postgres-escaperoom \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=EscapeRoomPlannerDb_Dev \
  -p 5432:5432 \
  -d postgres:15

# Verificar que está funcionando
docker ps

# Conectar para verificar
docker exec -it postgres-escaperoom psql -U postgres -d EscapeRoomPlannerDb_Dev
```

### Opción 2: Instalación Local

#### Windows
1. Descargar desde: https://www.postgresql.org/download/windows/
2. Ejecutar instalador
3. Configurar:
   - Usuario: `postgres`
   - Contraseña: `postgres`
   - Puerto: `5432`

#### macOS
```bash
# Con Homebrew
brew install postgresql@15
brew services start postgresql@15

# Crear base de datos
createdb EscapeRoomPlannerDb_Dev
```

#### Linux (Ubuntu/Debian)
```bash
# Instalar PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Configurar usuario
sudo -u postgres psql
ALTER USER postgres PASSWORD 'postgres';
CREATE DATABASE "EscapeRoomPlannerDb_Dev";
\q
```

### Opción 3: Servicios en la Nube

#### Supabase (Gratis)
1. Ir a https://supabase.com
2. Crear proyecto gratuito
3. Obtener connection string desde Settings > Database
4. Actualizar `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db.xxx.supabase.co;Database=postgres;Username=postgres;Password=your-password"
  }
}
```

#### Railway (Gratis)
1. Ir a https://railway.app
2. Crear proyecto con PostgreSQL
3. Obtener connection string
4. Actualizar configuración

## Configuración de la Aplicación

### Connection String

La aplicación usa esta connection string por defecto:
```
Host=localhost;Database=EscapeRoomPlannerDb_Dev;Username=postgres;Password=postgres
```

### Migraciones

```bash
# Aplicar migraciones
dotnet ef database update --project src/EscapeRoomPlanner.Infrastructure --startup-project src/EscapeRoomPlanner.Api

# Crear nueva migración (si es necesario)
dotnet ef migrations add NombreMigracion --project src/EscapeRoomPlanner.Infrastructure --startup-project src/EscapeRoomPlanner.Api
```

### Seeding de Datos

La aplicación incluye un seeder que se ejecuta automáticamente al iniciar:
- 8 escape rooms de ejemplo en Barcelona
- Horarios realistas
- Coordenadas GPS reales
- Información de Google Places (simulada)

## Características Específicas de PostgreSQL

### JSONB para Horarios

Los horarios se almacenan como JSONB, permitiendo consultas eficientes:

```sql
-- Buscar escape rooms abiertos los sábados
SELECT * FROM "EscapeRooms" 
WHERE "Schedule_WeeklySchedule" ? 'Saturday';

-- Buscar horarios especiales en Navidad
SELECT * FROM "EscapeRooms" 
WHERE "Schedule_SpecialDates" @> '[{"Date": "2024-12-25"}]';
```

### Consultas Geoespaciales

```sql
-- Escape rooms cerca de las Ramblas (Barcelona)
SELECT *, 
  SQRT(POW("Location_Latitude" - 41.3851, 2) + POW("Location_Longitude" - 2.1734, 2)) as distance
FROM "EscapeRooms" 
WHERE "IsActive" = true
ORDER BY distance 
LIMIT 10;
```

### Tipos de Datos Optimizados

- **UUID**: Para IDs únicos distribuidos
- **INTERVAL**: Para duraciones (mejor que TIME)
- **TIMESTAMP WITH TIME ZONE**: Manejo correcto de zonas horarias
- **JSONB**: JSON binario indexable

## Monitoreo y Mantenimiento

### Verificar Estado

```sql
-- Verificar conexiones activas
SELECT count(*) FROM pg_stat_activity;

-- Verificar tamaño de base de datos
SELECT pg_size_pretty(pg_database_size('EscapeRoomPlannerDb_Dev'));

-- Verificar índices más utilizados
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes 
ORDER BY idx_tup_read DESC;
```

### Backup y Restore

```bash
# Backup
pg_dump -U postgres -h localhost EscapeRoomPlannerDb_Dev > backup.sql

# Restore
psql -U postgres -h localhost -d EscapeRoomPlannerDb_Dev < backup.sql
```

## Troubleshooting

### Problemas Comunes

1. **Error de conexión**: Verificar que PostgreSQL esté ejecutándose
2. **Autenticación fallida**: Verificar usuario/contraseña
3. **Base de datos no existe**: Crearla manualmente o verificar nombre

### Logs Útiles

```bash
# Ver logs de PostgreSQL (Docker)
docker logs postgres-escaperoom

# Ver logs de la aplicación
dotnet run --project src/EscapeRoomPlanner.Api --verbosity detailed
```

## Performance Tips

1. **Índices JSONB**: Ya configurados para Schedule
2. **Índices Geoespaciales**: Para consultas de proximidad
3. **Connection Pooling**: Configurado automáticamente por Npgsql
4. **Prepared Statements**: EF Core los usa automáticamente

## Migración desde SQL Server

Si tienes datos en SQL Server y quieres migrar:

1. Exportar datos desde SQL Server
2. Adaptar tipos de datos (UNIQUEIDENTIFIER → UUID, etc.)
3. Importar a PostgreSQL
4. Verificar integridad de datos

La aplicación está diseñada para funcionar exclusivamente con PostgreSQL y aprovecha sus características específicas.