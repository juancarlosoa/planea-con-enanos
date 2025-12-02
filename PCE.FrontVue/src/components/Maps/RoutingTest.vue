<script setup lang="ts">
import { ref, computed, markRaw } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LeafletMap from './LeafletMap.vue';
import { routingService } from '../../services/routingService';
import type { MockEscapeRoom, MultiPointRouteResponse, RouteCoordinate } from '../../types/models';

const mapComponent = ref<InstanceType<typeof LeafletMap> | null>(null);
let map: L.Map | null = null;
let routeLayer: L.Polyline | null = null;
const roomMarkers = ref<Map<string, L.Marker>>(new Map());
const arrowMarkers = ref<L.Marker[]>([]);

const rooms = ref<MockEscapeRoom[]>([]);
const selectedRoomIds = ref<string[]>([]);
const transportMode = ref<'car' | 'foot'>('foot');
const routeInfo = ref<MultiPointRouteResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Computed property to get selected rooms in order
const selectedRooms = computed(() => {
  return selectedRoomIds.value
    .map(id => rooms.value.find(r => r.id === id))
    .filter((room): room is MockEscapeRoom => room !== undefined);
});

// Check if we can calculate a route (need at least 2 rooms)
const canCalculateRoute = computed(() => selectedRoomIds.value.length >= 2);

// Create numbered marker icons
const createNumberedIcon = (number: number) => {
  const colors = [
    '#22c55e', // green
    '#3b82f6', // blue
    '#f59e0b', // amber
    '#ef4444', // red
    '#a855f7', // purple
    '#ec4899', // pink
  ];
  
  const color = colors[(number - 1) % colors.length];
  
  // Create SVG marker to avoid CSS positioning issues
  const svgIcon = `
    <svg width="36" height="46" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer white border circle -->
      <circle cx="18" cy="18" r="16" fill="white"/>
      <!-- Main colored circle -->
      <circle cx="18" cy="18" r="13" fill="${color}"/>
      <!-- Number text -->
      <text x="18" y="23" text-anchor="middle" font-size="14" font-weight="bold" fill="white">${number}</text>
      <!-- Pointer triangle -->
      <path d="M 18 36 L 13 28 L 23 28 Z" fill="${color}"/>
    </svg>
  `;
  
  return L.divIcon({
    className: 'numbered-marker-icon',
    html: svgIcon,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -46]
  });
};

// Calculate bearing between two points
const getBearing = (startLat: number, startLng: number, destLat: number, destLng: number) => {
  const startLatRad = startLat * (Math.PI / 180);
  const startLngRad = startLng * (Math.PI / 180);
  const destLatRad = destLat * (Math.PI / 180);
  const destLngRad = destLng * (Math.PI / 180);

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
            Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  
  let brng = Math.atan2(y, x);
  brng = brng * (180 / Math.PI);
  return (brng + 360) % 360;
};

