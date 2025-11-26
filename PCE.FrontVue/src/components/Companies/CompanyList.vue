<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { companyService } from '../../services/companyService';
import type { CompanyDto } from '../../types/models';

const companies = ref<CompanyDto[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const emit = defineEmits(['edit']);

const loadCompanies = async () => {
  loading.value = true;
  try {
    companies.value = await companyService.getAllCompanies();
  } catch (err) {
    error.value = 'Error al cargar las empresas';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const deleteCompany = async (slug: string) => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta empresa?')) return;
  
  try {
    await companyService.deleteCompany(slug);
    await loadCompanies();
  } catch (err) {
    alert('Error al eliminar la empresa');
    console.error(err);
  }
};

onMounted(() => {
  loadCompanies();
});

defineExpose({ loadCompanies });
</script>

<template>
  <div class="company-list">
    <h2>Gestión de Empresas</h2>
    
    <div v-if="loading" class="loading">Cargando...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else class="table-container">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Web</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="company in companies" :key="company.slug">
            <td>{{ company.name }}</td>
            <td>{{ company.email }}</td>
            <td>{{ company.phone }}</td>
            <td>
              <a v-if="company.website" :href="company.website" target="_blank">Link</a>
              <span v-else>-</span>
            </td>
            <td class="actions">
              <button @click="$emit('edit', company.slug)" class="btn-edit">Editar</button>
              <button @click="deleteCompany(company.slug)" class="btn-delete">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.company-list {
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
