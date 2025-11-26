<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { escapeRoomService } from '../../services/escapeRoomService';
import type { EscapeRoomDto } from '../../types/models';

const rooms = ref<EscapeRoomDto[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const loadRooms = async () => {
  loading.value = true;
  try {
    rooms.value = await escapeRoomService.getAllRooms();
  } catch (err) {
    error.value = 'Error al cargar las salas';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const deleteRoom = async (slug: string) => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta sala?')) return;
  
  try {
    await escapeRoomService.deleteRoom(slug);
    await loadRooms();
  } catch (err) {
    alert('Error al eliminar la sala');
    console.error(err);
  }
};

const editRoom = (slug: string) => {
  console.log('Edit', slug);
};

onMounted(() => {
  loadRooms();
});

defineExpose({ loadRooms });
</script>

<template>
  <div class="escape-room-list">
    <h2>Gestión de Salas</h2>
    
    <div v-if="loading" class="loading">Cargando...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Empresa</th>
            <th>Dificultad</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="room in rooms" :key="room.slug">
            <td>{{ room.name }}</td>
            <td>{{ room.companySlug }}</td> <!-- TODO: Show Company Name if available -->
            <td>{{ room.difficultyLevel }}</td>
            <td>{{ room.pricePerPerson }}€</td>
            <td class="actions">
              <button @click="editRoom(room.slug)" class="btn-edit">Editar</button>
              <button @click="deleteRoom(room.slug)" class="btn-delete">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.escape-room-list {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit {
  background-color: #ffc107;
  color: #000;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}
</style>
