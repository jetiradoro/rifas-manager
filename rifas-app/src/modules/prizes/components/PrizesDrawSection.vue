<template>
  <q-card v-if="isAdmin" flat bordered class="q-mt-md">
    <q-expansion-item
      :label="`Realizar Sorteos (${prizesCount}/${rifa.n_prizes})`"
      icon="casino"
      header-class="text-h6 text-weight-bold"
    >
      <template #header>
        <q-item-section avatar>
          <q-icon name="casino" color="primary" size="32px" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-h6 text-weight-bold">Realizar Sorteos</q-item-label>
          <q-item-label caption>
            {{ prizesCount }} de {{ rifa.n_prizes }} premios sorteados
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge
            :color="prizesCount === rifa.n_prizes ? 'positive' : 'grey-6'"
            :label="`${prizesCount}/${rifa.n_prizes}`"
          />
        </q-item-section>
      </template>

      <q-card-section>
        <q-card v-if="!canStartDrawing" flat bordered class="q-mb-md">
          <q-card-section class="text-center">
            <div class="q-mb-md">
              <q-icon name="info" size="48px" class="text-grey-6" />
            </div>
            <div class="text-subtitle2 text-weight-medium q-mb-sm">Sorteo no disponible</div>
            <div class="text-caption text-grey-7">
              {{
                soldTicketsCount < rifa.n_prizes
                  ? `Se necesitan al menos ${rifa.n_prizes} tickets vendidos (actualmente: ${soldTicketsCount})`
                  : 'Todos los premios han sido sorteados'
              }}
            </div>
          </q-card-section>
        </q-card>

        <div v-if="canStartDrawing && hasPendingDraws" class="prizes-container">
          <div v-for="prizeNum in rifa.n_prizes" :key="prizeNum" class="q-mb-md">
            <div v-if="!isPrizeDrawn(prizeNum)">
              <SingleDrawAnimation
                :ref="(el) => setDrawRef(prizeNum, el)"
                :prize-order="prizeNum"
                :prize-name="getPrizeName(prizeNum)"
                :max-ticket-number="rifa.n_tickets"
                @draw="handleDrawStart(prizeNum)"
                @complete="(winnerNumber) => handleDrawComplete(prizeNum, winnerNumber)"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-expansion-item>
  </q-card>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import SingleDrawAnimation from 'src/modules/prizes/components/SingleDrawAnimation.vue';
import {
  RIFA_PRIZES_KEY,
  useRifaPrizes,
  type RifaPrizesContext,
} from 'src/modules/prizes/composables/useRifaPrizes';
import { usePrizesStore } from 'src/modules/prizes/stores/prizes-store';
import { useTicketsStore } from 'src/modules/tickets/stores/tickets-store';
import type { Rifa } from 'src/modules/rifas/stores/rifas-store';

const props = defineProps<{
  rifa: Rifa;
}>();

const prizesStore = usePrizesStore();
const ticketsStore = useTicketsStore();
const injectedContext = inject<RifaPrizesContext | null>(RIFA_PRIZES_KEY, null);
const prizesContext =
  injectedContext ??
  useRifaPrizes({
    rifa: () => props.rifa,
  });

const {
  isAdmin,
  canStartDrawing,
  hasPendingDraws,
  isPrizeDrawn,
  getPrizeName,
  setDrawRef,
  handleDrawStart,
  handleDrawComplete,
} = prizesContext;

const prizesCount = computed(() => prizesStore.prizes.length);
const soldTicketsCount = computed(() => ticketsStore.soldTicketsCount);
</script>