// Create arrow icon rotated by angle
const createArrowIcon = (angle: number, color: string) => {
  return L.divIcon({
    className: 'arrow-icon',
    html: `
      <div style="
        transform: rotate(${angle}deg);
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L12 20M12 4L6 10M12 4L18 10" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const onMapReady = (mapInstance: L.Map) => {
  console.log('Map ready:', mapInstance);
  map = mapInstance;
  rooms.value = routingService.getMockRooms();
  
  // Force resize to ensure map renders correctly
  setTimeout(() => {
    map?.invalidateSize();
  }, 200);
};

const toggleRoomSelection = (roomId: string) => {
  const index = selectedRoomIds.value.indexOf(roomId);
  
  if (index > -1) {
    // Remove room from selection
    selectedRoomIds.value.splice(index, 1);
  } else {
    // Add room to selection
    selectedRoomIds.value.push(roomId);
  }
  
  updateMarkers();
};

const updateMarkers = () => {
  if (!map) {
    console.error('Map is not initialized in updateMarkers');
    return;
  }

  // Remove all existing markers safely
  roomMarkers.value.forEach(marker => {
    if (marker && map) {
      map.removeLayer(marker as unknown as L.Layer);
    }
  });
  roomMarkers.value.clear();

  // Add numbered markers for selected rooms
  selectedRoomIds.value.forEach((roomId, index) => {
    const room = rooms.value.find(r => r.id === roomId);
    if (room && map) {
      const marker = markRaw(L.marker(
        [room.latitude, room.longitude],
        { icon: createNumberedIcon(index + 1) }
      )
        .addTo(map)
        .bindPopup(`
          <b>${index + 1}. ${room.name}</b><br>
          ${room.address}
        `));
      
      roomMarkers.value.set(roomId, marker);
    }
  });

  // Don't call fitBounds here - it causes zoom conflicts
  // fitBounds will be called when calculating route
};

const calculateRoute = async () => {
  if (!canCalculateRoute.value) {
    error.value = 'Por favor selecciona al menos 2 salas';
    return;
  }

  loading.value = true;
  error.value = null;
  routeInfo.value = null;

  try {
    // Convert selected rooms to waypoints
    const waypoints: RouteCoordinate[] = selectedRooms.value.map(room => ({
      latitude: room.latitude,
      longitude: room.longitude
    }));

    const route = await routingService.getMultiPointRoute({
      waypoints,
      mode: transportMode.value
    });

    console.log('Multi-point route received:', route);
    routeInfo.value = route;

    // Draw route on map
    if (map && route.combinedGeometry && route.combinedGeometry.length > 0) {
      // Remove existing route
      if (routeLayer) {
        routeLayer.remove();
        routeLayer = null;
      }

      // Convert [lon, lat] to [lat, lon] for Leaflet
      const latLngs: L.LatLngExpression[] = route.combinedGeometry
        .filter((coord): coord is [number, number] => coord.length === 2 && coord[0] !== undefined && coord[1] !== undefined)
        .map(coord => [coord[1], coord[0]] as L.LatLngTuple);

      routeLayer = L.polyline(latLngs, {
        color: transportMode.value === 'car' ? '#3388ff' : '#ff6b35',
        weight: 5,
        opacity: 0.7
      }).addTo(map);

      // Fit map to show entire route
      map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });

      // Add directional arrows
      // Clear existing arrows
      arrowMarkers.value.forEach(marker => {
        if (marker && map) {
          map.removeLayer(marker as unknown as L.Layer);
        }
      });
      arrowMarkers.value = [];

      // Add new arrows every ~10 points to show direction
      const step = 10; 
      const color = transportMode.value === 'car' ? '#3388ff' : '#ff6b35';
      
      for (let i = 0; i < latLngs.length - 1; i += step) {
        // Ensure we have a next point
        if (i + 1 < latLngs.length) {
          const current = latLngs[i] as L.LatLngTuple;
          // Look ahead a bit for better angle calculation
          const nextIndex = Math.min(i + 5, latLngs.length - 1);
          const next = latLngs[nextIndex] as L.LatLngTuple;
          
          // Only add arrow if points are distinct enough
          if (current[0] !== next[0] || current[1] !== next[1]) {
            const angle = getBearing(current[0], current[1], next[0], next[1]);
            const arrow = markRaw(L.marker(current, {
              icon: createArrowIcon(angle, color),
              zIndexOffset: -100 // Keep arrows below room markers
            })).addTo(map);
            
            arrowMarkers.value.push(arrow);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error calculating route:', err);
    error.value = `Error al calcular la ruta. Asegúrate de que el servidor OSRM esté ejecutándose en el puerto ${transportMode.value === 'car' ? '7000' : '7001'}`;
  } finally {
    loading.value = false;
  }
};

const clearRoute = () => {
  selectedRoomIds.value = [];
  routeInfo.value = null;
  error.value = null;

  if (map) {
    if (routeLayer) {
      map.removeLayer(routeLayer);
      routeLayer = null;
    }
    
    // Clear arrows
    arrowMarkers.value.forEach(marker => {
      if (marker && map) {
        map.removeLayer(marker as unknown as L.Layer);
      }
    });
    arrowMarkers.value = [];

    roomMarkers.value.forEach(marker => {
      if (marker && map) {
        map.removeLayer(marker as unknown as L.Layer);
      }
    });
    roomMarkers.value.clear();
    map.setView([40.4168, -3.7038], 13);
  }
};

const moveRoomUp = (index: number) => {
  if (index > 0) {
    const temp = selectedRoomIds.value[index];
    const prevItem = selectedRoomIds.value[index - 1];
    if (temp !== undefined && prevItem !== undefined) {
      selectedRoomIds.value[index] = prevItem;
      selectedRoomIds.value[index - 1] = temp;
      updateMarkers();
    }
  }
};

const moveRoomDown = (index: number) => {
  if (index < selectedRoomIds.value.length - 1) {
    const temp = selectedRoomIds.value[index];
    const nextItem = selectedRoomIds.value[index + 1];
    if (temp !== undefined && nextItem !== undefined) {
      selectedRoomIds.value[index] = nextItem;
      selectedRoomIds.value[index + 1] = temp;
      updateMarkers();
    }
  }
};
</script>

<template>
  <div class="routing-container">
    <div class="controls-panel">
      <h2>🗺️ Planificador de Rutas Multi-Sala</h2>
      
      <div class="control-group">
        <label for="transport-mode">Modo de Transporte:</label>
        <select id="transport-mode" v-model="transportMode" class="select-input">
          <option value="foot">🚶 A pie (Puerto 7001)</option>
          <option value="car">🚗 En coche (Puerto 7000)</option>
        </select>
      </div>

      <div class="rooms-section">
        <h3>Selecciona Salas</h3>
        <div class="rooms-list">
          <div 
            v-for="room in rooms" 
            :key="room.id"
            class="room-item"
            :class="{ selected: selectedRoomIds.includes(room.id) }"
            @click="toggleRoomSelection(room.id)"
          >
            <div class="room-checkbox">
              <input 
                type="checkbox" 
                :checked="selectedRoomIds.includes(room.id)"
                @click.stop="toggleRoomSelection(room.id)"
              />
            </div>
            <div class="room-info">
              <div class="room-name">{{ room.name }}</div>
              <div class="room-address">{{ room.address }}</div>
            </div>
            <div v-if="selectedRoomIds.includes(room.id)" class="room-order">
              {{ selectedRoomIds.indexOf(room.id) + 1 }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedRoomIds.length > 0" class="selected-rooms-section">
        <h3>Orden de Visita ({{ selectedRoomIds.length }} salas)</h3>
        <div class="selected-rooms-list">
          <div 
            v-for="(roomId, index) in selectedRoomIds" 
            :key="roomId"
            class="selected-room-item"
          >
            <span class="room-number">{{ index + 1 }}</span>
            <span class="room-name-short">
              {{ rooms.find(r => r.id === roomId)?.name }}
            </span>
            <div class="room-controls">
              <button 
                @click="moveRoomUp(index)" 
                :disabled="index === 0"
                class="btn-icon"
                title="Mover arriba"
              >
                ↑
              </button>
              <button 
                @click="moveRoomDown(index)" 
                :disabled="index === selectedRoomIds.length - 1"
                class="btn-icon"
                title="Mover abajo"
              >
                ↓
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="button-group">
        <button 
          @click="calculateRoute" 
          :disabled="!canCalculateRoute || loading"
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
          <span class="label">Distancia Total:</span>
          <span class="value">{{ (routeInfo.totalDistance / 1000).toFixed(2) }} km</span>
        </div>
        <div class="info-item">
          <span class="label">Duración Total:</span>
          <span class="value">{{ Math.round(routeInfo.totalDuration / 60) }} minutos</span>
        </div>
        <div class="info-item">
          <span class="label">Salas a Visitar:</span>
          <span class="value">{{ selectedRoomIds.length }}</span>
        </div>
        <div class="info-item">
          <span class="label">Modo:</span>
          <span class="value">{{ transportMode === 'car' ? '🚗 Coche' : '🚶 A pie' }}</span>
        </div>
        
        <!-- Segment details -->
        <div v-if="routeInfo.segments && routeInfo.segments.length > 0" class="segments-section">
          <h4>⏱️ Detalle por Tramos</h4>
          <div 
            v-for="(segment, index) in routeInfo.segments" 
            :key="index"
            class="segment-item"
          >
            <div class="segment-header">
              <span class="segment-number">{{ index + 1 }}</span>
              <span class="segment-route">
                {{ selectedRooms[segment.fromIndex]?.name }} 
                <span class="arrow">→</span>
                {{ selectedRooms[segment.toIndex]?.name }}
              </span>
            </div>
            <div class="segment-details">
              <span class="segment-stat">
                📏 {{ (segment.distance / 1000).toFixed(2) }} km
              </span>
              <span class="segment-stat">
                ⏱️ {{ Math.round(segment.duration / 60) }} min
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="info-box">
        <p><strong>ℹ️ Instrucciones:</strong></p>
        <ol>
          <li>Selecciona el modo de transporte</li>
          <li>Haz clic en las salas que quieres visitar</li>
          <li>Reordena las salas si es necesario usando ↑ ↓</li>
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
  flex: 0 0 380px;
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

.controls-panel h3 {
  margin: 0 0 0.75rem 0;
  color: #555;
  font-size: 1rem;
  font-weight: 600;
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

.rooms-section {
  margin-bottom: 1.25rem;
}

.rooms-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.room-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.room-item:hover {
  border-color: #667eea;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
}

.room-item.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.room-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.room-info {
  flex: 1;
  min-width: 0;
}

.room-name {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-address {
  font-size: 0.75rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-order {
  width: 28px;
  height: 28px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.selected-rooms-section {
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.selected-rooms-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selected-room-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  font-size: 0.85rem;
}

.room-number {
  width: 24px;
  height: 24px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.room-name-short {
  flex: 1;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-controls {
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-icon:disabled {
  opacity: 0.3;
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

.segments-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.segments-section h4 {
  margin: 0 0 0.75rem 0;
  color: #555;
  font-size: 0.95rem;
  font-weight: 600;
}

.segment-item {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.segment-item:last-child {
  margin-bottom: 0;
}

.segment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.segment-number {
  width: 20px;
  height: 20px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  flex-shrink: 0;
}

.segment-route {
  font-size: 0.85rem;
  color: #333;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.segment-route .arrow {
  color: #667eea;
  margin: 0 0.25rem;
}

.segment-details {
  display: flex;
  gap: 1rem;
  padding-left: 1.75rem;
}

.segment-stat {
  font-size: 0.8rem;
  color: #666;
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

/* Custom marker styles */
:deep(.custom-numbered-marker) {
  background: transparent;
  border: none;
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
