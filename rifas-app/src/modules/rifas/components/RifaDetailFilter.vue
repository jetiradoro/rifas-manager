<template>
  <div>
    <div class="q-mb-md filter-search">
      <q-input
        :model-value="ticketSearch"
        dense
        filled
        clearable
        type="number"
        inputmode="numeric"
        label="Buscar número de ticket"
        :debounce="200"
        @update:model-value="emitSearch"
      />
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
defineProps<{
  selectedStatusFilter: string | null;
  total: number;
  available: number;
  reserved: number;
  paid: number;
  ticketSearch: string;
}>();

const emit = defineEmits<{
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
.status-filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
