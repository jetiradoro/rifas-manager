<template>
  <BaseButton
    color="primary"
    label="Guardar"
    icon="save"
    :loading="loading || false"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue';

interface Props {
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
