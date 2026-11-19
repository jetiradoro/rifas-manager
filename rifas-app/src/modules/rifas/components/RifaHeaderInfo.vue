<template>
  <div class="q-mb-sm">
    <div class="flex items-center gap-2 q-mb-xs">
      <BackButton @click="$emit('back')" />
      <h1 class="rifa-title text-weight-bold q-my-none">{{ rifa.name }}</h1>
    </div>

    <div class="rifa-stats">
      <div class="stat-tile stat-date">
        <q-icon name="event" size="18px" class="text-grey-7" />
        <div>
          <div class="stat-value">{{ formatDate(rifa.fecha) }}</div>
          <div class="stat-label">Sorteo</div>
        </div>
      </div>
      <div class="stat-tile">
        <div class="stat-value">{{ rifa.n_tickets }}</div>
        <div class="stat-label">Números</div>
      </div>
      <div class="stat-tile">
        <div class="stat-value text-positive">{{ soldTicketsCount }}</div>
        <div class="stat-label">Vendidos</div>
      </div>
      <div class="stat-tile">
        <div class="stat-value">{{ availableTicketsCount }}</div>
        <div class="stat-label">Libres</div>
      </div>
      <div class="stat-tile">
        <div class="stat-value">{{ rifa.n_prizes }}</div>
        <div class="stat-label">Premios</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BackButton } from 'src/components/buttons';
import { formatDate } from 'src/utils/helpers';
import type { Rifa } from 'src/modules/rifas/stores/rifas-store';

defineProps<{
  rifa: Rifa;
  soldTicketsCount: number;
  availableTicketsCount: number;
}>();

defineEmits<{ (e: 'back'): void }>();
</script>

<style scoped>
.rifa-title {
  font-size: 1.25rem;
  line-height: 1.3;
}

/* Cuadrícula de mini-tarjetas: 4 columnas en móvil, una sola fila en pantallas anchas */
.rifa-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.stat-tile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6px 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.02);
  min-width: 0;
}

.stat-date {
  grid-column: 1 / -1;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.7rem;
  line-height: 1.2;
  color: #757575;
}

@media (min-width: 600px) {
  .rifa-stats {
    grid-template-columns: 2fr repeat(4, 1fr);
  }

  .stat-date {
    grid-column: auto;
  }
}
</style>
