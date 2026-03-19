<template>
  <q-page class="q-pa-md">
    <div v-if="loading" class="flex flex-center q-py-xl">
      <q-spinner color="primary" size="48px" />
    </div>

    <div v-else-if="rifa" class="rifa-detail-container">
      <RifaHeaderInfo
        :rifa="rifa"
        :sold-tickets-count="ticketsStore.soldTicketsCount"
        :available-tickets-count="ticketsStore.availableTicketsCount"
        @back="goBack"
      />

      <!-- Grid de tickets -->
      <q-card flat bordered>
        <q-card-section>
          <q-banner v-if="isRifaFinished" class="bg-warning text-grey-9 q-mb-md" rounded>
            <q-icon name="emoji_events" class="q-mr-sm" />
            La rifa ha finalizado y los tickets están bloqueados.
          </q-banner>

          <div class="q-mb-md">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Tickets de la rifa</div>
            <RifaTicketPanel
              :multi-select-mode="multiSelectMode"
              :selected-ticket-count="selectedTicketNumbers.length"
              :all-selected-available="allSelectedAreAvailable"
              :has-selected-reserved="hasSelectedReserved"
              :selected-reserved-count="selectedReservedCount"
              :has-selected-paid="hasSelectedPaid"
              :selected-paid-count="selectedPaidCount"
              :has-selected-sold="hasSelectedSold"
              :selected-sold-count="selectedSoldCount"
              :selected-status-filter="selectedStatusFilter"
              :total="ticketsStore.sortedTickets.length"
              :available="ticketsStore.availableTicketsCount"
              :reserved="ticketsStore.reservedTicketsCount"
              :paid="ticketsStore.paidTicketsCount"
              :ticket-search="ticketNumberSearch"
              :actions-disabled="isRifaFinished"
              @update:multi-select-mode="onMultiSelectToggle"
              @cancel-selection="clearSelection"
              @assign="openSaleModal(selectedTicketNumbers)"
              @pay="confirmBulkChangeStatus('paid')"
              @reserve="confirmBulkChangeStatus('reserved')"
              @release="confirmBulkRelease"
              @update:status-filter="setStatusFilter"
              @update:ticket-search="onTicketSearch"
            />
          </div>

          <TicketGrid
            v-if="!ticketsStore.loading"
            :tickets="filteredTickets"
            :multi-select-mode="multiSelectMode"
            :selected-tickets="selectedTicketNumbers"
            @ticket-click="handleTicketClick"
            @ticket-select="handleTicketSelect"
          />

          <div v-else class="flex flex-center q-py-xl">
            <q-spinner color="primary" size="32px" />
          </div>
        </q-card-section>
      </q-card>

      <PrizesPanel v-if="rifa" :rifa="rifa" />
    </div>

    <div v-else class="flex flex-center q-py-xl">
      <q-card flat bordered class="q-pa-md">
        <q-icon name="error_outline" size="48px" class="text-grey-6 q-mb-sm" />
        <div class="text-grey-7">No se pudo cargar la rifa</div>
      </q-card>
    </div>

    <!-- Modales -->
    <q-dialog v-model="showSaleModal" persistent>
      <TicketSaleModal
        v-if="selectedTicketsForSale.length > 0 && rifa"
        :rifa-id="rifa.id"
        :ticket-numbers="selectedTicketsForSale"
        @saved="onTicketSold"
        @cancel="closeSaleModal"
      />
    </q-dialog>

    <q-dialog v-model="showDetailModal">
      <TicketDetailModal
        v-if="selectedTicketForDetail"
        :ticket="selectedTicketForDetail"
        :readonly="isRifaFinished"
        @close="closeDetailModal"
        @release="handleReleaseTicket"
        @change-status="handleChangeTicketStatus"
      />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useRifasStore, type Rifa } from 'src/modules/rifas/stores/rifas-store';
import { useTicketsStore, type Ticket } from 'src/modules/tickets/stores/tickets-store';
import { usePrizesStore } from 'src/modules/prizes/stores/prizes-store';
import TicketGrid from 'src/modules/tickets/components/TicketGrid.vue';
import TicketSaleModal from 'src/modules/tickets/components/TicketSaleModal.vue';
import TicketDetailModal from 'src/modules/tickets/components/TicketDetailModal.vue';
import RifaTicketPanel from 'src/modules/rifas/components/RifaTicketPanel.vue';
import RifaHeaderInfo from 'src/modules/rifas/components/RifaHeaderInfo.vue';
import PrizesPanel from 'src/modules/prizes/components/PrizesPanel.vue';
import { useRifaTickets } from 'src/modules/rifas/composables/useRifaTickets';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const rifasStore = useRifasStore();
const ticketsStore = useTicketsStore();
const prizesStore = usePrizesStore();

