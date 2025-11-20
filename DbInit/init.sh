#!/bin/bash
set -e

# Esperar a que PostgreSQL esté listo
until pg_isready -h "localhost" -U "$POSTGRES_USER"; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "PostgreSQL is ready, initializing databases..."

# Crear usuario y base de datos del módulo escape_management
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE IF NOT EXISTS $ESCAPE_MANAGEMENT_DB;
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

  GRANT ALL PRIVILEGES ON DATABASE $ESCAPE_MANAGEMENT_DB TO $DB_USER;
EOSQL

echo "Databases and users initialized."