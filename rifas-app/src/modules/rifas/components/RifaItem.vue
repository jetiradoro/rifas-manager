<template>
  <q-card class="q-mb-md" flat bordered>
    <q-card-section class="q-pa-md">
      <div
        class="text-h6 text-weight-bold ellipsis text-primary cursor-pointer"
        @click="emitViewDetail"
      >
        {{ rifa.name }}
      </div>
      <div class="text-caption text-grey-7 q-mt-xs row items-center q-gutter-xs">
        <q-icon name="event" size="16px" />
        <span>{{ rifa.fecha }}</span>
      </div>

      <div class="q-mt-sm column q-gutter-xs">
        <div class="row items-center q-gutter-sm wrap">
          <q-chip size="sm" color="primary" text-color="white" icon="confirmation_number">
            {{ rifa.n_tickets }} tickets
          </q-chip>
          <q-chip size="sm" color="deep-orange" text-color="white" icon="emoji_events">
            {{ rifa.n_prizes }} premios
          </q-chip>
        </div>

        <div class="winners-block" aria-label="premiados">
          <div class="text-caption text-grey-7 text-uppercase">Premiados</div>
          <div class="winners-row" v-if="sortedWinners.length">
            <div v-for="winner in sortedWinners" :key="winner.id" class="winner-chip">
              <div class="winner-main">
                <q-icon name="emoji_events" size="14px" class="text-amber" />
                <span class="text-body2 text-weight-medium ellipsis">
                  {{ winner.person.name }} {{ winner.person.surname }}
                </span>
              </div>
              <div class="winner-sub text-caption text-grey-7">
                {{ getPrizeLabel(winner.prizeOrder) }} · Ticket {{ winner.ticket.number }}
              </div>
            </div>
          </div>
          <div v-else class="text-caption text-grey-6">Aún sin premiados</div>
        </div>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-actions v-if="isAdmin" align="right">
      <EditButton @click="emitEdit" />
      <DeleteButton @click="openDeleteDialog" />
    </q-card-actions>
  </q-card>

  <DeleteConfirmDialog ref="deleteDialog" :message="deleteMessage" @confirm="handleDelete" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRifasStore, type Rifa } from 'src/modules/rifas/stores/rifas-store';
import DeleteConfirmDialog from 'src/components/common/DeleteConfirmDialog.vue';
import { EditButton, DeleteButton } from 'src/components/buttons';
import { useAuthStore } from 'src/modules/auth/stores/auth-store';

const authStore = useAuthStore();

const isAdmin = computed(() => authStore.isAdmin);

const props = defineProps<{
  rifa: Rifa;
}>();

const emit = defineEmits<{
  (e: 'edit', value: Rifa): void;
  (e: 'viewDetail', value: Rifa): void;
}>();

const rifasStore = useRifasStore();
const $q = useQuasar();
const deleteDialog = ref<InstanceType<typeof DeleteConfirmDialog> | null>(null);

const winners = computed(() => props.rifa.prizes ?? []);
const sortedWinners = computed(() =>
  [...winners.value].sort((a, b) => a.prizeOrder - b.prizeOrder),
);

function getPrizeLabel(order: number) {
  if (order === 1) return '1.º premio';
  if (order === 2) return '2.º premio';
  if (order === 3) return '3.º premio';
  return `${order}.º premio`;
}

/**
 * Mensaje de confirmación de eliminación.
 */
const deleteMessage = computed(() => `¿Estás seguro de eliminar la rifa "${props.rifa.name}"?`);

/**
 * Emite evento de edición.
 */
function emitEdit() {
  emit('edit', props.rifa);
}

/**
 * Emite evento de ver detalle.
 */
function emitViewDetail() {
  emit('viewDetail', props.rifa);
}

/**
 * Abre el diálogo de confirmación de eliminación.
 */
function openDeleteDialog() {
  deleteDialog.value?.open();
}

/**
 * Maneja la eliminación de la rifa.
 */
async function handleDelete() {
  try {
    await rifasStore.deleteRifa(props.rifa.id);
    $q.notify({ type: 'positive', message: 'Rifa eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting rifa:', error);
    // Error ya notificado por el interceptor global de axios
  }
}
</script>

<style scoped>
.winners-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.winners-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.winner-chip {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background-color: #fafafa;
  max-width: 100%;
}

.winner-main {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.winner-main span,
.winner-sub {
  white-space: nowrap;
}

@media (max-width: 640px) {
  .winners-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .winner-chip {
    width: 100%;
  }

  .winner-main span,
  .winner-sub {
    white-space: normal;
  }
}
</style>
