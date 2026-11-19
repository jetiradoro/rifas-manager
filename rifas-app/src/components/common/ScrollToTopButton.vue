<template>
  <transition name="slide-up">
    <div v-if="isVisible" class="scroll-to-top-wrapper">
      <q-btn
        rounded
        unelevated
        dense
        no-caps
        color="primary"
        icon="keyboard_arrow_up"
        label="Inicio"
        size="sm"
        class="scroll-to-top-pill"
        aria-label="Volver al inicio"
        @click="scrollToTop"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

type ScrollTarget = Window | HTMLElement;

const props = defineProps<{
  offset?: [number, number];
  threshold?: number;
  targetSelector?: string;
}>();

const isVisible = ref(false);
const scrollTarget = ref<ScrollTarget | null>(null);
const extraListener = ref<ScrollTarget | null>(null);
const scrollThreshold = computed(() => props.threshold ?? 200);
const hideDelay = 2500;
let lastScrollTop = 0;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
const animationDuration = 450;
let frameId: number | null = null;

function resolveTarget(): ScrollTarget {
  if (props.targetSelector) {
    const el = document.querySelector(props.targetSelector);
    if (el instanceof HTMLElement) {
      return el;
    }
  }

  const pageContainer = document.querySelector('.q-page-container');
  if (
    pageContainer instanceof HTMLElement &&
    pageContainer.scrollHeight > pageContainer.clientHeight
  ) {
    return pageContainer;
  }

  const scrollingEl = document.scrollingElement;
  if (scrollingEl instanceof HTMLElement && scrollingEl.scrollHeight > scrollingEl.clientHeight) {
    return scrollingEl;
  }

  return window;
}

function getScrollTop(target: ScrollTarget) {
  return target instanceof Window ? target.scrollY : target.scrollTop;
}

/**
 * Función de easing para animación suave (ease-in-out).
 */
function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Muestra el botón solo al subir con el scroll y lo oculta tras un tiempo de inactividad.
 */
function handleScroll() {
  const target = scrollTarget.value ?? window;
  const current = getScrollTop(target);
  const scrollingUp = current < lastScrollTop - 4;
  const scrollingDown = current > lastScrollTop + 4;
  lastScrollTop = current;

  if (current <= scrollThreshold.value) {
    isVisible.value = false;
  } else if (scrollingUp) {
    isVisible.value = true;
  } else if (scrollingDown) {
    isVisible.value = false;
  }

  if (hideTimer) clearTimeout(hideTimer);
  if (isVisible.value) {
    hideTimer = setTimeout(() => {
      isVisible.value = false;
    }, hideDelay);
  }
}

function scrollToTop() {
  if (!scrollTarget.value) {
    return;
  }

  const target = scrollTarget.value;
  const start = getScrollTop(target);
  if (start === 0) {
    return;
  }

  const startTime = performance.now();

  const animate = (time: number) => {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / animationDuration, 1);
    const eased = easeInOutQuad(progress);
    if (target instanceof Window) {
      target.scrollTo({ top: start * (1 - eased), left: 0, behavior: 'auto' });
    } else {
      target.scrollTo({ top: start * (1 - eased), left: 0, behavior: 'auto' });
    }

    if (progress < 1) {
      frameId = requestAnimationFrame(animate);
    }
  };

  if (frameId) {
    cancelAnimationFrame(frameId);
  }
  frameId = requestAnimationFrame(animate);
}

onMounted(() => {
  scrollTarget.value = resolveTarget();
  scrollTarget.value.addEventListener('scroll', handleScroll, { passive: true });

  // Si el target no es window, añadimos también listener a window para casos donde el scroll sea global
  if (scrollTarget.value !== window) {
    extraListener.value = window;
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  handleScroll();
});

onBeforeUnmount(() => {
  scrollTarget.value?.removeEventListener('scroll', handleScroll);
  extraListener.value?.removeEventListener('scroll', handleScroll);
  if (frameId) {
    cancelAnimationFrame(frameId);
  }
  if (hideTimer) clearTimeout(hideTimer);
});
</script>

<style scoped>
.scroll-to-top-wrapper {
  position: fixed;
  left: 50%;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  z-index: 1100;
}

.scroll-to-top-pill {
  padding: 2px 12px 2px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
</style>
