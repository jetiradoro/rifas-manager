<template>
  <q-card dark style="min-width: 400px; max-width: 500px; width: 100%">
    <q-card-section>
      <div class="text-h6">Detalle del Ticket #{{ ticket.number }}</div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <div class="q-gutter-sm">
        <!-- Estado -->
        <div class="detail-row">
          <span class="detail-label">Estado:</span>
          <q-badge :color="statusConfig.color" :label="statusConfig.label">
            <q-icon
              v-if="statusConfig.icon"
              :name="statusConfig.icon"
              size="14px"
              class="q-ml-xs"
            />
          </q-badge>
        </div>

        <!-- Persona asignada -->
        <div v-if="ticket.person" class="detail-section">
          <div class="flex items-center justify-between q-mb-sm">
            <div class="text-subtitle2 text-weight-bold">Persona asignada</div>
            <q-btn
              flat
              dense
              color="primary"
              icon="open_in_new"
              size="sm"
              label="Ver perfil"
              @click="navigateToPerson"
            />
          </div>
          <div class="detail-row">
            <span class="detail-label">Nombre:</span>
            <span>{{ ticket.person.name }} {{ ticket.person.surname }}</span>
          </div>
          <div v-if="ticket.person.email" class="detail-row">
            <span class="detail-label">Email:</span>
            <span>{{ ticket.person.email }}</span>
          </div>
          <div v-if="ticket.person.phone" class="detail-row">
            <span class="detail-label">Teléfono:</span>
            <span>{{ ticket.person.phone }}</span>
          </div>
        </div>

        <!-- Observaciones -->
        <div v-if="ticket.observations" class="detail-section">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">Observaciones</div>
          <div class="text-body2">{{ ticket.observations }}</div>
        </div>

        <!-- Fechas -->
        <div class="detail-section">
          <div class="detail-row">
            <span class="detail-label">Creado:</span>
            <span>{{ formatDate(ticket.createdAt) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Actualizado:</span>
            <span>{{ formatDate(ticket.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
      <!-- Cambiar a Reservado (solo si está pagado) -->
      <q-btn
        v-if="ticket.status === 'paid'"
        flat
        color="orange"
        label="Pasar a Reservado"
        icon="schedule"
        :loading="changingStatus"
        :disable="readonly"
        @click="confirmChangeStatus('reserved')"
      />
      <!-- Cambiar a Pagado (solo si está reservado) -->
      <q-btn
        v-if="ticket.status === 'reserved'"
        flat
        color="green"
        label="Marcar Pagado"
        icon="paid"
        :loading="changingStatus"
        :disable="readonly"
        @click="confirmChangeStatus('paid')"
      />
      <!-- Liberar ticket -->
      <q-btn
        v-if="canRelease"
        flat
        color="negative"
        label="Liberar"
        icon="remove_circle"
        :loading="releasing"
        :disable="readonly"
        @click="confirmRelease"
      />
      <q-btn flat color="primary" label="Cerrar" @click="onClose" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, withDefaults } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import type { Ticket } from 'src/modules/tickets/stores/tickets-store';
import { getTicketStatusConfig } from 'src/modules/tickets/constants/ticket-status';
import { formatDateTime } from 'src/utils/helpers';

interface Props {
  ticket: Ticket;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
});

const emit = defineEmits<{
  close: [];
  release: [ticketId: number];
  changeStatus: [ticketId: number, newStatus: 'reserved' | 'paid'];
}>();

const $q = useQuasar();
const router = useRouter();
const releasing = ref(false);
const changingStatus = ref(false);

const statusConfig = computed(() => getTicketStatusConfig(props.ticket.status));

/**
 * Determina si el ticket se puede liberar.
 */
const canRelease = computed(() => {
  return props.ticket.status === 'reserved' || props.ticket.status === 'paid';
});

/**
 * Formatea una fecha usando la función helper.
 * @param isoDate Fecha en formato ISO
 */
function formatDate(isoDate: string): string {
  return formatDateTime(isoDate);
}

/**
 * Solicita confirmación para liberar el ticket.
 */
function confirmRelease() {
  $q.dialog({
    title: 'Confirmar liberación',
    message: `¿Estás seguro de que quieres liberar el ticket #${props.ticket.number}?`,
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
    emit('release', props.ticket.id);
  });
}

/**
 * Solicita confirmación para cambiar el estado del ticket.
 * @param newStatus Nuevo estado del ticket
 */
function confirmChangeStatus(newStatus: 'reserved' | 'paid') {
  const statusLabel = newStatus === 'paid' ? 'Pagado' : 'Reservado';
  $q.dialog({
    title: 'Confirmar cambio de estado',
    message: `¿Cambiar el ticket #${props.ticket.number} a "${statusLabel}"?`,
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
    emit('changeStatus', props.ticket.id, newStatus);
  });
}

/**
 * Cierra el modal.
 */
function onClose() {
  emit('close');
}

/**
 * Navega al perfil de la persona asignada.
 */
function navigateToPerson() {
  if (props.ticket.person?.id) {
    emit('close');
    void router.push({ name: 'person-detail', params: { id: props.ticket.person.id } });
  }
}
</script>

<style scoped>
.detail-section {
  margin-top: 16px;
}

.detail-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.detail-label {
  font-weight: 500;
  min-width: 100px;
  color: rgba(255, 255, 255, 0.7);
}
</style>
