<template>
  <div>
    <div class="filter-row q-mb-md">
      <q-input
        :model-value="ticketSearch"
        dense
        filled
        clearable
        type="number"
        inputmode="numeric"
        label="Buscar número de ticket"
        :debounce="200"
        class="filter-search"
        @update:model-value="emitSearch"
      />

      <q-select
        :model-value="selectedPersonId"
        :options="filteredPersons"
        option-value="id"
        option-label="label"
        emit-value
        map-options
        dense
        filled
        clearable
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        label="Filtrar por persona"
        class="filter-person"
        @filter="filterPersons"
        @update:model-value="$emit('update:person-id', $event ?? null)"
      >
        <template #prepend><q-icon name="person_search" /></template>
        <template #option="{ itemProps, opt }">
          <q-item v-bind="itemProps">
            <q-item-section>
              <q-item-label>{{ opt.label }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge color="grey-6" :label="opt.count" />
            </q-item-section>
          </q-item>
        </template>
        <template #no-option>
          <q-item><q-item-section class="text-grey">Sin resultados</q-item-section></q-item>
        </template>
      </q-select>
    </div>

    <div v-if="personSummary" class="person-summary q-mb-md">
      <q-icon name="person" class="q-mr-xs" />
      <strong>{{ personSummary.total }}</strong> números ·
      <span class="text-positive">{{ personSummary.paid }} pagados</span> ·
      <span class="text-warning">{{ personSummary.reserved }} pendientes de pago</span>
    </div>

    <div class="status-filters q-mb-md">
      <q-chip
        clickable
        :outline="selectedStatusFilter !== null"
        :color="selectedStatusFilter === null ? 'primary' : 'grey-7'"
        :text-color="selectedStatusFilter === null ? 'white' : 'grey-7'"
        @click="emitStatus(null)"
      >
        <q-icon name="view_list" class="q-mr-xs" />
        Todos ({{ total }})
      </q-chip>

      <q-chip
        clickable
        :outline="selectedStatusFilter !== 'available'"
        :color="selectedStatusFilter === 'available' ? 'grey-6' : 'grey-7'"
        :text-color="selectedStatusFilter === 'available' ? 'white' : 'grey-7'"
        @click="emitStatus('available')"
      >
        <q-icon name="check_circle" class="q-mr-xs" />
        Disponibles ({{ available }})
      </q-chip>

      <q-chip
        clickable
        :outline="selectedStatusFilter !== 'reserved'"
        :color="selectedStatusFilter === 'reserved' ? 'warning' : 'grey-7'"
        :text-color="selectedStatusFilter === 'reserved' ? 'white' : 'grey-7'"
        @click="emitStatus('reserved')"
      >
        <q-icon name="schedule" class="q-mr-xs" />
        Reservados ({{ reserved }})
      </q-chip>

      <q-chip
        clickable
        :outline="selectedStatusFilter !== 'paid'"
        :color="selectedStatusFilter === 'paid' ? 'positive' : 'grey-7'"
        :text-color="selectedStatusFilter === 'paid' ? 'white' : 'grey-7'"
        @click="emitStatus('paid')"
      >
        <q-icon name="paid" class="q-mr-xs" />
        Pagados ({{ paid }})
      </q-chip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface PersonOption {
  id: number;
  label: string;
  count: number;
}

const props = defineProps<{
  personOptions: PersonOption[];
  selectedPersonId: number | null;
  personSummary: { total: number; paid: number; reserved: number } | null;
  selectedStatusFilter: string | null;
  total: number;
  available: number;
  reserved: number;
  paid: number;
  ticketSearch: string;
}>();

const filteredPersons = ref<PersonOption[]>(props.personOptions);

watch(
  () => props.personOptions,
  (options) => {
    filteredPersons.value = options;
  },
);

/**
 * Filtra las personas del desplegable según el texto escrito (en memoria).
 * @param val Texto de búsqueda
 * @param update Callback de Quasar para actualizar las opciones
 */
function filterPersons(val: string, update: (fn: () => void) => void) {
  update(() => {
    const term = val.trim().toLowerCase();
    filteredPersons.value = term
      ? props.personOptions.filter((p) => p.label.toLowerCase().includes(term))
      : props.personOptions;
  });
}

const emit = defineEmits<{
  (e: 'update:person-id', value: number | null): void;
  (e: 'update:status-filter', value: string | null): void;
  (e: 'update:ticket-search', value: string): void;
}>();

function emitStatus(value: string | null) {
  emit('update:status-filter', value);
}

function emitSearch(value: string | number | null) {
  if (typeof value === 'string') {
    emit('update:ticket-search', value);
  } else if (typeof value === 'number') {
    emit('update:ticket-search', value.toString());
  } else {
    emit('update:ticket-search', '');
  }
}
</script>

<style scoped>
.filter-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.filter-search {
  flex: 1 1 200px;
  max-width: 260px;
}
.filter-person {
  flex: 2 1 260px;
  max-width: 420px;
}
.person-summary {
  font-size: 0.95rem;
}
.status-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
