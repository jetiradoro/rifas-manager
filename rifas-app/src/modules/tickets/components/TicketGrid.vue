<template>
  <div class="ticket-grid-container">
    <!-- Leyenda de estados -->
    <div class="ticket-legend q-mb-md">
      <div class="legend-item">
        <div class="legend-box legend-available"></div>
        <span class="text-caption">Disponible</span>
      </div>
      <div class="legend-item">
        <div class="legend-box legend-reserved"></div>
        <span class="text-caption">Reservado</span>
      </div>
      <div class="legend-item">
        <div class="legend-box legend-paid"></div>
        <span class="text-caption">Pagado</span>
      </div>
    </div>

    <!-- Grid de tickets -->
    <div class="ticket-grid">
      <TicketCell
        v-for="ticket in tickets"
        :key="ticket.id"
        :ticket="ticket"
        :multi-select-mode="multiSelectMode"
        :is-selected="isTicketSelected(ticket.number)"
        :disabled="disabled"
        @click="handleTicketClick"
      />
    </div>

    <!-- Mensaje si no hay tickets -->
    <div v-if="tickets.length === 0" class="text-center text-grey-7 q-py-lg">
      <q-icon name="confirmation_number" size="48px" class="q-mb-sm" />
      <div>No hay tickets para esta rifa</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ticket } from 'src/modules/tickets/stores/tickets-store';
import TicketCell from './TicketCell.vue';

interface Props {
  tickets: Ticket[];
  multiSelectMode?: boolean;
  selectedTickets?: number[];
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  multiSelectMode: false,
  selectedTickets: () => [],
  disabled: false,
});

const emit = defineEmits<{
  ticketClick: [ticket: Ticket];
  ticketSelect: [ticketNumber: number];
}>();

/**
 * Verifica si un ticket está seleccionado.
 * @param ticketNumber Número del ticket
 */
function isTicketSelected(ticketNumber: number): boolean {
  return props.selectedTickets.includes(ticketNumber);
}

/**
 * Maneja el click en un ticket.
 * @param ticket Ticket clickeado
 */
function handleTicketClick(ticket: Ticket) {
  if (props.disabled) return;
  emit('ticketClick', ticket);
}
</script>
