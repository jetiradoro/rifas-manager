<template>
  <q-btn
    flat
    color="primary"
    label="Cancelar"
    no-caps
    size="md"
    padding="8px 16px"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
/**
 * Botón de cancelar con estilo flat para diferenciarlo de acciones primarias.
 */
const emit = defineEmits<{
  (e: 'click'): void;
}>();

function handleClick() {
  emit('click');
}
</script>
