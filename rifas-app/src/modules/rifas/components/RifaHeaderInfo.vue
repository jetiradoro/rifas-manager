<template>
  <div class="q-mb-md">
    <div class="flex items-center justify-between q-mb-sm">
      <div class="flex items-center gap-2">
        <BackButton @click="$emit('back')" />
        <h1 class="text-h5 text-weight-bold q-my-none">{{ rifa.name }}</h1>
      </div>
    </div>

    <div class="rifa-info-cards">
      <q-card flat bordered>
        <q-card-section class="q-pa-sm">
          <div class="text-caption text-grey-7">Fecha del sorteo</div>
          <div class="text-body1 text-weight-medium">
            {{ formatDate(rifa.fecha) }}
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered>
        <q-card-section class="q-pa-sm">
          <div class="text-caption text-grey-7">Total tickets</div>
          <div class="text-body1 text-weight-medium">
            {{ rifa.n_tickets }}
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered>
        <q-card-section class="q-pa-sm">
          <div class="text-caption text-grey-7">Vendidos</div>
          <div class="text-body1 text-weight-medium text-positive">
            {{ soldTicketsCount }}
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered>
        <q-card-section class="q-pa-sm">
          <div class="text-caption text-grey-7">Disponibles</div>
          <div class="text-body1 text-weight-medium text-grey-8">
            {{ availableTicketsCount }}
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered>
        <q-card-section class="q-pa-sm">
          <div class="text-caption text-grey-7">Premios</div>
          <div class="text-body1 text-weight-medium">
            {{ rifa.n_prizes }}
          </div>
        </q-card-section>
      </q-card>
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
.rifa-info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}
</style>
