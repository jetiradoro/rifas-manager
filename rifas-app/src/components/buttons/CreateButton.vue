<template>
  <BaseButton color="primary" :label="label" icon="add" @click="handleClick" />
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue';

/**
 * Botón de crear/añadir con icono de suma.
 */
interface Props {
  label?: string;
}

withDefaults(defineProps<Props>(), {
  label: 'Crear',
});

const emit = defineEmits<{
  (e: 'click'): void;
}>();

function handleClick() {
  emit('click');
}
</script>
