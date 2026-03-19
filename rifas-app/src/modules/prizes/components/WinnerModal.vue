<template>
  <q-card class="winner-modal">
    <!-- Botón de cerrar en la esquina superior derecha -->
    <q-btn
      flat
      dense
      round
      icon="close"
      class="close-button"
      @click="emit('close')"
    />

    <q-card-section class="text-center winner-content">
      <!-- Confeti animado -->
      <div class="confetti-container">
        <div v-for="i in 50" :key="i" class="confetti" :style="getConfettiStyle()" />
      </div>

      <!-- Icono de trofeo -->
      <div class="trophy-icon q-mb-md">
        <q-icon name="emoji_events" size="120px" class="trophy-bounce" />
      </div>

      <!-- Nombre del premio -->
      <div class="prize-title q-mb-sm">
        {{ prizeLabel }}
      </div>

      <div v-if="prizeName" class="prize-name q-mb-lg">
        {{ prizeName }}
      </div>

      <!-- Número premiado gigante -->
      <div class="winning-number q-mb-md">
        {{ prize.ticket.number }}
      </div>

      <!-- Felicitaciones -->
      <div class="congratulations-text q-mb-sm">¡FELICIDADES!</div>

      <!-- Nombre del ganador -->
      <div class="winner-name">{{ prize.person.name }} {{ prize.person.surname }}</div>

      <!-- Botón de cerrar -->
      <div class="q-mt-xl">
        <q-btn color="primary" unelevated size="lg" label="Cerrar" @click="emit('close')" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Prize } from '../stores/prizes-store';

/**
 * Props del componente.
 */
interface Props {
  prize: Prize;
}

const props = defineProps<Props>();

/**
 * Emits del componente.
 */
const emit = defineEmits<{
  close: [];
}>();

/**
 * Etiqueta del premio según su orden.
 */
const prizeLabel = computed(() => {
  const order = props.prize.prizeOrder;
  if (order === 1) return '1º Premio (Gordo)';
  if (order === 2) return '2º Premio';
  if (order === 3) return '3º Premio';
  return `${order}º Premio`;
});

/**
 * Nombre del premio desde la rifa.
 */
const prizeName = computed(() => {
  const prizeNames = props.prize.rifa.prize_names;
  if (Array.isArray(prizeNames) && prizeNames.length >= props.prize.prizeOrder) {
    return prizeNames[props.prize.prizeOrder - 1];
  }
  return null;
});

/**
 * Genera estilos aleatorios para el confeti.
 * @param index Índice del confeti
 * @returns Objeto de estilos CSS
 */
function getConfettiStyle() {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3', '#54a0ff'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomLeft = Math.random() * 100;
  const randomDelay = Math.random() * 2;
  const randomDuration = 2 + Math.random() * 2;

  return {
    left: `${randomLeft}%`,
    backgroundColor: randomColor,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`,
  };
}
</script>

<style scoped>
.winner-modal {
  min-width: 600px;
  max-width: 800px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  position: relative;
}

.close-button {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  color: white;
  background: rgba(0, 0, 0, 0.2);
}

.winner-content {
  padding: 48px 32px;
  position: relative;
  z-index: 1;
}

/* Confeti */
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  border-radius: 50%;
  animation: fall linear infinite;
}

@keyframes fall {
  to {
    transform: translateY(800px) rotate(360deg);
  }
}

/* Trofeo */
.trophy-icon {
  animation: trophy-entrance 0.6s ease-out;
}

.trophy-bounce {
  color: #ffd700;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
  animation: bounce 2s infinite;
}

@keyframes trophy-entrance {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Nombre del premio */
.prize-title {
  font-size: 28px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.prize-name {
  font-size: 20px;
  font-weight: 500;
  color: #ffd700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Número ganador */
.winning-number {
  font-size: 120px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  line-height: 1;
  animation: number-pulse 1.5s infinite;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes number-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Felicitaciones */
.congratulations-text {
  font-size: 36px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 3px;
  animation: glow 1.5s infinite;
}

@keyframes glow {
  0%,
  100% {
    text-shadow:
      0 4px 8px rgba(0, 0, 0, 0.3),
      0 0 20px rgba(255, 215, 0, 0.5);
  }
  50% {
    text-shadow:
      0 4px 8px rgba(0, 0, 0, 0.3),
      0 0 40px rgba(255, 215, 0, 0.8);
  }
}

/* Nombre del ganador */
.winner-name {
  font-size: 32px;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  display: inline-block;
}

/* Responsivo */
@media (max-width: 600px) {
  .winner-modal {
    min-width: 100%;
  }

  .winning-number {
    font-size: 80px;
  }

  .congratulations-text {
    font-size: 28px;
  }

  .winner-name {
    font-size: 24px;
  }
}
</style>
