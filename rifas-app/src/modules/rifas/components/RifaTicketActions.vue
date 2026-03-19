<template>
  <div class="flex items-center gap-2 ticket-actions q-mb-md">
    <q-toggle
      :model-value="multiSelectMode"
      color="primary"
      label="Selección múltiple"
      dense
      :disable="disabled"
      @update:model-value="$emit('update:multi-select-mode', $event as boolean)"
    />

    <q-btn
      v-if="selectedTicketCount > 0"
      color="red-5"
      unelevated
      icon="close"
      label="Cancelar"
      :disable="disabled"
      @click="$emit('cancel-selection')"
    />

    <q-btn
      v-if="selectedTicketCount > 0 && allSelectedAvailable"
      color="primary"
      unelevated
      icon="person_add"
      :label="`Asignar (${selectedTicketCount})`"
      :disable="disabled"
      @click="$emit('assign')"
    />

    <q-btn
      v-if="selectedTicketCount > 0 && hasSelectedReserved"
      color="green"
      unelevated
      icon="paid"
      :label="`Pagar (${selectedReservedCount})`"
      :disable="disabled"
      @click="$emit('pay')"
    />

    <q-btn
      v-if="selectedTicketCount > 0 && hasSelectedPaid"
      color="orange"
      unelevated
      icon="schedule"
      :label="`Reservar (${selectedPaidCount})`"
      :disable="disabled"
      @click="$emit('reserve')"
    />

    <q-btn
      v-if="selectedTicketCount > 0 && hasSelectedSold"
      color="indigo-5"
      unelevated
      icon="remove_circle"
      :label="`Liberar (${selectedSoldCount})`"
      :disable="disabled"
      @click="$emit('release')"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  multiSelectMode: boolean;
  selectedTicketCount: number;
  allSelectedAvailable: boolean;
  hasSelectedReserved: boolean;
  selectedReservedCount: number;
  hasSelectedPaid: boolean;
  selectedPaidCount: number;
  hasSelectedSold: boolean;
  selectedSoldCount: number;
  disabled?: boolean;
}>();

defineEmits<{
  (e: 'update:multi-select-mode', value: boolean): void;
  (e: 'cancel-selection'): void;
  (e: 'assign'): void;
  (e: 'pay'): void;
  (e: 'reserve'): void;
  (e: 'release'): void;
}>();
</script>
