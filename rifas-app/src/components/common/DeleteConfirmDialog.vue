<template>
  <q-dialog v-model="isOpen" persistent dark>
    <q-card dark style="min-width: 320px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Confirmar eliminación</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="cancel" />
      </q-card-section>

      <q-card-section>
        <div class="text-body2">{{ message }}</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="primary" @click="cancel" />
        <q-btn unelevated label="Eliminar" color="negative" :loading="loading" @click="confirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  message: string;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void | Promise<void>;
}>();

const isOpen = ref(false);
const loading = ref(false);

/**
 * Abre el diálogo de confirmación.
 */
function open() {
  isOpen.value = true;
  loading.value = false;
}

/**
 * Cierra el diálogo de confirmación.
 */
function close() {
  isOpen.value = false;
  loading.value = false;
}

/**
 * Maneja la confirmación y emite el evento.
 */
async function confirm() {
  loading.value = true;
  try {
    await emit('confirm');
    close();
  } catch {
    // El error ya se maneja en el componente padre
    loading.value = false;
  }
}

/**
 * Maneja la cancelación.
 */
function cancel() {
  close();
}

defineExpose({
  open,
  close,
});
</script>
