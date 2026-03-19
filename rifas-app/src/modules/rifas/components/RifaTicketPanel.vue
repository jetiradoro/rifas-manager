<template>
  <div>
    <RifaTicketActions
      :multi-select-mode="multiSelectMode"
      :selected-ticket-count="selectedTicketCount"
      :all-selected-available="allSelectedAvailable"
      :has-selected-reserved="hasSelectedReserved"
      :selected-reserved-count="selectedReservedCount"
      :has-selected-paid="hasSelectedPaid"
      :selected-paid-count="selectedPaidCount"
      :has-selected-sold="hasSelectedSold"
      :selected-sold-count="selectedSoldCount"
      :disabled="actionsDisabled"
      @update:multi-select-mode="$emit('update:multi-select-mode', $event)"
      @cancel-selection="$emit('cancel-selection')"
      @assign="$emit('assign')"
      @pay="$emit('pay')"
      @reserve="$emit('reserve')"
      @release="$emit('release')"
    />

    <RifaDetailFilter
      :selected-status-filter="selectedStatusFilter"
      :total="total"
      :available="available"
      :reserved="reserved"
      :paid="paid"
      :ticket-search="ticketSearch"
      @update:status-filter="$emit('update:status-filter', $event)"
      @update:ticket-search="$emit('update:ticket-search', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import RifaDetailFilter from 'src/modules/rifas/components/RifaDetailFilter.vue';
import RifaTicketActions from 'src/modules/rifas/components/RifaTicketActions.vue';

withDefaults(
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
    selectedStatusFilter: string | null;
    total: number;
    available: number;
    reserved: number;
    paid: number;
    ticketSearch: string;
    actionsDisabled?: boolean;
  }>(),
  { actionsDisabled: false },
);

defineEmits<{
  (e: 'update:multi-select-mode', value: boolean): void;
  (e: 'cancel-selection'): void;
  (e: 'assign'): void;
  (e: 'pay'): void;
  (e: 'reserve'): void;
  (e: 'release'): void;
  (e: 'update:status-filter', value: string | null): void;
  (e: 'update:ticket-search', value: string): void;
}>();
</script>
