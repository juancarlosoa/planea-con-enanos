<template>
  <div id="mapContainer" class="map-frame"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import L, { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { EscapeRoomMapDto } from '../../types/models';

// Import marker icons for Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const props = defineProps<{
  rooms: EscapeRoomMapDto[];
}>();

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
  // Inicializar el mapa
  map.value = L.map('mapContainer').setView([40.416, -3.703], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value as any);

  renderMarkers();
});

// Observar cambios en las rooms
watch(() => props.rooms, () => {
  renderMarkers();
}, { deep: true });

const renderMarkers = () => {
  if (!map.value) return;

  // Limpiar marcadores anteriores
  markers.value.forEach(marker => {
    if (map.value) {
      map.value.removeLayer(marker as any);
    }
  });
  markers.value = [];

  // Agregar nuevos marcadores
  props.rooms.forEach(room => {
    const marker = L.marker([room.latitude, room.longitude]).addTo(map.value as any);
    marker.bindPopup(`<b>${room.name}</b><br>Dificultad: ${room.difficultyLevel}`);
    markers.value.push(marker);
  });

  // Ajustar zoom si hay marcadores
  if (markers.value.length > 0) {
    const bounds = L.latLngBounds(markers.value.map(m => m.getLatLng()));
    map.value.fitBounds(bounds, { padding: [50, 50] });
  }
};
</script>

<style scoped>
.map-frame {
  height: 100%;
  width: 100%;
  min-height: 500px;
  z-index: 1;
}
</style>