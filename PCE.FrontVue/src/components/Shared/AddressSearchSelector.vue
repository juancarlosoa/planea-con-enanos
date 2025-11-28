<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import L, { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { locationService } from '../../services/locationService';
import type { LocationResult, SearchLocationParams } from '../../types/models';

// Import marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

type DefaultIconOptions = Icon.Default & {
  _getIconUrl?: string;
};

delete (Icon.Default.prototype as DefaultIconOptions)._getIconUrl;

Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const props = defineProps<{
  initialAddress?: string;
  initialLatitude?: number;
  initialLongitude?: number;
}>();

const emit = defineEmits<{
  (e: 'selected', location: { latitude: number; longitude: number; address: string }): void;
}>();

const searchParams = ref<SearchLocationParams>({
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: ''
});

const results = ref<LocationResult[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedAddress = ref<string | undefined>(props.initialAddress);
const temporarySelection = ref<LocationResult | null>(null);
const map = ref<L.Map | null>(null);
const markers = ref<L.Marker[]>([]);

const mapId = `map-${Math.random().toString(36).substr(2, 9)}`;

const search = async () => {
  loading.value = true;
  error.value = null;
  results.value = [];
  temporarySelection.value = null;
  
  try {
    if (!Object.values(searchParams.value).some(val => val)) {
      error.value = 'Ingresa al menos un criterio de búsqueda';
      return;
    }

    results.value = await locationService.searchLocation(searchParams.value);
    
    if (results.value.length === 0) {
      error.value = 'No se encontraron resultados';
    } else {
      await nextTick();
      initializeMap();
      
      if (results.value[0]) {
        onResultClick(results.value[0], 0);
      }
    }
  } catch (err) {
    console.error(err);
    error.value = 'Error al buscar la dirección';
  } finally {
    loading.value = false;
  }
};

const initializeMap = () => {
  if (map.value || results.value.length === 0) return;

  setTimeout(() => {
    const mapElement = document.getElementById(mapId);
    if (!mapElement || results.value.length === 0) return;

    const firstResult = results.value[0];
    if (!firstResult) return;

    map.value = L.map(mapId).setView([parseFloat(firstResult.lat), parseFloat(firstResult.lon)], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.value as any);

    renderMarkers();
  }, 100);
};

const renderMarkers = () => {
  if (!map.value) return;

  markers.value.forEach(marker => map.value?.removeLayer(marker as any));
  markers.value = [];

  results.value.forEach((result) => {
    const marker = L.marker([parseFloat(result.lat), parseFloat(result.lon)]).addTo(map.value as any);
    marker.bindPopup(result.displayName);
    markers.value.push(marker);
  });

  if (markers.value.length > 0) {
    const bounds = L.latLngBounds(markers.value.map(m => m.getLatLng()));
    map.value?.fitBounds(bounds, { padding: [50, 50] });
  }
};

const onResultClick = (result: LocationResult, index: number) => {
  temporarySelection.value = result;
  
  if (map.value && markers.value[index]) {
    const marker = markers.value[index];
    if (marker && map.value) {
      marker.openPopup();
      map.value.setView(marker.getLatLng(), 15, { animate: true });
    }
  }
};

const confirmSelection = () => {
  if (!temporarySelection.value) return;
  
  selectedAddress.value = temporarySelection.value.displayName;
  
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
  markers.value = [];
  results.value = [];
  
  emit('selected', {
    latitude: parseFloat(temporarySelection.value.lat),
    longitude: parseFloat(temporarySelection.value.lon),
    address: temporarySelection.value.displayName
  });
  
  temporarySelection.value = null;
};

watch(selectedAddress, (newVal) => {
  if (!newVal && map.value) {
    map.value.remove();
    map.value = null;
    markers.value = [];
  }
});
</script>

<template>
  <div class="address-selector">
    <h3>Ubicación</h3>
    
    <div v-if="selectedAddress" class="selected-location">
      <div class="location-info">
        <strong>Dirección seleccionada:</strong>
        <p>{{ selectedAddress }}</p>
      </div>
      <button type="button" @click="selectedAddress = undefined" class="change-btn">Cambiar</button>
    </div>

    <div v-else class="search-form">
      <div class="form-grid">
        <div class="form-group">
          <label>Calle</label>
          <input v-model="searchParams.street" placeholder="Ej: Gran Vía 1" @keyup.enter="search" />
        </div>
        
        <div class="form-group">
          <label>Ciudad</label>
          <input v-model="searchParams.city" placeholder="Ej: Madrid" @keyup.enter="search" />
        </div>
        
        <div class="form-group">
          <label>Provincia/Estado</label>
          <input v-model="searchParams.state" placeholder="Ej: Madrid" @keyup.enter="search" />
        </div>
        
        <div class="form-group">
          <label>Código Postal</label>
          <input v-model="searchParams.postalCode" placeholder="Ej: 28013" @keyup.enter="search" />
        </div>
        
        <div class="form-group">
          <label>País</label>
          <input v-model="searchParams.country" placeholder="Ej: España" @keyup.enter="search" />
        </div>
      </div>

      <button type="button" @click="search" :disabled="loading" class="search-btn">
        {{ loading ? 'Buscando...' : 'Buscar Dirección' }}
      </button>

      <div v-if="error" class="error-msg">{{ error }}</div>

      <div v-if="results.length > 0" class="results-container">
        <div class="results-split">
          <div class="results-list">
            <h4>Resultados ({{ results.length }})</h4>
            <ul>
              <li 
                v-for="(result, index) in results" 
                :key="index" 
                @click="onResultClick(result, index)"
                :class="{ 'selected': temporarySelection?.displayName === result.displayName }"
              >
                <div class="result-name">{{ result.displayName }}</div>
              </li>
            </ul>
          </div>
          
          <div class="map-preview">
            <div :id="mapId" class="map-container"></div>
          </div>
        </div>
        
        <div v-if="temporarySelection" class="confirm-section">
          <div class="selected-info">
            <strong>Seleccionada:</strong> {{ temporarySelection.displayName }}
          </div>
          <button type="button" @click="confirmSelection" class="confirm-btn">
            ✓ Confirmar Esta Dirección
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.address-selector {
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f9f9f9;
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: bold;
  color: #555;
}

.form-group input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-btn {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  margin-bottom: 1rem;
}

.search-btn:disabled {
  background-color: #a0c4e8;
  cursor: not-allowed;
}

.results-container {
  margin-top: 1rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.results-split {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 1rem;
  min-height: 300px;
}

.results-list h4 {
  margin: 0 0 0.5rem 0;
}

.results-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
  background: white;
}

.results-list li {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s;
}

.results-list li:hover,
.results-list li.selected {
  background-color: #e3f2fd;
  border-left: 3px solid #2196f3;
}

.result-name {
  font-size: 0.9rem;
}

.confirm-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #2196f3;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.selected-info {
  flex: 1;
  font-size: 0.95rem;
  color: #333;
}

.confirm-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: background 0.2s;
  white-space: nowrap;
}

.confirm-btn:hover {
  background-color: #45a049;
}

.map-preview {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
  background: white;
}

.map-container {
  width: 100%;
  height: 300px;
}

.selected-location {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #e8f5e9;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #c8e6c9;
}

.location-info p {
  margin: 0.25rem 0 0;
  color: #2e7d32;
  font-size: 0.95rem;
}

.change-btn {
  background: none;
  border: 1px solid #2e7d32;
  color: #2e7d32;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.change-btn:hover {
  background-color: #2e7d32;
  color: white;
}

.error-msg {
  color: #d32f2f;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  padding: 0.5rem;
  background-color: #ffebee;
  border-radius: 4px;
}
</style>
