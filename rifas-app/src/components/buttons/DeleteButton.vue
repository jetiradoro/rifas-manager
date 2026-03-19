<template>
  <q-btn
    flat
    color="negative"
    label="Eliminar"
    icon="delete"
    no-caps
    size="md"
    padding="8px 16px"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
/**
 * Botón de eliminar con color negative (rojo).
 */
const emit = defineEmits<{
  (e: 'click'): void;
}>();

function handleClick() {
  emit('click');
}
</script>
