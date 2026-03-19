<template>
  <q-btn
    flat
    color="primary"
    label="Editar"
    icon="edit"
    no-caps
    size="md"
    padding="8px 16px"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
/**
 * Botón de editar con estilo flat e icono.
 */
const emit = defineEmits<{
  (e: 'click'): void;
}>();

function handleClick() {
  emit('click');
}
</script>
