<template>
  <q-card flat bordered class="single-draw-card">
    <q-card-section class="text-center">
      <div class="text-h6 text-weight-bold q-mb-sm">
        {{ prizeLabel }}
      </div>
      <div v-if="prizeName" class="text-subtitle2 text-grey-7 q-mb-md">
        {{ prizeName }}
      </div>

      <!-- Número girando -->
      <div class="number-container q-my-lg">
        <div class="spinning-number" :class="{ spinning: isSpinning, stopped: isStopped }">
          {{ displayNumber }}
        </div>
      </div>

      <!-- Botón de sorteo -->
      <div v-if="!isSpinning && !isStopped" class="q-mt-md">
        <q-btn
          color="primary"
          unelevated
          size="lg"
          icon="casino"
          label="Sortear"
          :loading="loading"
          @click="startDraw"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

/**
 * Props del componente.
 */
interface Props {
  prizeOrder: number;
  prizeName?: string | undefined;
  maxTicketNumber: number;
  spinDuration?: number | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  spinDuration: 5000,
});

/**
 * Emits del componente.
 */
const emit = defineEmits<{
  draw: [];
  complete: [winnerNumber: number];
}>();

const isSpinning = ref(false);
const isStopped = ref(false);
const displayNumber = ref<number>(0);
const loading = ref(false);
let spinInterval: NodeJS.Timeout | null = null;
let stopTimeout: NodeJS.Timeout | null = null;

/**
 * Etiqueta del premio según su orden.
 */
const prizeLabel = computed(() => {
  if (props.prizeOrder === 1) return '1º Premio (Gordo)';
  if (props.prizeOrder === 2) return '2º Premio';
  if (props.prizeOrder === 3) return '3º Premio';
  return `${props.prizeOrder}º Premio`;
});

/**
 * Genera un número aleatorio para la animación.
 * @returns Número aleatorio
 */
function getRandomNumber(): number {
  return Math.floor(Math.random() * props.maxTicketNumber) + 1;
}

/**
 * Inicia el sorteo con animación.
 */
function startDraw() {
  loading.value = true;
  isSpinning.value = true;
  displayNumber.value = getRandomNumber();

  emit('draw');

  spinInterval = setInterval(() => {
    displayNumber.value = getRandomNumber();
  }, 50);

  loading.value = false;
}

/**
 * Detiene la animación y muestra el ganador.
 * @param winnerNumber Número ganador
 */
function stopWithWinner(winnerNumber: number) {
  const startTime = Date.now();
  console.log('[TIEMPO 0ms] stopWithWinner called with:', winnerNumber, 'spinDuration:', props.spinDuration);
  console.log('[TIEMPO 0ms] isSpinning:', isSpinning.value, 'spinInterval exists:', !!spinInterval);

  // Mantener girando durante spinDuration, luego detener
  stopTimeout = setTimeout(() => {
    const elapsed = Date.now() - startTime;
    console.log(`[TIEMPO ${elapsed}ms] Stopping animation - Target was ${props.spinDuration}ms`);
    if (spinInterval) {
      clearInterval(spinInterval);
      spinInterval = null;
    }

    displayNumber.value = winnerNumber;
    isSpinning.value = false;
    isStopped.value = true;

    // Esperar 500ms más antes de emitir complete para que se vea el número
    setTimeout(() => {
      const finalElapsed = Date.now() - startTime;
      console.log(`[TIEMPO ${finalElapsed}ms] Emitting complete event with winnerNumber:`, winnerNumber);
      emit('complete', winnerNumber);
    }, 500);
  }, props.spinDuration);

  console.log('[TIEMPO 0ms] setTimeout programado para', props.spinDuration, 'ms');
}

/**
 * Limpia los intervalos al desmontar el componente.
 */
onUnmounted(() => {
  if (spinInterval) {
    clearInterval(spinInterval);
  }
  if (stopTimeout) {
    clearTimeout(stopTimeout);
  }
});

defineExpose({
  stopWithWinner,
});
</script>

<style scoped>
.single-draw-card {
  max-width: 500px;
  margin: 0 auto;
}

.number-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
}

.spinning-number {
  font-size: 72px;
  font-weight: bold;
  color: #9e9e9e;
  padding: 24px 48px;
  border: 4px solid #e0e0e0;
  border-radius: 16px;
  background: #fafafa;
  min-width: 200px;
  text-align: center;
  transition: all 0.3s ease;
}

.spinning-number.spinning {
  color: var(--q-primary);
  border-color: var(--q-primary);
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  animation: shake 0.1s infinite;
}

.spinning-number.stopped {
  font-size: 96px;
  color: #1976d2;
  border-color: #1976d2;
  background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%);
  box-shadow: 0 12px 32px rgba(25, 118, 210, 0.3);
  animation: pulse-grow 0.5s ease-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateY(-2px);
  }
  50% {
    transform: translateY(2px);
  }
}

@keyframes pulse-grow {
  0% {
    transform: scale(0.95);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
