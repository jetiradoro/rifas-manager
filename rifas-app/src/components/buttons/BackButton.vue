<template>
  <q-btn
    flat
    color="primary"
    label="Volver"
    icon="arrow_back"
    no-caps
    size="md"
    padding="8px 16px"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
/**
 * Botón para volver/regresar a la pantalla anterior.
 */
const emit = defineEmits<{
  (e: 'click'): void;
}>();

function handleClick() {
  emit('click');
}
</script>
