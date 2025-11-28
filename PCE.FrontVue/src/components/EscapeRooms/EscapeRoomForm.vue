<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { escapeRoomService } from '../../services/escapeRoomService';
import { companyService } from '../../services/companyService';
import AddressSearchSelector from '../Shared/AddressSearchSelector.vue';
import type { CreateEscapeRoomRequest, UpdateEscapeRoomRequest, CompanyDto } from '../../types/models';

const props = defineProps<{
  slug?: string; // If present, we are in Edit mode
}>();

const emit = defineEmits(['saved', 'cancel']);

const isEditMode = computed(() => !!props.slug);
const loading = ref(false);
const companies = ref<CompanyDto[]>([]);

const formData = ref({
  name: '',
  description: '',
  maxPlayers: 6,
  minPlayers: 2,
  durationMinutes: 60,
  difficultyLevel: 'Media',
  pricePerPerson: 20,
  companySlug: '',
  latitude: 0,
  longitude: 0,
  address: ''
});

const difficultyOptions = ['Fácil', 'Media', 'Difícil', 'Muy Difícil', 'Experto'];

const onAddressSelected = (location: { latitude: number; longitude: number; address: string }) => {
  formData.value.latitude = location.latitude;
  formData.value.longitude = location.longitude;
  formData.value.address = location.address;
};

onMounted(async () => {
  loading.value = true;
  try {
    // Load companies for the dropdown
    companies.value = await companyService.getAllCompanies();
    
    if (isEditMode.value && props.slug) {
      const room = await escapeRoomService.getRoomBySlug(props.slug);
      
      formData.value = {
        name: room.name,
        description: room.description,
        maxPlayers: room.maxPlayers,
        minPlayers: room.minPlayers,
        durationMinutes: room.durationMinutes,
        difficultyLevel: room.difficultyLevel,
        pricePerPerson: room.pricePerPerson,
        companySlug: room.companySlug,
        latitude: room.latitude,
        longitude: room.longitude,
        address: room.address
      };
    }
  } catch (error) {
    console.error('Error loading data:', error);
    alert('Error al cargar datos');
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    if (isEditMode.value && props.slug) {
      const request: UpdateEscapeRoomRequest = {
        slug: props.slug,
        name: formData.value.name,
        description: formData.value.description,
        maxPlayers: formData.value.maxPlayers,
        minPlayers: formData.value.minPlayers,
        durationMinutes: formData.value.durationMinutes,
        difficultyLevel: formData.value.difficultyLevel,
        pricePerPerson: formData.value.pricePerPerson,
        latitude: formData.value.latitude,
        longitude: formData.value.longitude,
        address: formData.value.address
      };
      await escapeRoomService.updateRoom(request);
    } else {
      const request: CreateEscapeRoomRequest = {
        name: formData.value.name,
        description: formData.value.description,
        maxPlayers: formData.value.maxPlayers,
        minPlayers: formData.value.minPlayers,
        durationMinutes: formData.value.durationMinutes,
        difficultyLevel: formData.value.difficultyLevel,
        pricePerPerson: formData.value.pricePerPerson,
        companySlug: formData.value.companySlug,
        latitude: formData.value.latitude,
        longitude: formData.value.longitude,
        address: formData.value.address
      };
      await escapeRoomService.createRoom(request);
    }
    emit('saved');
  } catch (error) {
    console.error('Error saving room:', error);
    alert('Error al guardar la sala');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="escape-room-form">
    <h2>{{ isEditMode ? 'Editar Sala' : 'Nueva Sala' }}</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Nombre:</label>
        <input v-model="formData.name" required />
      </div>
      
      <div class="form-group">
        <label>Descripción:</label>
        <textarea v-model="formData.description" required></textarea>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Min Jugadores:</label>
          <input type="number" v-model.number="formData.minPlayers" min="1" required />
        </div>
        <div class="form-group">
          <label>Max Jugadores:</label>
          <input type="number" v-model.number="formData.maxPlayers" min="1" required />
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Duración (min):</label>
          <input type="number" v-model.number="formData.durationMinutes" required />
        </div>
        <div class="form-group">
          <label>Precio/Persona (€):</label>
          <input type="number" v-model.number="formData.pricePerPerson" step="0.01" required />
        </div>
      </div>
      
      <div class="form-group">
        <label>Dificultad:</label>
        <select v-model="formData.difficultyLevel" required>
          <option v-for="opt in difficultyOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
      
      <AddressSearchSelector 
        :initial-address="formData.address"
        :initial-latitude="formData.latitude"
        :initial-longitude="formData.longitude"
        @selected="onAddressSelected" 
      />
      
      <div class="form-group" v-if="!isEditMode">
        <label>Empresa:</label>
        <select v-model="formData.companySlug" required>
          <option value="" disabled>Selecciona una empresa</option>
          <option v-for="company in companies" :key="company.slug" :value="company.slug">
            {{ company.name }}
          </option>
        </select>
      </div>
      
      <div class="actions">
        <button type="button" @click="$emit('cancel')" class="btn-cancel">Cancelar</button>
        <button type="submit" class="btn-save" :disabled="loading || !formData.address">
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.escape-room-form {
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, textarea, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel {
  background-color: #e0e0e0;
  color: #333;
}

.btn-save {
  background-color: #4caf50;
  color: white;
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
