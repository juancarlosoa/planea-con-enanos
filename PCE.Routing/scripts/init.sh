set -e

OSM_URL="https://download.geofabrik.de/europe/spain-latest.osm.pbf"
OSM_PBF="/var/lib/postgresql/12/import/spain-latest.osm.pbf"

# 1. Descargar OSM si no existe
if [ ! -f "$OSM_PBF" ]; then
    echo "Descargando extracto OSM España..."
    wget -O "$OSM_PBF" "$OSM_URL"
fi

# 2. Inicializar Nominatim
if [ ! -f "/var/lib/postgresql/12/main/PG_VERSION" ]; then
    echo "Importando datos en Nominatim (puede tardar varias horas)..."
    /app/utils/setup.php --osm-file "$OSM_PBF" --all --osm2pgsql-cache 2048
fi

# 3. Preparar OSRM
OSRM_FILE="/data/spain-latest.osrm"
if [ ! -f "$OSRM_FILE" ]; then
    echo "Preparando OSRM..."
    osrm-extract -p /opt/car.lua "$OSM_PBF"
    osrm-partition spain-latest.osrm
    osrm-customize spain-latest.osrm
fi

# 4. Mensaje final
echo "Inicialización completa. Nominatim y OSRM listos."