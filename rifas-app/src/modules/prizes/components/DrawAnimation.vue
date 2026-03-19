<template>
  <q-card flat bordered class="draw-animation-card">
    <q-card-section class="text-center">
      <div class="text-h6 text-weight-bold q-mb-md">Sorteo en curso</div>

      <!-- Columnas de números girando -->
      <div class="slots-container">
        <div
          v-for="(prize, index) in prizes"
          :key="index"
          class="slot-column"
          :class="{ 'slot-stopped': stoppedColumns.includes(index) }"
        >
          <div class="slot-label text-caption text-grey-7 q-mb-xs">
            {{ getPrizeLabel(prizes.length - index) }}
          </div>
          <div class="slot-wrapper">
            <div v-if="!stoppedColumns.includes(index)" class="slot-spinning">
              <div v-for="n in visibleNumbers" :key="n" class="slot-number spinning">
                {{ currentNumbers[index] }}
              </div>
            </div>
            <div v-else class="slot-number revealed">
              {{ prize.ticket.number }}
            </div>
          </div>
          <div
            v-if="stoppedColumns.includes(index)"
            class="winner-name text-caption text-primary q-mt-xs"
          >
            {{ prize.person.name }} {{ prize.person.surname }}
          </div>
        </div>
      </div>

      <!-- Indicador de estado -->
      <div class="q-mt-md">
        <q-linear-progress
          v-if="animationState !== 'complete'"
          :value="progress"
          color="primary"
          size="8px"
          rounded
        />
        <div v-else class="text-positive text-weight-medium">¡Sorteo completado!</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Prize } from '../stores/prizes-store';

/**
 * Props del componente.
 */
interface Props {
  prizes: Prize[];
  spinDuration?: number;
  revealDelay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  spinDuration: 3000,
  revealDelay: 800,
});

/**
 * Emits del componente.
 */
const emit = defineEmits<{
  complete: [];
}>();

type AnimationState = 'idle' | 'spinning' | 'revealing' | 'complete';

const animationState = ref<AnimationState>('idle');
const stoppedColumns = ref<number[]>([]);
const currentNumbers = ref<number[]>([]);
const visibleNumbers = 3;
let spinInterval: NodeJS.Timeout | null = null;
let revealTimeout: NodeJS.Timeout | null = null;

/**
 * Progreso de la animación (0 a 1).
 */
const progress = computed(() => {
  if (animationState.value === 'idle') return 0;
  if (animationState.value === 'complete') return 1;
  return stoppedColumns.value.length / props.prizes.length;
});

/**
 * Obtiene la etiqueta del premio según su orden.
 * @param order Orden del premio (1=gordo, 2=segundo, etc)
 * @returns Etiqueta del premio
 */
function getPrizeLabel(order: number): string {
  if (order === 1) return '1º Premio (Gordo)';
  if (order === 2) return '2º Premio';
  if (order === 3) return '3º Premio';
  return `${order}º Premio`;
}

/**
 * Genera un número aleatorio para la animación.
 * @param maxNumber Número máximo de tickets
 * @returns Número aleatorio
 */
function getRandomNumber(maxNumber: number): number {
  return Math.floor(Math.random() * maxNumber) + 1;
}

/**
 * Inicia la animación del sorteo.
 */
function startAnimation() {
  animationState.value = 'spinning';

  // Inicializar números aleatorios para cada columna
  currentNumbers.value = props.prizes.map(() => getRandomNumber(999));

  // Intervalo para cambiar números rápidamente
  spinInterval = setInterval(() => {
    currentNumbers.value = currentNumbers.value.map((_, index) => {
      if (stoppedColumns.value.includes(index)) {
        const prize = props.prizes[index];
        return prize ? prize.ticket.number : 0;
      }
      return getRandomNumber(999);
    });
  }, 50);

  // Esperar duración del spin antes de empezar a revelar
  setTimeout(() => {
    revealPrizes();
  }, props.spinDuration);
}

/**
 * Revela los premios secuencialmente.
 */
function revealPrizes() {
  animationState.value = 'revealing';

  let currentColumn = 0;

  function revealNext() {
    if (currentColumn < props.prizes.length) {
      stoppedColumns.value.push(currentColumn);
      currentColumn++;

      if (currentColumn < props.prizes.length) {
        revealTimeout = setTimeout(revealNext, props.revealDelay);
      } else {
        completeAnimation();
      }
    }
  }

  revealNext();
}

/**
 * Completa la animación.
 */
function completeAnimation() {
  animationState.value = 'complete';
  if (spinInterval) {
    clearInterval(spinInterval);
    spinInterval = null;
  }
  emit('complete');
}

/**
 * Limpia los intervalos al desmontar el componente.
 */
onUnmounted(() => {
  if (spinInterval) {
    clearInterval(spinInterval);
  }
  if (revealTimeout) {
    clearTimeout(revealTimeout);
  }
});

onMounted(() => {
  startAnimation();
});
</script>

<style scoped>
.draw-animation-card {
  max-width: 800px;
  margin: 0 auto;
}

.slots-container {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.slot-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.slot-wrapper {
  width: 100px;
  height: 80px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.slot-stopped .slot-wrapper {
  border-color: var(--q-primary);
  background: #f5f5f5;
}

.slot-spinning {
  display: flex;
  flex-direction: column;
  animation: slide 0.1s linear infinite;
}

.slot-number {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  padding: 8px;
  color: #424242;
}

.slot-number.spinning {
  color: #9e9e9e;
}

.slot-number.revealed {
  color: var(--q-primary);
  font-size: 36px;
  animation: pop 0.3s ease-out;
}

.winner-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

@keyframes slide {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-40px);
  }
}

@keyframes pop {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