const loading = ref(false);
const rifa = ref<Rifa | null>(null);
const showSaleModal = ref(false);
const showDetailModal = ref(false);
const selectedTicketsForSale = ref<number[]>([]);
const selectedTicketForDetail = ref<Ticket | null>(null);

const isRifaFinished = computed(() => {
  if (!rifa.value) return false;
  const totalPrizes = rifa.value.n_prizes ?? 0;
  if (totalPrizes === 0) return false;

  const ordersWithTicket = new Set(
    prizesStore.prizes
      .filter((prize) => prize.ticket && typeof prize.ticket.number === 'number')
      .map((prize) => prize.prizeOrder),
  );

  for (let order = 1; order <= totalPrizes; order++) {
    if (!ordersWithTicket.has(order)) return false;
  }

  return true;
});

const {
  multiSelectMode,
  selectedTicketNumbers,
  selectedStatusFilter,
  ticketNumberSearch,
  filteredTickets,
  allSelectedAreAvailable,
  hasSelectedReserved,
  selectedReservedCount,
  hasSelectedPaid,
  selectedPaidCount,
  hasSelectedSold,
  selectedSoldCount,
  handleTicketClick,
  handleTicketSelect,
  clearSelection,
  onTicketSearch,
  onMultiSelectToggle,
  setStatusFilter,
  confirmBulkChangeStatus,
  confirmBulkRelease,
} = useRifaTickets({
  onOpenSaleModal: openSaleModal,
  onOpenDetailModal: openDetailModal,
  isLocked: () => isRifaFinished.value,
});

watch(isRifaFinished, (finished) => {
  if (finished) {
    clearSelection();
    closeSaleModal();
    closeDetailModal();
  }
});

function goBack() {
  void router.push({ name: 'rifas' });
}

/**
 * Abre el modal de venta de tickets.
 * @param ticketNumbers Números de tickets a vender
 */
function openSaleModal(ticketNumbers: number[]) {
  if (isRifaFinished.value) return;
  selectedTicketsForSale.value = ticketNumbers;
  showSaleModal.value = true;
}

/**
 * Cierra el modal de venta.
 */
function closeSaleModal() {
  showSaleModal.value = false;
  selectedTicketsForSale.value = [];
}

/**
 * Maneja cuando se vende un ticket.
 */
function onTicketSold() {
  closeSaleModal();
  clearSelection();
  $q.notify({
    type: 'positive',
    message: 'Ticket(s) vendido(s) correctamente',
  });
}

/**
 * Abre el modal de detalle de ticket.
 * @param ticket Ticket a mostrar
 */
function openDetailModal(ticket: Ticket) {
  if (isRifaFinished.value && ticket.status !== 'reserved' && ticket.status !== 'paid') {
    return;
  }
  selectedTicketForDetail.value = ticket;
  showDetailModal.value = true;
}

/**
 * Cierra el modal de detalle.
 */
function closeDetailModal() {
  showDetailModal.value = false;
  selectedTicketForDetail.value = null;
}

/**
 * Maneja la liberación de un ticket.
 * @param ticketId ID del ticket a liberar
 */
async function handleReleaseTicket(ticketId: number) {
  if (isRifaFinished.value) return;
  try {
    await ticketsStore.releaseTicket(ticketId);
    $q.notify({
      type: 'positive',
      message: 'Ticket liberado correctamente',
    });
    closeDetailModal();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al liberar el ticket',
    });
    console.error(error);
  }
}

/**
 * Maneja el cambio de estado de un ticket.
 * @param ticketId ID del ticket
 * @param newStatus Nuevo estado del ticket
 */
async function handleChangeTicketStatus(ticketId: number, newStatus: 'reserved' | 'paid') {
  if (isRifaFinished.value) return;
  try {
    await ticketsStore.updateTicket(ticketId, { status: newStatus });
    const statusLabel = newStatus === 'paid' ? 'pagado' : 'reservado';
    $q.notify({
      type: 'positive',
      message: `Ticket marcado como ${statusLabel}`,
    });
    closeDetailModal();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cambiar el estado del ticket',
    });
    console.error(error);
  }
}

onMounted(async () => {
  loading.value = true;
  try {
    const rifaId = parseInt(route.params.id as string, 10);

    if (isNaN(rifaId)) {
      throw new Error('ID de rifa inválido');
    }

    // Cargar rifa
    rifa.value = await rifasStore.fetchRifaById(rifaId);

    // Cargar tickets
    await ticketsStore.fetchTicketsByRifa(rifaId);

    // Cargar premios existentes
    await prizesStore.fetchPrizesByRifa(rifaId);
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la rifa',
    });
    console.error(error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.rifa-detail-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
