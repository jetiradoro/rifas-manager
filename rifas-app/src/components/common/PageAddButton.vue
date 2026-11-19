<template>
  <q-page-sticky v-if="isMobile" position="bottom" :offset="[0, 12]" expand>
    <div class="add-bar">
      <q-btn
        unelevated
        rounded
        color="primary"
        icon="add"
        :label="label"
        no-caps
        class="full-width add-bar-btn"
        @click="$emit('click')"
      />
    </div>
  </q-page-sticky>

  <q-page-sticky v-else position="bottom-right" :offset="[24, 18]">
    <q-btn
      unelevated
      rounded
      color="primary"
      icon="add"
      :label="label"
      no-caps
      class="add-btn-desktop"
      @click="$emit('click')"
    />
  </q-page-sticky>
</template>

<script setup lang="ts">
/**
 * Botón de acción principal de una página (crear nuevo elemento).
 * En móvil: barra a todo el ancho sobre el menú inferior.
 * En escritorio: botón con texto en la esquina inferior derecha.
 */
import { computed } from 'vue';
import { useQuasar } from 'quasar';

defineProps<{ label: string }>();

const $q = useQuasar();
const isMobile = computed(() => $q.screen.lt.md);
defineEmits<{ (e: 'click'): void }>();
</script>

<style scoped>
.add-bar {
  width: 100%;
  padding: 0 16px;
}

.add-bar-btn {
  min-height: 44px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.add-btn-desktop {
  padding: 4px 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>
