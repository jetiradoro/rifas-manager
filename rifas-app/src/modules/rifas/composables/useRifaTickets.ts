import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useTicketsStore, type Ticket } from 'src/modules/tickets/stores/tickets-store';
import { useAuthStore } from 'src/modules/auth/stores/auth-store';

type TicketStatus = 'available' | 'reserved' | 'paid';

interface UseRifaTicketsOptions {
  onOpenSaleModal: (ticketNumbers: number[]) => void;
  onOpenDetailModal: (ticket: Ticket) => void;
  isLocked?: () => boolean;
}

/**
 * Gestiona la selección, los filtros y las acciones masivas sobre los tickets de una rifa.
 * Encapsula la lógica de UI para mantener el componente de detalle más simple.
 */
export function useRifaTickets(options: UseRifaTicketsOptions) {
  const { onOpenSaleModal, onOpenDetailModal, isLocked: isLockedGetter } = options;
  const ticketsStore = useTicketsStore();
  const authStore = useAuthStore();
  const $q = useQuasar();

  const isLocked = computed(() => isLockedGetter?.() ?? false);

  const multiSelectMode = ref(false);
  const selectedTicketNumbers = ref<number[]>([]);
  const selectedStatusFilter = ref<string | null>(null);
  const ticketNumberSearch = ref('');

  const filteredTickets = computed(() => {
    let list = ticketsStore.sortedTickets;

    if (selectedStatusFilter.value) {
      list = list.filter((ticket) => ticket.status === selectedStatusFilter.value);
    }

    const term = ticketNumberSearch.value.trim();
    if (term) {
      list = list.filter((ticket) => ticket.number.toString().includes(term));
    }

    return list;
  });

  const selectedTickets = computed(() => {
    return selectedTicketNumbers.value
      .map((num) => ticketsStore.getTicketByNumber(num))
      .filter((ticket): ticket is Ticket => ticket !== undefined);
  });

  const allSelectedAreAvailable = computed(() => {
    return (
      selectedTickets.value.length > 0 &&
      selectedTickets.value.every((ticket) => ticket.status === 'available')
    );
  });

  const hasSelectedReserved = computed(() => {
    return selectedTickets.value.some((ticket) => ticket.status === 'reserved');
  });

  const selectedReservedCount = computed(() => {
    return selectedTickets.value.filter((ticket) => ticket.status === 'reserved').length;
  });

  const hasSelectedPaid = computed(() => {
    return selectedTickets.value.some((ticket) => ticket.status === 'paid');
  });

  const selectedPaidCount = computed(() => {
    return selectedTickets.value.filter((ticket) => ticket.status === 'paid').length;
  });

  const hasSelectedSold = computed(() => {
    return selectedTickets.value.some(
      (ticket) => ticket.status === 'reserved' || ticket.status === 'paid',
    );
  });

  const selectedSoldCount = computed(() => {
    return selectedTickets.value.filter(
      (ticket) => ticket.status === 'reserved' || ticket.status === 'paid',
    ).length;
  });

  /**
   * Gestiona el click en un ticket según el modo activo.
   * @param ticket Ticket seleccionado
   */
  function handleTicketClick(ticket: Ticket) {
    if (isLocked.value) {
      // En modo bloqueado permitimos ver detalle de tickets vendidos/reservados, sin acciones.
      if (ticket.status === 'reserved' || ticket.status === 'paid') {
        onOpenDetailModal(ticket);
      }
      return;
    }

    if (multiSelectMode.value) {
      handleTicketSelect(ticket.number);
      return;
    }

    if (ticket.status === 'available') {
      onOpenSaleModal([ticket.number]);
      return;
    }

    if (authStore.isAdmin) {
      onOpenDetailModal(ticket);
    }
  }

  /**
   * Alterna la selección de un ticket en modo multi-selección.
   * @param ticketNumber Número del ticket a alternar
   */
  function handleTicketSelect(ticketNumber: number) {
    if (isLocked.value) {
      return;
    }

    if (selectedTicketNumbers.value.includes(ticketNumber)) {
      selectedTicketNumbers.value = selectedTicketNumbers.value.filter(
        (number) => number !== ticketNumber,
      );
    } else {
      selectedTicketNumbers.value = [...selectedTicketNumbers.value, ticketNumber];
    }
  }

  /**
   * Limpia cualquier selección y sale del modo multi-selección.
   */
  function clearSelection() {
    selectedTicketNumbers.value = [];
    multiSelectMode.value = false;
  }

  watch(multiSelectMode, (enabled) => {
    if (!enabled) {
      selectedTicketNumbers.value = [];
    }
  });

  watch(isLocked, (locked) => {
    if (locked) {
      clearSelection();
    }
  });

  /**
   * Actualiza el término de búsqueda por número de ticket.
   * @param value Valor introducido en el buscador
   */
  function onTicketSearch(value: string) {
    ticketNumberSearch.value = value;
  }

  /**
   * Activa o desactiva el modo multi-selección.
   * @param value Estado del toggle
   */
  function onMultiSelectToggle(value: boolean) {
    if (isLocked.value) {
      return;
    }
    multiSelectMode.value = value;
  }

  /**
   * Establece el filtro de estado y reinicia la selección.
   * @param status Estado a filtrar o null para todos
   */
  function setStatusFilter(status: string | null) {
    selectedStatusFilter.value = status;
    clearSelection();
  }

  /**
   * Solicita confirmación y aplica un cambio de estado masivo.
   * @param newStatus Nuevo estado objetivo
   */
  function confirmBulkChangeStatus(newStatus: Exclude<TicketStatus, 'available'>) {
    if (isLocked.value) {
      return;
    }

    const ticketsToChange = selectedTickets.value.filter((ticket) => {
      if (newStatus === 'paid') return ticket.status === 'reserved';
      if (newStatus === 'reserved') return ticket.status === 'paid';
      return false;
    });

    if (ticketsToChange.length === 0) return;

    const statusLabel = newStatus === 'paid' ? 'pagados' : 'reservados';
    $q.dialog({
      title: 'Confirmar cambio de estado',
      message: `¿Marcar ${ticketsToChange.length} ticket(s) como ${statusLabel}?`,
      ok: {
        label: 'Confirmar',
        color: newStatus === 'paid' ? 'green' : 'orange',
        flat: true,
      },
      cancel: {
        label: 'Cancelar',
        color: 'grey',
        flat: true,
      },
      dark: true,
    }).onOk(() => {
      void (async () => {
        try {
          await Promise.all(
            ticketsToChange.map((ticket) =>
              ticketsStore.updateTicket(ticket.id, { status: newStatus }),
            ),
          );
          $q.notify({
            type: 'positive',
            message: `${ticketsToChange.length} ticket(s) marcados como ${statusLabel}`,
          });
          clearSelection();
        } catch (error) {
          $q.notify({
            type: 'negative',
            message: 'Error al cambiar el estado de los tickets',
          });
          console.error(error);
        }
      })();
    });
  }

  /**
   * Solicita confirmación y libera en bloque los tickets seleccionados.
   */
  function confirmBulkRelease() {
    if (isLocked.value) {
      return;
    }

    const ticketsToRelease = selectedTickets.value.filter(
      (ticket) => ticket.status === 'reserved' || ticket.status === 'paid',
    );

    if (ticketsToRelease.length === 0) return;

    $q.dialog({
      title: 'Confirmar liberación',
      message:
        '¿Liberar ' +
        `${ticketsToRelease.length} ticket(s)? Esta acción desasignará los tickets de sus personas.`,
      ok: {
        label: 'Liberar',
        color: 'negative',
        flat: true,
      },
      cancel: {
        label: 'Cancelar',
        color: 'grey',
        flat: true,
      },
      dark: true,
    }).onOk(() => {
      void (async () => {
        try {
          await Promise.all(
            ticketsToRelease.map((ticket) => ticketsStore.releaseTicket(ticket.id)),
          );
          $q.notify({
            type: 'positive',
            message: `${ticketsToRelease.length} ticket(s) liberados correctamente`,
          });
          clearSelection();
        } catch (error) {
          $q.notify({
            type: 'negative',
            message: 'Error al liberar los tickets',
          });
          console.error(error);
        }
      })();
    });
  }

  return {
    isLocked,
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
  };
}
