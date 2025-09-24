-- Initialization script for PostgreSQL
-- This script runs when the container starts for the first time

-- Create extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- PostGIS extension commented out as it's not available in alpine image
-- CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA public;

-- Set timezone
SET timezone = 'UTC';

-- Create any additional schemas if needed
-- CREATE SCHEMA IF NOT EXISTS escape_room_schema;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE "EscapeRoomPlannerDb_Dev" TO postgres;