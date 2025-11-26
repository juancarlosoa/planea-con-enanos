<script setup lang="ts">
import { ref, onMounted } from 'vue';
import LeafletMap from './components/Maps/LeafletMap.vue';
import { escapeRoomService } from './services/escapeRoomService';
import { API_BASE_URL } from './config/api';
import type { EscapeRoomDto } from './types/models';

const rooms = ref<EscapeRoomDto[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const debugInfo = ref<string>('');

onMounted(async () => {
  // Mostrar información de depuración
  debugInfo.value = `Conectando a: ${API_BASE_URL}/rooms`;
  console.log('📍 API Base URL:', API_BASE_URL);
  console.log('🌍 Frontend URL:', window.location.href);
  
  try {
    // Intentar cargar desde el backend
    console.log('🔄 Solicitando salas...');
    rooms.value = await escapeRoomService.getAllRooms();
    console.log('✅ Salas recibidas:', rooms.value);
    debugInfo.value += ` ✅ (${rooms.value.length} salas cargadas)`;
  } catch (err) {
    error.value = 'Error al cargar las salas del backend';
    console.error('❌ Error:', err);
    debugInfo.value += ` ❌ Error: ${err instanceof Error ? err.message : 'Error desconocido'}`;
    rooms.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div id="app-container">
    <header>
      <h1>Planea con Enanos - Escape Rooms</h1>
      <p>Explora nuestras salas de escape en Madrid</p>
    </header>
    
    <div v-if="error" class="error-banner">
      {{ error }}<br>
      <small>{{ debugInfo }}</small>
    </div>
    
    <LeafletMap :rooms="rooms"></LeafletMap>
    
    <section class="rooms-list">
      <h2>Salas Disponibles</h2>
      <div v-if="loading" class="loading">
        Cargando salas...
      </div>
      <div v-else class="rooms-grid">
        <div v-if="rooms.length === 0" style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #999;">
          No hay salas disponibles. {{ debugInfo }}
        </div>
        <div v-for="room in rooms" v-else :key="room.slug" class="room-card">
          <h3>{{ room.name }}</h3>
          <p><strong>Dificultad:</strong> {{ room.difficultyLevel }}</p>
          <p><strong>Duración:</strong> {{ room.durationMinutes }} minutos</p>
          <p><strong>Jugadores:</strong> {{ room.minPlayers }}-{{ room.maxPlayers }}</p>
          <p><strong>Precio:</strong> €{{ room.pricePerPerson?.toFixed(2) ?? 'N/A' }}/persona</p>
          <p v-if="room.latitude && room.longitude"><strong>Ubicación:</strong> {{ room.latitude.toFixed(4) }}, {{ room.longitude.toFixed(4) }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: bold;
}

header p {
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.error-banner {
  background-color: #fff3cd;
  color: #856404;
  padding: 1rem;
  border-bottom: 1px solid #ffeaa7;
  text-align: center;
  font-weight: 500;
}

.error-banner small {
  display: block;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  opacity: 0.8;
}

:deep(.map-frame) {
  flex: 1;
  min-height: 500px;
}

.rooms-list {
  padding: 2rem;
  background: white;
  border-top: 2px solid #e0e0e0;
}

.rooms-list h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.8rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.room-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.room-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.room-card h3 {
  margin: 0 0 1rem 0;
  color: #667eea;
  font-size: 1.3rem;
}

.room-card p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.95rem;
}
</style>
