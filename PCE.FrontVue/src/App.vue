<script setup lang="ts">
import { ref, onMounted } from 'vue';
import LeafletMap from './components/Maps/LeafletMap.vue';
import RoutingTest from './components/Maps/RoutingTest.vue';
import EscapeRoomList from './components/EscapeRooms/EscapeRoomList.vue';
import EscapeRoomForm from './components/EscapeRooms/EscapeRoomForm.vue';
import CompanyList from './components/Companies/CompanyList.vue';
import CompanyForm from './components/Companies/CompanyForm.vue';
import { escapeRoomService } from './services/escapeRoomService';
import type { EscapeRoomDto } from './types/models';

const rooms = ref<EscapeRoomDto[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const currentView = ref<'map' | 'list' | 'create' | 'edit' | 'companies' | 'create-company' | 'edit-company' | 'routing'>('map');
const editingSlug = ref<string | undefined>(undefined);
const debugInfo = ref('');

const loadData = async () => {
  loading.value = true;
  try {
    rooms.value = await escapeRoomService.getAllRooms();
    debugInfo.value = `Cargadas ${rooms.value.length} salas`;
  } catch (err) {
    error.value = 'Error al cargar las salas del backend';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const showCreate = () => {
  editingSlug.value = undefined;
  currentView.value = 'create';
};

const showEdit = (slug: string) => {
  editingSlug.value = slug;
  currentView.value = 'edit';
};

const showCompanies = () => {
  currentView.value = 'companies';
};

const showCreateCompany = () => {
  editingSlug.value = undefined;
  currentView.value = 'create-company';
};

const showEditCompany = (slug: string) => {
  editingSlug.value = slug;
  currentView.value = 'edit-company';
};

const onSaved = async () => {
  await loadData();
  currentView.value = 'list';
};

const onCompanySaved = async () => {
  currentView.value = 'companies';
};

const onCancel = () => {
  currentView.value = 'list';
};

const onCompanyCancel = () => {
  currentView.value = 'companies';
};

onMounted(async () => {
  await loadData();
});
</script>

<template>
  <div id="app-container">
    <header>
      <h1>Planea con Enanos</h1>
      <nav>
        <button @click="currentView = 'map'" :class="{ active: currentView === 'map' }">Mapa</button>
        <button @click="currentView = 'list'" :class="{ active: currentView === 'list' }">Salas</button>
        <button @click="showCreate" :class="{ active: currentView === 'create' }">Nueva Sala</button>
        <div class="separator"></div>
        <button @click="currentView = 'routing'" :class="{ active: currentView === 'routing' }">🗺️ Rutas</button>
        <div class="separator"></div>
        <button @click="showCompanies" :class="{ active: currentView === 'companies' }">Empresas</button>
        <button @click="showCreateCompany" :class="{ active: currentView === 'create-company' }">Nueva Empresa</button>
      </nav>
    </header>
    
    <div v-if="error" class="error-banner">
      {{ error }}
    </div>
    
    <main>
      <div v-if="currentView === 'map'" class="map-view">
        <LeafletMap :rooms="rooms"></LeafletMap>
      </div>
      
      <div v-else-if="currentView === 'list'" class="list-view">
        <EscapeRoomList @edit="showEdit" ref="listComponent" />
      </div>
      
      <div v-else-if="currentView === 'create' || currentView === 'edit'" class="form-view">
        <EscapeRoomForm 
          :slug="editingSlug" 
          @saved="onSaved" 
          @cancel="onCancel" 
        />
      </div>

      <div v-else-if="currentView === 'routing'" class="routing-view">
        <RoutingTest />
      </div>

      <div v-else-if="currentView === 'companies'" class="list-view">
        <CompanyList @edit="showEditCompany" />
      </div>

      <div v-else-if="currentView === 'create-company' || currentView === 'edit-company'" class="form-view">
        <CompanyForm 
          :slug="editingSlug" 
          @saved="onCompanySaved" 
          @cancel="onCompanyCancel" 
        />
      </div>
    </main>
    
    <footer>
      <p>{{ debugInfo }}</p>
    </footer>
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
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

header h1 {
  margin: 0;
  font-size: 1.5rem;
}

nav {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.separator {
  width: 1px;
  height: 24px;
  background-color: rgba(255,255,255,0.3);
  margin: 0 0.5rem;
}

nav button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 0.9rem;
}

nav button:hover, nav button.active {
  background: rgba(255, 255, 255, 0.4);
}

.error-banner {
  background-color: #fff3cd;
  color: #856404;
  padding: 1rem;
  text-align: center;
}

main {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

.map-view {
  flex: 1;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.routing-view {
  flex: 1;
  display: flex;
}

footer {
  text-align: center;
  padding: 1rem;
  color: #666;
  font-size: 0.8rem;
}
</style>
