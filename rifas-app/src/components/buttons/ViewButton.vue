<template>
  <q-btn
    flat
    color="primary"
    label="Ver detalle"
    icon="visibility"
    no-caps
    size="md"
    padding="8px 16px"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
/**
 * Botón para ver detalles de un elemento.
 */
const emit = defineEmits<{
  (e: 'click'): void;
}>();

function handleClick() {
  emit('click');
}
</script>
