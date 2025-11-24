#!/bin/bash
set -e

# Esperar a que PostgreSQL esté listo
until pg_isready -U "$POSTGRES_USER"; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "PostgreSQL is ready, initializing databases..."

# Crear usuario y base de datos del módulo escape_management
# Crear usuario si no existe
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  DO
  \$do\$
  BEGIN
     IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER'
     ) THEN
        CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASSWORD';
     END IF;
  END
  \$do\$;
EOSQL

# Crear base de datos si no existe
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  SELECT 'CREATE DATABASE $ESCAPE_MANAGEMENT_DB'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$ESCAPE_MANAGEMENT_DB')\\gexec
EOSQL

# Asignar permisos
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  ALTER DATABASE $ESCAPE_MANAGEMENT_DB OWNER TO $DB_USER;
  GRANT ALL PRIVILEGES ON DATABASE $ESCAPE_MANAGEMENT_DB TO $DB_USER;
EOSQL

echo "Databases and users initialized."