<template>
  <q-page class="q-pa-md">
    <section class="text-subtitle1 text-weight-bold q-mb-sm">Gestión de Personas</section>

    <q-input
      v-model="searchQuery"
      dense
      outlined
      placeholder="Buscar por nombre, apellido, email o teléfono..."
      class="q-mb-md"
    >
      <template #prepend>
        <q-icon name="search" />
      </template>
      <template #append>
        <q-icon v-if="searchQuery" name="close" class="cursor-pointer" @click="searchQuery = ''" />
      </template>
    </q-input>

    <div v-if="personsStore.loading" class="text-center q-py-lg">
      <q-spinner color="primary" size="48px" />
    </div>

    <div v-else-if="filteredPersons.length === 0" class="text-center q-py-lg">
      <q-icon name="person_off" size="64px" class="text-grey-5 q-mb-md" />
      <div class="text-grey-7">
        {{
          searchQuery
            ? 'No se encontraron personas con ese criterio'
            : 'No hay personas registradas aún'
        }}
      </div>
    </div>

    <div v-else class="persons-list">
      <PersonItem
        v-for="person in filteredPersons"
        :key="person.id"
        :person="person"
        @edit="openForm"
        @view-detail="viewDetail"
      />
    </div>

    <q-page-sticky position="bottom-right" :offset="[12, 12]">
      <q-btn round color="primary" ipadding="sm" con="add" size="lg" @click="openForm()" />
    </q-page-sticky>

    <q-dialog v-model="formOpen" persistent dark>
      <PersonForm :person="editingPerson" @saved="onSaved" @cancel="closeForm" />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePersonsStore, type Person } from 'src/modules/persons/stores/persons-store';
import PersonForm from 'src/modules/persons/components/PersonForm.vue';
import PersonItem from 'src/modules/persons/components/PersonItem.vue';

const personsStore = usePersonsStore();
const router = useRouter();

const formOpen = ref(false);
const editingPerson = ref<Person | null>(null);
const searchQuery = ref('');

/**
 * Filtra personas en caliente según query de búsqueda.
 * Busca en nombre, apellido, email y teléfono.
 */
const filteredPersons = computed(() => {
  if (!searchQuery.value.trim()) {
    return personsStore.sortedPersons;
  }

  const query = searchQuery.value.toLowerCase().trim();
  return personsStore.sortedPersons.filter((person) => {
    return (
      person.name.toLowerCase().includes(query) ||
      person.surname.toLowerCase().includes(query) ||
      (person.email?.toLowerCase().includes(query) ?? false) ||
      (person.phone?.toLowerCase().includes(query) ?? false)
    );
  });
});

onMounted(async () => {
  await personsStore.fetchPersons();
});

function openForm(person?: Person) {
  editingPerson.value = person ?? null;
  formOpen.value = true;
}

function closeForm() {
  formOpen.value = false;
}

function onSaved() {
  formOpen.value = false;
  editingPerson.value = null;
}

function viewDetail(person: Person) {
  void router.push({ name: 'person-detail', params: { id: person.id } });
}
</script>

<style scoped>
.persons-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
