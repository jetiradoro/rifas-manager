<template>
  <q-card dark style="min-width: 320px; max-width: 480px; width: 100%">
    <q-card-section>
      <div class="text-h6">{{ title }}</div>
    </q-card-section>
    <q-separator />
    <q-card-section class="q-gutter-md">
      <q-input
        v-model="formModel.name"
        label="Nombre de la rifa"
        dense
        autofocus
        dark
        filled
        :rules="[(val) => !!val || 'El nombre es obligatorio']"
      />
      <q-input
        v-model.number="formModel.n_tickets"
        type="number"
        dense
        dark
        filled
        label="Número de tickets"
        :rules="[(val) => (!!val && val > 0) || 'Debe ser mayor a 0']"
      />
      <q-input
        v-model="formModel.fecha"
        type="datetime-local"
        dense
        dark
        filled
        label="Fecha del evento"
        :rules="[(val) => !!val || 'La fecha es obligatoria']"
      />
      <q-input
        v-model.number="formModel.n_prizes"
        type="number"
        :min="1"
        :max="5"
        dense
        dark
        filled
        label="Número de premios"
        :rules="[
          (val) => (!!val && val > 0) || 'Debe ser mayor a 0',
          (val) => val <= 5 || 'Máximo 5 premios',
        ]"
        @update:model-value="updatePrizeNamesArray"
        @keypress="preventOverFive"
      />

      <!-- Nombres de premios opcionales -->
      <div v-if="formModel.n_prizes > 0" class="q-mt-md">
        <div class="text-subtitle2 q-mb-sm">Nombres de premios (opcional)</div>
        <q-input
          v-for="i in formModel.n_prizes"
          :key="i"
          v-model="formModel.prize_names[i - 1]"
          :label="getPrizeLabel(i)"
          dense
          dark
          filled
          placeholder="Ej: Cesta de navidad, Vale de 50€, etc."
          class="q-mb-sm"
        >
          <template #prepend>
            <q-icon name="card_giftcard" />
          </template>
        </q-input>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-actions align="right">
      <q-btn flat label="Cancelar" color="primary" @click="onCancel" />
      <q-btn unelevated color="primary" label="Guardar" :loading="loading" @click="submit" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useQuasar } from 'quasar';
import dayjs from 'dayjs';
import { useRifasStore, type Rifa, type RifaPayload } from 'src/modules/rifas/stores/rifas-store';

interface FormModel {
  name: string;
  n_tickets: number;
  fecha: string;
  n_prizes: number;
  prize_names: string[];
}

const props = defineProps<{
  rifa?: Rifa | null;
}>();

const emit = defineEmits<{
  (e: 'saved'): void;
  (e: 'cancel'): void;
}>();

const rifasStore = useRifasStore();
const $q = useQuasar();

const formModel = reactive<FormModel>({
  name: '',
  n_tickets: 100,
  fecha: dayjs().format('YYYY-MM-DDTHH:mm'),
  n_prizes: 1,
  prize_names: [''],
});

const title = computed(() => (props.rifa ? 'Editar rifa' : 'Crear rifa'));
const loading = computed(() => rifasStore.loading);

watch(
  () => props.rifa,
  (val) => {
    if (val) {
      formModel.name = val.name;
      formModel.n_tickets = val.n_tickets;
      const clampedPrizes = Math.min(Math.max(val.n_prizes ?? 1, 1), 5);
      formModel.fecha = dayjs(val.fecha).format('YYYY-MM-DDTHH:mm');
      formModel.n_prizes = clampedPrizes;
      if (Array.isArray(val.prize_names)) {
        const names = [...val.prize_names].slice(0, clampedPrizes);
        if (names.length < clampedPrizes) {
          names.push(...Array(clampedPrizes - names.length).fill(''));
        }
        formModel.prize_names = names;
      } else {
        formModel.prize_names = Array(clampedPrizes).fill('');
      }
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

function resetForm() {
  formModel.name = '';
  formModel.n_tickets = 100;
  formModel.fecha = dayjs().format('YYYY-MM-DDTHH:mm');
  formModel.n_prizes = 1;
  formModel.prize_names = [''];
}

/**
 * Actualiza el array de nombres de premios cuando cambia el número de premios.
 * @param newCount Nuevo número de premios
 */
function updatePrizeNamesArray(newCount: string | number | null) {
  const parsed = typeof newCount === 'number' ? newCount : parseInt(String(newCount)) || 0;
  const count = Math.min(Math.max(parsed, 1), 5);
  if (parsed > 5) {
    $q.notify({ type: 'warning', message: 'Máximo 5 premios' });
  }
  formModel.n_prizes = count;
  const currentLength = formModel.prize_names.length;
  if (count > currentLength) {
    formModel.prize_names = [...formModel.prize_names, ...Array(count - currentLength).fill('')];
  } else if (count < currentLength) {
    formModel.prize_names = formModel.prize_names.slice(0, count);
  }
}

/**
 * Evita que el usuario escriba valores mayores a 5 en el input numérico.
 */
function preventOverFive(event: KeyboardEvent) {
  const key = event.key;
  if (!/^[0-9]$/.test(key)) return;
  const next = Number(key);
  if (next > 5) {
    $q.notify({ type: 'warning', message: 'Máximo 5 premios' });
    event.preventDefault();
  }
}

/**
 * Retorna la etiqueta del premio según su posición.
 * @param position Posición del premio (1-based)
 * @returns Etiqueta del premio
 */
function getPrizeLabel(position: number): string {
  if (position === 1) return '1º Premio (Gordo)';
  if (position === 2) return '2º Premio';
  if (position === 3) return '3º Premio';
  return `${position}º Premio`;
}

async function submit() {
  if (
    !formModel.name ||
    !formModel.fecha ||
    formModel.n_tickets <= 0 ||
    formModel.n_prizes <= 0 ||
    formModel.n_prizes > 5
  ) {
    $q.notify({ type: 'warning', message: 'Completa todos los campos obligatorios.' });
    return;
  }

  const prizeNames = formModel.prize_names.filter((name) => name.trim() !== '');

  const payload: RifaPayload = {
    name: formModel.name,
    n_tickets: formModel.n_tickets,
    fecha: dayjs(formModel.fecha).toISOString(),
    n_prizes: formModel.n_prizes,
  };

  if (prizeNames.length > 0) {
    payload.prize_names = prizeNames;
  }

  try {
    if (props.rifa) {
      await rifasStore.updateRifa(props.rifa.id, payload);
      $q.notify({ type: 'positive', message: 'Rifa actualizada' });
    } else {
      await rifasStore.createRifa(payload);
      $q.notify({ type: 'positive', message: 'Rifa creada' });
    }
    emit('saved');
    resetForm();
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) });
  }
}

function onCancel() {
  emit('cancel');
}

function getErrorMessage(error: unknown): string {
  const responseMessage = (
    error as {
      response?: { data?: { message?: string | string[] } };
      message?: string;
    }
  )?.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join(' ');
  }

  if (typeof responseMessage === 'string') {
    return responseMessage;
  }

  return (error as { message?: string })?.message || 'Error al procesar la solicitud.';
}
</script>
