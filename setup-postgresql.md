# Configuración de PostgreSQL para EscapeRoomPlanner

## Opción 1: Docker (Recomendado)

```bash
# Ejecutar PostgreSQL en Docker
docker run --name postgres-escaperoom \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=EscapeRoomPlannerDb_Dev \
  -p 5432:5432 \
  -d postgres:15

# Verificar que está funcionando
docker ps
```

## Opción 2: Instalación Local

1. Descargar PostgreSQL desde: https://www.postgresql.org/download/
2. Durante la instalación, configurar:
   - Usuario: `postgres`
   - Contraseña: `postgres`
   - Puerto: `5432`

## Opción 3: PostgreSQL en la nube (Desarrollo)

### Supabase (Gratis)
1. Ir a https://supabase.com
2. Crear proyecto gratuito
3. Obtener connection string
4. Actualizar appsettings.json con la nueva connection string

### Railway (Gratis)
1. Ir a https://railway.app
2. Crear proyecto con PostgreSQL
3. Obtener connection string

## Ejecutar Migraciones

Una vez que PostgreSQL esté funcionando:

```bash
# Aplicar migraciones
dotnet ef database update --project src/EscapeRoomPlanner.Infrastructure --startup-project src/EscapeRoomPlanner.Api --context EscapeRoomPlannerDbContext

# O simplemente ejecutar la aplicación (auto-migración configurada)
dotnet run --project src/EscapeRoomPlanner.Api
```

## Ventajas de PostgreSQL en nuestro proyecto

✅ **JSONB nativo** - Schedule se almacena como JSON indexable
✅ **Mejor rendimiento geoespacial** - Para consultas de proximidad
✅ **Gratuito** - Sin costos de licencia
✅ **Escalabilidad** - Mejor para aplicaciones web
✅ **Tipos avanzados** - UUID, interval, timestamp with timezone

## Consultas avanzadas que ahora podemos hacer

```sql
-- Buscar escape rooms por horario (usando JSONB)
SELECT * FROM "EscapeRooms" 
WHERE "Schedule_WeeklySchedule"->>'Monday' IS NOT NULL;

-- Buscar por proximidad geográfica
SELECT *, 
  SQRT(POW("Location_Latitude" - 41.3851, 2) + POW("Location_Longitude" - 2.1734, 2)) as distance
FROM "EscapeRooms" 
ORDER BY distance 
LIMIT 10;
```