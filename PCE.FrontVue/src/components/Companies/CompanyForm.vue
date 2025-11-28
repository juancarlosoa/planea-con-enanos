<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { companyService } from '../../services/companyService';
import AddressSearchSelector from '../Shared/AddressSearchSelector.vue';
import type { CreateCompanyRequest, UpdateCompanyRequest } from '../../types/models';

const props = defineProps<{
  slug?: string; // If present, we are in Edit mode
}>();

const emit = defineEmits(['saved', 'cancel']);

const isEditMode = computed(() => !!props.slug);
const loading = ref(false);

const formData = ref({
  name: '',
  email: '',
  phone: '',
  latitude: 0,
  longitude: 0,
  address: '',
  website: ''
});

const onAddressSelected = (location: { latitude: number; longitude: number; address: string }) => {
  formData.value.latitude = location.latitude;
  formData.value.longitude = location.longitude;
  formData.value.address = location.address;
};

onMounted(async () => {
  if (isEditMode.value && props.slug) {
    loading.value = true;
    try {
      const company = await companyService.getCompanyBySlug(props.slug);

      formData.value = {
        name: company.name,
        email: company.email,
        phone: company.phone,
        latitude: company.latitude,
        longitude: company.longitude,
        address: company.address || '',
        website: company.website || ''
      };
    } catch (error) {
      console.error('Error loading company:', error);
      alert('Error al cargar datos');
    } finally {
      loading.value = false;
    }
  }
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    if (isEditMode.value && props.slug) {
      const request: UpdateCompanyRequest = {
        slug: props.slug,
        name: formData.value.name,
        email: formData.value.email,
        phone: formData.value.phone,
        latitude: formData.value.latitude,
        longitude: formData.value.longitude,
        address: formData.value.address,
        website: formData.value.website
      };
      await companyService.updateCompany(request);
    } else {
      const request: CreateCompanyRequest = {
        name: formData.value.name,
        email: formData.value.email,
        phone: formData.value.phone,
        latitude: formData.value.latitude,
        longitude: formData.value.longitude,
        address: formData.value.address,
        website: formData.value.website
      };
      await companyService.createCompany(request);
    }
    emit('saved');
  } catch (error) {
    console.error('Error saving company:', error);
    alert('Error al guardar la empresa');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="company-form">
    <h2>{{ isEditMode ? 'Editar Empresa' : 'Nueva Empresa' }}</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label>Nombre:</label>
        <input v-model="formData.name" required />
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label>Email:</label>
          <input type="email" v-model="formData.email" required />
        </div>
        <div class="form-group">
          <label>Teléfono:</label>
          <input type="tel" v-model="formData.phone" required />
        </div>
      </div>
      
      <AddressSearchSelector 
        :initial-address="formData.address"
        :initial-latitude="formData.latitude"
        :initial-longitude="formData.longitude"
        @selected="onAddressSelected" 
      />
      
      <div class="form-group">
        <label>Sitio Web:</label>
        <input type="url" v-model="formData.website" placeholder="https://..." />
      </div>
      
      <div class="actions">
        <button type="button" @click="$emit('cancel')" class="btn-cancel">Cancelar</button>
        <button type="submit" class="btn-save" :disabled="loading">
          {{ loading ? 'Guardando...' : 'Guardar' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.company-form {
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

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
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
