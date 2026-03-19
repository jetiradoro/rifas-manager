<template>
  <q-btn
    :color="color"
    :icon="icon"
    :label="label"
    :loading="loading"
    unelevated
    no-caps
    size="md"
    padding="8px 16px"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
/**
 * Componente base de botón con diseño unificado.
 * Define tamaño, padding y estilo de forma centralizada y no modificable.
 */
interface Props {
  color: string;
  label?: string;
  icon?: string;
  loading?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

function handleClick() {
  emit('click');
}
</script>
