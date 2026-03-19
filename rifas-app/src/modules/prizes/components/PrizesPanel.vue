<template>
  <div v-if="rifa">
    <PrizesDrawSection v-if="isAdmin" class="q-mt-md" :rifa="rifa" />

    <q-card flat bordered class="q-mt-md">
      <q-card-section>
        <div v-if="isAdmin" class="flex items-center justify-between q-mb-md">
          <div class="text-h6 text-weight-bold">Estado de los Premios</div>
          <div class="flex items-center gap-2">
            <q-btn
              v-if="canAssignManualPrize"
              unelevated
              color="secondary"
              icon="add"
              label="Asignar premio manualmente"
              size="sm"
              @click="openManualPrizeModal"
            />
            <DeleteButton
              v-if="hasPrizes"
              label="Borrar todos"
              size="sm"
              @click="openDeleteAllDialog"
            />
          </div>
        </div>

        <q-separator class="q-mb-md" />

        <div class="prizes-status-container">
          <div v-for="prizeNum in rifa.n_prizes" :key="prizeNum" class="prize-status-item">
            <q-card
              flat
              bordered
              :class="[
                'prize-status-card',
                getPrizeByOrder(prizeNum) ? 'prize-drawn' : 'prize-pending',
              ]"
            >
              <q-card-section class="q-pa-md prize-card-content">
                <div class="flex items-start gap-3">
                  <div class="prize-icon-container">
                    <q-icon
                      :name="getPrizeIcon(prizeNum)"
                      :color="getPrizeColor(prizeNum)"
                      size="32px"
                    />
                  </div>

                  <div class="flex-1">
                    <div class="text-subtitle2 text-weight-bold q-mb-xs">
                      {{ getPrizeLabel(prizeNum) }}
                    </div>

                    <div v-if="getPrizeByOrder(prizeNum)">
                      <div class="flex items-center gap-2 q-mb-xs">
                        <q-chip
                          outline
                          size="lg"
                          color="primary"
                          text-color="primary"
                          icon="confirmation_number"
                          class="text-weight-bold text-h6 prize-ticket-chip"
                        >
                          Ticket #{{ getPrizeByOrder(prizeNum)!.ticket.number }}
                        </q-chip>
                      </div>
                      <div class="text-body2">
                        <q-icon name="person" size="16px" class="q-mr-xs" />
                        {{ getPrizeByOrder(prizeNum)!.person.name }}
                        {{ getPrizeByOrder(prizeNum)!.person.surname }}
                      </div>
                      <div v-if="isAdmin">
                        <div
                          v-if="getPrizeByOrder(prizeNum)!.person.phone"
                          class="text-caption text-grey-7"
                        >
                          <q-icon name="phone" size="14px" class="q-mr-xs" />
                          {{ getPrizeByOrder(prizeNum)!.person.phone }}
                        </div>
                        <div
                          v-if="getPrizeByOrder(prizeNum)!.person.email"
                          class="text-caption text-grey-7"
                        >
                          <q-icon name="email" size="14px" class="q-mr-xs" />
                          {{ getPrizeByOrder(prizeNum)!.person.email }}
                        </div>
                      </div>
                    </div>

                    <div v-else class="text-grey-6 q-py-sm">
                      <q-icon name="schedule" size="18px" class="q-mr-xs" />
                      Pendiente de sorteo
                    </div>
                  </div>
                </div>

                <div v-if="getPrizeByOrder(prizeNum) && isAdmin" class="prize-delete-btn-corner">
                  <q-btn
                    outline
                    round
                    size="sm"
                    color="negative"
                    icon="delete"
                    @click="openDeleteSingleDialog(getPrizeByOrder(prizeNum)!.id)"
                  >
                    <q-tooltip>Eliminar este premio</q-tooltip>
                  </q-btn>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showWinnerModal" persistent>
      <WinnerModal v-if="currentWinner" :prize="currentWinner" @close="closeWinnerModal" />
    </q-dialog>

    <q-dialog v-model="showManualPrizeModal" persistent>
      <ManualPrizeModal
        v-if="rifa"
        ref="manualPrizeModalRef"
        :rifa-id="rifa.id"
        :max-ticket-number="rifa.n_tickets"
        :total-prizes="rifa.n_prizes"
        :assigned-prize-orders="assignedPrizeOrders"
        @submit="handleManualPrizeSubmit"
        @cancel="closeManualPrizeModal"
      />
    </q-dialog>

    <DeleteConfirmDialog
      ref="deleteAllDialog"
      message="¿Estás seguro de borrar todos los premios? Esta acción no se puede deshacer."
      @confirm="confirmDeleteAll"
    />

    <DeleteConfirmDialog
      ref="deleteSingleDialog"
      :message="singleDeleteMessage"
      @confirm="confirmDeleteSingle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref } from 'vue';
import { usePrizesStore } from 'src/modules/prizes/stores/prizes-store';
import WinnerModal from 'src/modules/prizes/components/WinnerModal.vue';
import ManualPrizeModal from 'src/modules/prizes/components/ManualPrizeModal.vue';
import { RIFA_PRIZES_KEY, useRifaPrizes } from 'src/modules/prizes/composables/useRifaPrizes';
import { DeleteButton } from 'src/components/buttons';
import DeleteConfirmDialog from 'src/components/common/DeleteConfirmDialog.vue';
import PrizesDrawSection from 'src/modules/prizes/components/PrizesDrawSection.vue';
import type { Rifa } from 'src/modules/rifas/stores/rifas-store';

const props = defineProps<{ rifa: Rifa }>();

const prizesStore = usePrizesStore();
const deleteAllDialog = ref<InstanceType<typeof DeleteConfirmDialog> | null>(null);
const deleteSingleDialog = ref<InstanceType<typeof DeleteConfirmDialog> | null>(null);
const prizeIdToDelete = ref<number | null>(null);

const prizesContext = useRifaPrizes({ rifa: () => props.rifa });
provide(RIFA_PRIZES_KEY, prizesContext);

const {
  isAdmin,
  hasPrizes,
  assignedPrizeOrders,
  canAssignManualPrize,
  showWinnerModal,
  currentWinner,
  showManualPrizeModal,
  manualPrizeModalRef,
  syncInitiallyDrawnPrizes,
  getPrizeByOrder,
  getPrizeLabel,
  getPrizeIcon,
  getPrizeColor,
  closeWinnerModal,
  deletePrizes,
  deleteSinglePrize,
  openManualPrizeModal,
  closeManualPrizeModal,
  handleManualPrizeSubmit,
} = prizesContext;

const singleDeleteMessage = computed(() => {
  const prize = prizesStore.prizes.find((item) => item.id === prizeIdToDelete.value);
  if (!prize) {
    return '¿Eliminar este premio? Esta acción no se puede deshacer.';
  }
  return `¿Eliminar el ${getPrizeLabel(prize.prizeOrder)}? Esta acción no se puede deshacer.`;
});

onMounted(() => {
  syncInitiallyDrawnPrizes();
});

function openDeleteAllDialog() {
  deleteAllDialog.value?.open();
}

async function confirmDeleteAll() {
  await deletePrizes();
}

function openDeleteSingleDialog(prizeId: number) {
  prizeIdToDelete.value = prizeId;
  deleteSingleDialog.value?.open();
}

async function confirmDeleteSingle() {
  if (prizeIdToDelete.value === null) return;
  await deleteSinglePrize(prizeIdToDelete.value);
  prizeIdToDelete.value = null;
}
</script>
