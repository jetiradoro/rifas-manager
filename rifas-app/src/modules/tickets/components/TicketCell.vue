<template>
  <div
    class="ticket-cell"
    :class="[
      `ticket-${ticket.status}`,
      {
        clickable: !disabled,
        'ticket-selected': isSelected,
        'ticket-disabled': disabled,
      },
    ]"
    @click="handleClick"
  >
    <div class="ticket-number">{{ ticket.number }}</div>
    <q-icon v-if="statusConfig.icon" :name="statusConfig.icon" size="14px" class="ticket-icon" />
    <q-tooltip v-if="ticket.person" anchor="top middle" self="bottom middle">
      <div class="text-caption">
        <div class="text-weight-bold">{{ ticket.person.name }} {{ ticket.person.surname }}</div>
        <div>{{ statusConfig.label }}</div>
        <div v-if="ticket.observations" class="q-mt-xs text-grey-4">
          {{ ticket.observations }}
        </div>
      </div>
    </q-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Ticket } from 'src/modules/tickets/stores/tickets-store';
import { getTicketStatusConfig } from 'src/modules/tickets/constants/ticket-status';

interface Props {
  ticket: Ticket;
  multiSelectMode?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  multiSelectMode: false,
  isSelected: false,
  disabled: false,
});

const emit = defineEmits<{
  click: [ticket: Ticket];
}>();

const statusConfig = computed(() => getTicketStatusConfig(props.ticket.status));

/**
 * Maneja el click en el ticket.
 */
function handleClick() {
  if (props.disabled) return;
  emit('click', props.ticket);
}
</script>

<style scoped>
.ticket-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
