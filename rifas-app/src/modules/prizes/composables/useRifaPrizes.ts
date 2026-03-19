import { computed, ref, watch, type InjectionKey } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/modules/auth/stores/auth-store';
import { useTicketsStore } from 'src/modules/tickets/stores/tickets-store';
import { usePrizesStore, type Prize } from 'src/modules/prizes/stores/prizes-store';
import type { Rifa } from 'src/modules/rifas/stores/rifas-store';
import type SingleDrawAnimation from 'src/modules/prizes/components/SingleDrawAnimation.vue';
import type ManualPrizeModal from 'src/modules/prizes/components/ManualPrizeModal.vue';

type DrawComponent = InstanceType<typeof SingleDrawAnimation> | null;

interface UseRifaPrizesOptions {
  rifa: () => Rifa | null;
}

/**
 * Lógica de sorteos y estado de premios encapsulada para reutilizar en el panel.
 */
export function useRifaPrizes({ rifa }: UseRifaPrizesOptions) {
  const authStore = useAuthStore();
  const ticketsStore = useTicketsStore();
  const prizesStore = usePrizesStore();
  const $q = useQuasar();

  const drawRefs = ref<Record<number, DrawComponent>>({});
  const completedDraws = ref<Set<number>>(new Set());
  const initiallyDrawnPrizes = ref<Set<number>>(new Set());
  const pendingRevealPrizes = ref<Set<number>>(new Set());
  const activeDrawInProgress = ref<number | null>(null);
  const showWinnerModal = ref(false);
  const currentWinner = ref<Prize | null>(null);
  const showManualPrizeModal = ref(false);
  const manualPrizeModalRef = ref<InstanceType<typeof ManualPrizeModal> | null>(null);

  const isAdmin = computed(() => authStore.isAdmin);

  const canStartDrawing = computed(() => {
    const currentRifa = rifa();
    if (!currentRifa) return false;
    return ticketsStore.soldTicketsCount >= currentRifa.n_prizes;
  });

  const hasPrizes = computed(() => {
    if (activeDrawInProgress.value !== null) {
      return false;
    }
    return prizesStore.hasPrizes;
  });

  const hasPendingDraws = computed(() => {
    const currentRifa = rifa();
    if (!currentRifa) return false;
    for (let i = 1; i <= currentRifa.n_prizes; i++) {
      if (!isPrizeDrawn(i)) return true;
    }
    return false;
  });

  const assignedPrizeOrders = computed(() => {
    return prizesStore.prizes.map((prize) => prize.prizeOrder);
  });

  const canAssignManualPrize = computed(() => {
    const currentRifa = rifa();
    if (!currentRifa) return false;
    return assignedPrizeOrders.value.length < currentRifa.n_prizes;
  });

  /**
   * Marca los premios ya presentes en la base de datos al cargar la vista.
   */
  function syncInitiallyDrawnPrizes() {
    initiallyDrawnPrizes.value = new Set(prizesStore.prizes.map((prize) => prize.prizeOrder));
  }

  watch(
    () => prizesStore.prizes,
    () => {
      syncInitiallyDrawnPrizes();
    },
    { immediate: true },
  );

  /**
   * Determina si el premio ya está sorteado (persistido o en sesión actual).
   */
  function isPrizeDrawn(prizeOrder: number): boolean {
    if (completedDraws.value.has(prizeOrder)) {
      return true;
    }
    if (pendingRevealPrizes.value.has(prizeOrder)) {
      return false;
    }
    return initiallyDrawnPrizes.value.has(prizeOrder);
  }

  /**
   * Devuelve el nombre de premio por orden.
   */
  function getPrizeName(prizeNum: number): string | undefined {
    const currentRifa = rifa();
    if (!currentRifa?.prize_names) return undefined;
    const prizeNames = currentRifa.prize_names as unknown;
    if (Array.isArray(prizeNames) && prizeNames.length >= prizeNum) {
      return prizeNames[prizeNum - 1];
    }
    return undefined;
  }

  function getPrizeByOrder(order: number) {
    if (pendingRevealPrizes.value.has(order)) {
      return undefined;
    }
    return prizesStore.getPrizeByOrder(order);
  }

  function getPrizeLabel(order: number): string {
    if (order === 1) return '1º Premio (Gordo)';
    if (order === 2) return '2º Premio';
    if (order === 3) return '3º Premio';
    return `${order}º Premio`;
  }

  function getPrizeIcon(order: number): string {
    if (order === 1) return 'emoji_events';
    if (order === 2) return 'military_tech';
    if (order === 3) return 'workspace_premium';
    return 'stars';
  }

  function getPrizeColor(order: number): string {
    if (order === 1) return 'amber';
    if (order === 2) return 'grey-6';
    if (order === 3) return 'deep-orange';
    return 'primary';
  }

  function setDrawRef(prizeNum: number, el: unknown) {
    if (el && typeof el === 'object') {
      drawRefs.value[prizeNum] = el as DrawComponent;
    }
  }

  async function handleDrawStart(prizeOrder: number) {
    const currentRifa = rifa();
    if (!currentRifa) return;

    activeDrawInProgress.value = prizeOrder;
    pendingRevealPrizes.value.add(prizeOrder);

    try {
      const prize = await prizesStore.drawSinglePrize(currentRifa.id, prizeOrder);
      const drawComponent = drawRefs.value[prizeOrder];
      if (drawComponent && drawComponent.stopWithWinner) {
        drawComponent.stopWithWinner(prize.ticket.number);
      }
    } catch (error) {
      activeDrawInProgress.value = null;
      pendingRevealPrizes.value.delete(prizeOrder);
      const err = error as { response?: { data?: { message?: string } } };
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Error al realizar el sorteo',
      });
      console.error(error);
    }
  }

  function handleDrawComplete(prizeOrder: number, _winnerNumber: number) {
    void _winnerNumber;
    completedDraws.value.add(prizeOrder);
    pendingRevealPrizes.value.delete(prizeOrder);

    const prize = prizesStore.getPrizeByOrder(prizeOrder);
    if (prize) {
      currentWinner.value = prize;
      showWinnerModal.value = true;
    }
  }

  function closeWinnerModal() {
    showWinnerModal.value = false;
    currentWinner.value = null;
    activeDrawInProgress.value = null;
  }

  async function deletePrizes() {
    const currentRifa = rifa();
    if (!currentRifa) return;

    try {
      await prizesStore.removeAllPrizes(currentRifa.id);
      completedDraws.value.clear();
      initiallyDrawnPrizes.value.clear();
      $q.notify({
        type: 'positive',
        message: 'Premios eliminados correctamente',
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar los premios',
      });
      console.error(error);
    }
  }

  async function deleteSinglePrize(prizeId: number) {
    try {
      const prize = prizesStore.prizes.find((item) => item.id === prizeId);
      if (!prize) return;

      await prizesStore.removePrize(prizeId);
      completedDraws.value.delete(prize.prizeOrder);
      initiallyDrawnPrizes.value.delete(prize.prizeOrder);
      $q.notify({
        type: 'positive',
        message: 'Premio eliminado correctamente',
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar el premio',
      });
      console.error(error);
    }
  }

  function openManualPrizeModal() {
    showManualPrizeModal.value = true;
  }

  function closeManualPrizeModal() {
    showManualPrizeModal.value = false;
  }

  async function handleManualPrizeSubmit(prizeOrder: number, ticketNumber: number) {
    const currentRifa = rifa();
    if (!currentRifa) return;

    try {
      await prizesStore.createManualPrize(currentRifa.id, prizeOrder, ticketNumber);
      initiallyDrawnPrizes.value.add(prizeOrder);
      $q.notify({
        type: 'positive',
        message: `Premio ${prizeOrder} asignado correctamente al ticket #${ticketNumber}`,
      });
      closeManualPrizeModal();
      await ticketsStore.fetchTicketsByRifa(currentRifa.id);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      $q.notify({
        type: 'negative',
        message: err.response?.data?.message || 'Error al asignar el premio',
      });
      manualPrizeModalRef.value?.resetLoading();
      console.error(error);
    }
  }

  return {
    isAdmin,
    canStartDrawing,
    hasPrizes,
    hasPendingDraws,
    assignedPrizeOrders,
    canAssignManualPrize,
    drawRefs,
    completedDraws,
    initiallyDrawnPrizes,
    activeDrawInProgress,
    showWinnerModal,
    currentWinner,
    showManualPrizeModal,
    manualPrizeModalRef,
    syncInitiallyDrawnPrizes,
    isPrizeDrawn,
    getPrizeName,
    getPrizeByOrder,
    getPrizeLabel,
    getPrizeIcon,
    getPrizeColor,
    setDrawRef,
    handleDrawStart,
    handleDrawComplete,
    closeWinnerModal,
    deletePrizes,
    deleteSinglePrize,
    openManualPrizeModal,
    closeManualPrizeModal,
    handleManualPrizeSubmit,
  };
}

export type RifaPrizesContext = ReturnType<typeof useRifaPrizes>;

export const RIFA_PRIZES_KEY: InjectionKey<RifaPrizesContext> = Symbol('RifaPrizesContext');
