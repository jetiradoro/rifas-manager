<template>
  <q-page class="q-pa-md">
    <section class="text-subtitle1 text-weight-bold q-mb-sm">Rifas disponibles</section>

    <div class="rifas-grid">
      <RifaItem
        v-for="rifa in rifasStore.rifas"
        :key="rifa.id"
        :rifa="rifa"
        @edit="openForm"
        @view-detail="viewDetail"
      />

      <q-card v-if="rifasStore.rifas.length === 0 && !rifasStore.loading" flat bordered>
        <q-card-section class="text-center text-grey-7">
          <q-icon name="info" size="32px" class="q-mb-sm text-grey-6" />
          <div>No hay rifas aún. Crea la primera.</div>
        </q-card-section>
      </q-card>
    </div>

    <q-page-sticky v-if="isAdmin" position="bottom-right" :offset="[12, 12]">
      <q-btn round color="primary" icon="add" padding="sm" size="lg" @click="openForm()" />
    </q-page-sticky>

    <q-dialog v-model="formOpen" persistent dark>
      <RifaForm :rifa="editingRifa" @saved="onSaved" @cancel="closeForm" />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRifasStore, type Rifa } from 'src/modules/rifas/stores/rifas-store';
import RifaForm from 'src/modules/rifas/components/RifaForm.vue';
import RifaItem from 'src/modules/rifas/components/RifaItem.vue';
import { useAuthStore } from 'src/modules/auth/stores/auth-store';

const router = useRouter();
const rifasStore = useRifasStore();
const authStore = useAuthStore();

const formOpen = ref(false);
const editingRifa = ref<Rifa | null>(null);

onMounted(async () => {
  await rifasStore.fetchRifas();
});

const isAdmin = computed(() => authStore.isAdmin);

function openForm(rifa?: Rifa) {
  editingRifa.value = rifa ?? null;
  formOpen.value = true;
}

function closeForm() {
  formOpen.value = false;
}

function onSaved() {
  formOpen.value = false;
  editingRifa.value = null;
}

function viewDetail(rifa: Rifa) {
  void router.push({ name: 'rifa-detail', params: { id: rifa.id } });
}
</script>

<style scoped>
.rifas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}
</style>
