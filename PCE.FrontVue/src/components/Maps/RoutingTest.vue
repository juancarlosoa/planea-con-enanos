<script setup lang="ts">
import { ref, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LeafletMap from './LeafletMap.vue';
import { routingService } from '../../services/routingService';
import type { MockEscapeRoom, RouteResponse } from '../../types/models';

const mapComponent = ref<InstanceType<typeof LeafletMap> | null>(null);
let map: L.Map | null = null;
let routeLayer: L.Polyline | null = null;
let originMarker: L.Marker | null = null;
let destinationMarker: L.Marker | null = null;

const rooms = ref<MockEscapeRoom[]>([]);
const selectedOrigin = ref<string>('');
const selectedDestination = ref<string>('');
const transportMode = ref<'car' | 'foot'>('foot');
const routeInfo = ref<RouteResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Custom marker icons
const originIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
});

const destinationIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
});

const onMapReady = (mapInstance: L.Map) => {
  console.log('Map ready:', mapInstance);
  map = mapInstance;
  rooms.value = routingService.getMockRooms();
  
  // Force resize to ensure map renders correctly
  setTimeout(() => {
    map?.invalidateSize();
  }, 200);
};

const updateMarkers = () => {
  if (!map) {
    console.error('Map is not initialized in updateMarkers');
    return;
  }

  // Remove existing markers
  if (originMarker) {
    originMarker.remove();
    originMarker = null;
  }
  if (destinationMarker) {
    destinationMarker.remove();
    destinationMarker = null;
  }

  // Add origin marker
  if (selectedOrigin.value) {
    const origin = rooms.value.find(r => r.id === selectedOrigin.value);
    if (origin) {
      originMarker = L.marker([origin.latitude, origin.longitude], { icon: originIcon })
        .addTo(map)
        .bindPopup(`<b>Origen:</b><br>${origin.name}<br>${origin.address}`);
        
      // If only origin is selected, pan to it
      if (!selectedDestination.value) {
        map.setView([origin.latitude, origin.longitude], 14);
      }
    }
  }

  // Add destination marker
  if (selectedDestination.value) {
    const destination = rooms.value.find(r => r.id === selectedDestination.value);
    if (destination) {
      destinationMarker = L.marker([destination.latitude, destination.longitude], { icon: destinationIcon })
        .addTo(map)
        .bindPopup(`<b>Destino:</b><br>${destination.name}<br>${destination.address}`);
        
      // If only destination is selected, pan to it
      if (!selectedOrigin.value) {
        map.setView([destination.latitude, destination.longitude], 14);
      }
    }
  }
  
  // If both selected, fit bounds
  if (selectedOrigin.value && selectedDestination.value && originMarker && destinationMarker) {
    const group = L.featureGroup([originMarker, destinationMarker]);
    map.fitBounds(group.getBounds(), { padding: [50, 50] });
  }
};

const calculateRoute = async () => {
  if (!selectedOrigin.value || !selectedDestination.value) {
    error.value = 'Por favor selecciona origen y destino';
    return;
  }

  if (selectedOrigin.value === selectedDestination.value) {
    error.value = 'El origen y destino deben ser diferentes';
    return;
  }

  const origin = rooms.value.find(r => r.id === selectedOrigin.value);
  const destination = rooms.value.find(r => r.id === selectedDestination.value);

  if (!origin || !destination) return;

  loading.value = true;
  error.value = null;
  routeInfo.value = null;

  try {
    const route = await routingService.getRoute({
      origin: { latitude: origin.latitude, longitude: origin.longitude },
      destination: { latitude: destination.latitude, longitude: destination.longitude },
      mode: transportMode.value
    });

    console.log('Route received:', route);
    routeInfo.value = route;

    // Draw route on map
    if (map && route.geometry && route.geometry.length > 0) {
      // Remove existing route
      if (routeLayer) {
        routeLayer.remove();
        routeLayer = null;
      }

      // Convert [lon, lat] to [lat, lon] for Leaflet
      const latLngs: L.LatLngExpression[] = route.geometry
        .filter((coord): coord is [number, number] => coord.length === 2 && coord[0] !== undefined && coord[1] !== undefined)
        .map(coord => [coord[1], coord[0]] as L.LatLngTuple);

      routeLayer = L.polyline(latLngs, {
        color: transportMode.value === 'car' ? '#3388ff' : '#ff6b35',
        weight: 5,
        opacity: 0.7
      }).addTo(map);

      // Fit map to show entire route
      map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
    }
  } catch (err) {
    console.error('Error calculating route:', err);
    error.value = `Error al calcular la ruta. Asegúrate de que el servidor OSRM esté ejecutándose en el puerto ${transportMode.value === 'car' ? '7000' : '7001'}`;
  } finally {
    loading.value = false;
  }
};

const clearRoute = () => {
  selectedOrigin.value = '';
  selectedDestination.value = '';
  routeInfo.value = null;
  error.value = null;

  if (map) {
    if (routeLayer) {
      routeLayer.remove();
      routeLayer = null;
    }
    if (originMarker) {
      originMarker.remove();
      originMarker = null;
    }
    if (destinationMarker) {
      destinationMarker.remove();
      destinationMarker = null;
    }
    map.setView([40.4168, -3.7038], 13);
  }
};

