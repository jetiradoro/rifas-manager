<template>
  <q-card flat bordered class="prize-list-card">
    <q-card-section>
      <div class="flex items-center justify-between q-mb-md">
        <div class="text-h6 text-weight-bold">Ganadores</div>
        <DeleteButton v-if="showDeleteButton" label="Borrar premios" @click="handleDelete" />
      </div>

      <q-separator class="q-mb-md" />

      <!-- Lista de premios -->
      <div v-if="prizes.length > 0" class="prizes-container">
        <div v-for="prize in sortedPrizes" :key="prize.id" class="prize-item">
          <q-card flat bordered class="prize-card">
            <q-card-section class="q-pa-md prize-card-content">
              <div class="flex items-start gap-3">
                <!-- Icono del premio -->
                <div class="prize-icon-container">
                  <q-icon
                    :name="getPrizeIcon(prize.prizeOrder)"
                    :color="getPrizeColor(prize.prizeOrder)"
                    size="32px"
                  />
                </div>

                <!-- Información del premio -->
                <div class="flex-1">
                  <div class="text-subtitle2 text-weight-bold q-mb-xs">
                    {{ getPrizeLabel(prize.prizeOrder) }}
                  </div>
                  <div class="flex items-center gap-2 q-mb-xs">
                    <q-chip
                      outline
                      dense
                      size="lg"
                      color="primary"
                      text-color="white"
                      icon="confirmation_number"
                      class="text-weight-bold text-h6 prize-ticket-chip"
                    >
                      Ticket #{{ prize.ticket.number }}
                    </q-chip>
                  </div>
                  <div class="text-body2">
                    <q-icon name="person" size="16px" class="q-mr-xs" />
                    {{ prize.person.name }} {{ prize.person.surname }}
                  </div>
                  <div v-if="prize.person.phone" class="text-caption text-grey-7">
                    <q-icon name="phone" size="14px" class="q-mr-xs" />
                    {{ prize.person.phone }}
                  </div>
                  <div v-if="prize.person.email" class="text-caption text-grey-7">
                    <q-icon name="email" size="14px" class="q-mr-xs" />
                    {{ prize.person.email }}
                  </div>
                </div>
              </div>

              <!-- Botón eliminar individual en esquina inferior derecha -->
              <div class="prize-delete-btn-corner">
                <q-btn
                  outline
                  round
                  size="sm"
                  color="negative"
                  icon="delete"
                  @click="handleDeleteSingle(prize)"
                >
                  <q-tooltip>Eliminar este premio</q-tooltip>
                </q-btn>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="text-center q-py-md text-grey-7">
        <q-icon name="emoji_events" size="48px" class="q-mb-sm" />
        <div>No hay ganadores aún</div>
      </div>
    </q-card-section>
  </q-card>

  <!-- Modal de confirmación para eliminar todos -->
  <DeleteConfirmDialog
    v-if="showDeleteDialog"
    v-model="showDeleteDialog"
    message="¿Estás seguro de que deseas borrar todos los premios? Esta acción no se puede deshacer."
    @confirm="confirmDelete"
  />

  <!-- Modal de confirmación para eliminar individual -->
  <DeleteConfirmDialog
    v-if="showDeleteSingleDialog"
    v-model="showDeleteSingleDialog"
    :message="`¿Estás seguro de que deseas eliminar el ${prizeToDelete ? getPrizeLabel(prizeToDelete.prizeOrder) : 'premio'}? Esta acción no se puede deshacer.`"
    @confirm="confirmDeleteSingle"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Prize } from '../stores/prizes-store';
import { DeleteButton } from 'src/components/buttons';
import DeleteConfirmDialog from 'src/components/common/DeleteConfirmDialog.vue';

/**
 * Props del componente.
 */
interface Props {
  prizes: Prize[];
  showDeleteButton?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDeleteButton: true,
});

/**
 * Emits del componente.
 */
const emit = defineEmits<{
  delete: [];
  deleteSingle: [prizeId: number];
}>();

const showDeleteDialog = ref(false);
const showDeleteSingleDialog = ref(false);
const prizeToDelete = ref<Prize | null>(null);

/**
 * Lista de premios ordenada por prizeOrder.
 */
const sortedPrizes = computed(() => {
  return [...props.prizes].sort((a, b) => a.prizeOrder - b.prizeOrder);
});

/**
 * Obtiene la etiqueta del premio según su orden.
 * @param order Orden del premio (1=gordo, 2=segundo, etc)
 * @returns Etiqueta del premio
 */
function getPrizeLabel(order: number): string {
  if (order === 1) return '1º Premio (Gordo)';
  if (order === 2) return '2º Premio';
  if (order === 3) return '3º Premio';
  return `${order}º Premio`;
}

/**
 * Obtiene el icono del premio según su orden.
 * @param order Orden del premio
 * @returns Nombre del icono
 */
function getPrizeIcon(order: number): string {
  if (order === 1) return 'emoji_events';
  if (order === 2) return 'military_tech';
  if (order === 3) return 'workspace_premium';
  return 'stars';
}

/**
 * Obtiene el color del premio según su orden.
 * @param order Orden del premio
 * @returns Color del premio
 */
function getPrizeColor(order: number): string {
  if (order === 1) return 'amber';
  if (order === 2) return 'grey-6';
  if (order === 3) return 'deep-orange';
  return 'primary';
}

/**
 * Maneja el click en el botón de eliminar todos.
 */
function handleDelete() {
  showDeleteDialog.value = true;
}

/**
 * Confirma la eliminación de todos los premios.
 */
function confirmDelete() {
  emit('delete');
  showDeleteDialog.value = false;
}

/**
 * Maneja el click en el botón de eliminar un premio individual.
 * @param prize Premio a eliminar
 */
function handleDeleteSingle(prize: Prize) {
  prizeToDelete.value = prize;
  showDeleteSingleDialog.value = true;
}

/**
 * Confirma la eliminación de un premio individual.
 */
function confirmDeleteSingle() {
  if (prizeToDelete.value) {
    emit('deleteSingle', prizeToDelete.value.id);
  }
  showDeleteSingleDialog.value = false;
  prizeToDelete.value = null;
}
</script>
