<template>
  <div ref="mapContainer" class="map-frame"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onBeforeUnmount } from 'vue';
import L, { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { EscapeRoomMapDto } from '../../types/models';

// Import marker icons for Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const props = withDefaults(defineProps<{
  rooms?: EscapeRoomMapDto[];
  center?: [number, number];
  zoom?: number;
  showRoomMarkers?: boolean;
}>(), {
  rooms: () => [],
  center: () => [40.416, -3.703],
  zoom: 13,
  showRoomMarkers: true
});

const emit = defineEmits<{
  mapReady: [map: L.Map];
}>();

const mapContainer = ref<HTMLElement | null>(null);
const map = ref<L.Map | null>(null);
const markers = ref<L.Marker[]>([]);

type DefaultIconOptions = Icon.Default & {
  _getIconUrl?: string;
};

delete (Icon.Default.prototype as DefaultIconOptions)._getIconUrl;

Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

onMounted(() => {
  if (!mapContainer.value) {
    console.error('Map container not found');
    return;
  }

  // Inicializar el mapa
  map.value = L.map(mapContainer.value).setView(props.center, props.zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value as L.Map);

  // Force map to recalculate size after initialization
  setTimeout(() => {
    if (map.value) {
      map.value.invalidateSize();
    }
  }, 100);

  // Emit map instance for parent components to use
  if (map.value) {
    emit('mapReady', map.value as L.Map);
  }

  // Render room markers if enabled
  if (props.showRoomMarkers) {
    renderMarkers();
  }
});

onBeforeUnmount(() => {
  // Clean up map instance
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});

// Observar cambios en las rooms
watch(() => props.rooms, () => {
  if (props.showRoomMarkers) {
    renderMarkers();
  }
}, { deep: true });

const renderMarkers = () => {
  if (!map.value) return;

  // Limpiar marcadores anteriores
  markers.value.forEach(marker => {
    marker.remove();
  });
  markers.value = [];

  // Agregar nuevos marcadores
  props.rooms?.forEach(room => {
    if (map.value) {
      const marker = L.marker([room.latitude, room.longitude]).addTo(map.value as L.Map);
      marker.bindPopup(`<b>${room.name}</b><br>Dificultad: ${room.difficultyLevel}`);
      markers.value.push(marker);
    }
  });

  // Ajustar zoom si hay marcadores
  if (markers.value.length > 0 && map.value) {
    const bounds = L.latLngBounds(markers.value.map(m => m.getLatLng()));
    map.value.fitBounds(bounds, { padding: [50, 50] });
  }
};

// Expose map instance and utility methods to parent
defineExpose({
  map,
  addLayer: (layer: L.Layer) => {
    if (map.value) {
      layer.addTo(map.value as L.Map);
    }
  },
  removeLayer: (layer: L.Layer) => {
    if (map.value) {
      map.value.removeLayer(layer);
    }
  },
  fitBounds: (bounds: L.LatLngBounds, options?: L.FitBoundsOptions) => {
    if (map.value) {
      map.value.fitBounds(bounds, options);
    }
  },
  setView: (center: L.LatLngExpression, zoom?: number) => {
    if (map.value) {
      map.value.setView(center, zoom);
    }
  }
});
</script>

<style scoped>
.map-frame {
  height: 100%;
  width: 100%;
  min-height: 100%;
  flex: 1;
}
</style>