// Watch for changes in selection
watch([selectedOrigin, selectedDestination], () => {
  updateMarkers();
});

// Watch for transport mode changes
watch(transportMode, () => {
  if (selectedOrigin.value && selectedDestination.value) {
    calculateRoute();
  }
});
</script>

<template>
  <div class="routing-container">
    <div class="controls-panel">
      <h2>🗺️ Prueba de Rutas OSRM</h2>
      
      <div class="control-group">
        <label for="transport-mode">Modo de Transporte:</label>
        <select id="transport-mode" v-model="transportMode" class="select-input">
          <option value="foot">🚶 A pie (Puerto 7001)</option>
          <option value="car">🚗 En coche (Puerto 7000)</option>
        </select>
      </div>

      <div class="control-group">
        <label for="origin">Origen:</label>
        <select 
          id="origin" 
          v-model="selectedOrigin" 
          class="select-input"
          :disabled="loading"
        >
          <option value="">-- Selecciona sala de origen --</option>
          <option 
            v-for="room in rooms" 
            :key="room.id" 
            :value="room.id"
            :disabled="room.id === selectedDestination"
          >
            {{ room.name }}
          </option>
        </select>
      </div>

      <div class="control-group">
        <label for="destination">Destino:</label>
        <select 
          id="destination" 
          v-model="selectedDestination" 
          class="select-input"
          :disabled="loading"
        >
          <option value="">-- Selecciona sala de destino --</option>
          <option 
            v-for="room in rooms" 
            :key="room.id" 
            :value="room.id"
            :disabled="room.id === selectedOrigin"
          >
            {{ room.name }}
          </option>
        </select>
      </div>

      <div class="button-group">
        <button 
          @click="calculateRoute" 
          :disabled="!selectedOrigin || !selectedDestination || loading"
          class="btn btn-primary"
        >
          {{ loading ? 'Calculando...' : 'Calcular Ruta' }}
        </button>
        <button 
          @click="clearRoute" 
          :disabled="loading"
          class="btn btn-secondary"
        >
          Limpiar
        </button>
      </div>

      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <div v-if="routeInfo" class="route-info">
        <h3>📊 Información de la Ruta</h3>
        <div class="info-item">
          <span class="label">Distancia:</span>
          <span class="value">{{ (routeInfo.distance / 1000).toFixed(2) }} km</span>
        </div>
        <div class="info-item">
          <span class="label">Duración:</span>
          <span class="value">{{ Math.round(routeInfo.duration / 60) }} minutos</span>
        </div>
        <div class="info-item">
          <span class="label">Modo:</span>
          <span class="value">{{ transportMode === 'car' ? '🚗 Coche' : '🚶 A pie' }}</span>
        </div>
      </div>

      <div class="info-box">
        <p><strong>ℹ️ Instrucciones:</strong></p>
        <ol>
          <li>Selecciona el modo de transporte</li>
          <li>Elige una sala de origen</li>
          <li>Elige una sala de destino</li>
          <li>Haz clic en "Calcular Ruta"</li>
        </ol>
        <p class="note">
          <strong>Nota:</strong> Asegúrate de que el servidor OSRM esté ejecutándose:
          <code>docker-compose -f PCE.Routing/docker-compose-madrid.yml up</code>
        </p>
      </div>
    </div>

    <div class="map-panel">
      <LeafletMap 
        ref="mapComponent"
        :show-room-markers="false"
        :center="[40.4168, -3.7038]"
        :zoom="13"
        @map-ready="onMapReady"
      />
    </div>
  </div>
</template>

<style scoped>
.routing-container {
  display: flex;
  gap: 1.5rem;
  height: 100%;
  width: 100%;
  flex: 1;
  min-height: 500px;
  padding-bottom: 1rem;
}

.controls-panel {
  flex: 0 0 350px;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  height: 100%;
}

.controls-panel h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.5rem;
}

.control-group {
  margin-bottom: 1.25rem;
}

.control-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.select-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  background-color: white;
}

.select-input:focus {
  outline: none;
  border-color: #667eea;
}

.select-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f5f5f5;
  color: #666;
  border: 2px solid #e0e0e0;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
}

.error-message {
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  color: #856404;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
}

.route-info {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.25rem;
  border: 2px solid #667eea30;
}

.route-info h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-weight: 600;
  color: #555;
}

.info-item .value {
  color: #667eea;
  font-weight: 700;
}

.info-box {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid #667eea;
  font-size: 0.85rem;
  color: #555;
}

.info-box p {
  margin: 0 0 0.75rem 0;
}

.info-box ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.info-box li {
  margin-bottom: 0.25rem;
}

.info-box .note {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
  font-size: 0.8rem;
}

.info-box code {
  background: #e9ecef;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.75rem;
  display: block;
  margin-top: 0.5rem;
  word-break: break-all;
}

.map-panel {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

@media (max-width: 1024px) {
  .routing-container {
    flex-direction: column;
    height: auto;
  }

  .controls-panel {
    flex: 0 0 auto;
    height: auto;
  }

  .map-panel {
    min-height: 500px;
  }
}
</style>
