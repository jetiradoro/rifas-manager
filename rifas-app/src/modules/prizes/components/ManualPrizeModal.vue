<template>
  <q-card style="min-width: 450px">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Asignar premio manualmente</div>
      <q-space />
      <q-btn icon="close" flat round dense @click="emit('cancel')" />
    </q-card-section>

    <q-card-section>
      <div class="text-body2 text-grey-7 q-mb-md">
        Asigna un número de ticket específico a un premio. El ticket debe estar vendido.
      </div>

      <q-form @submit="handleSubmit">
        <!-- Selector de orden del premio -->
        <div class="q-mb-md">
          <label class="text-subtitle2 q-mb-xs block">Orden del premio</label>
          <q-select
            v-model="formData.prizeOrder"
            :options="prizeOrderOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            outlined
            dense
            :rules="[(val) => !!val || 'Selecciona un premio']"
          >
            <template #prepend>
              <q-icon name="emoji_events" />
            </template>
          </q-select>
        </div>

        <!-- Input de número de ticket -->
        <div class="q-mb-md">
          <label class="text-subtitle2 q-mb-xs block">Número de ticket ganador</label>
          <q-input
            v-model.number="formData.ticketNumber"
            type="number"
            outlined
            dense
            placeholder="Ej: 42"
            :rules="[
              (val) => !!val || 'El número de ticket es obligatorio',
              (val) => val > 0 || 'El número debe ser mayor a 0',
              (val) => val <= maxTicketNumber || `El número debe ser menor o igual a ${maxTicketNumber}`,
            ]"
          >
            <template #prepend>
              <q-icon name="confirmation_number" />
            </template>
          </q-input>
          <div class="text-caption text-grey-7 q-mt-xs">
            Rango válido: 1 - {{ maxTicketNumber }}
          </div>
        </div>

        <!-- Botones -->
        <div class="flex justify-end gap-2 q-mt-lg">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            @click="emit('cancel')"
          />
          <q-btn
            unelevated
            type="submit"
            label="Asignar premio"
            color="primary"
            :loading="loading"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

/**
 * Props del componente.
 */
interface Props {
  rifaId: number;
  maxTicketNumber: number;
  totalPrizes: number;
  assignedPrizeOrders: number[];
}

const props = defineProps<Props>();

/**
 * Emits del componente.
 */
const emit = defineEmits<{
  submit: [prizeOrder: number, ticketNumber: number];
  cancel: [];
}>();

const loading = ref(false);

/**
 * Datos del formulario.
 */
const formData = ref({
  prizeOrder: null as number | null,
  ticketNumber: null as number | null,
});

/**
 * Resetea el estado de loading del formulario.
 */
function resetLoading() {
  loading.value = false;
}

defineExpose({
  resetLoading,
});

/**
 * Opciones para el selector de orden del premio.
 */
const prizeOrderOptions = computed(() => {
  const options = [];
  for (let i = 1; i <= props.totalPrizes; i++) {
    // Solo mostrar premios que no han sido asignados
    if (!props.assignedPrizeOrders.includes(i)) {
      let label = '';
      if (i === 1) label = '1º Premio (Gordo)';
      else if (i === 2) label = '2º Premio';
      else if (i === 3) label = '3º Premio';
      else label = `${i}º Premio`;

      options.push({
        value: i,
        label,
      });
    }
  }
  return options;
});

/**
 * Maneja el envío del formulario.
 */
function handleSubmit() {
  if (formData.value.prizeOrder && formData.value.ticketNumber) {
    loading.value = true;
    emit('submit', formData.value.prizeOrder, formData.value.ticketNumber);
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

.block {
  display: block;
}
</style>
