<template>
  <transition name="fade">
    <q-page-sticky
      v-if="isVisible"
      position="bottom-right"
      :offset="offsetValue"
      class="scroll-to-top-sticky"
    >
      <q-btn
        round
        color="primary"
        icon="keyboard_arrow_up"
        size="lg"
        padding="sm"
        aria-label="Volver al inicio"
        @click="scrollToTop"
      />
    </q-page-sticky>
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
const offsetValue = computed<[number, number]>(() => props.offset ?? [16, 96]);
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

function handleScroll() {
  const target = scrollTarget.value ?? window;
  isVisible.value = getScrollTop(target) > scrollThreshold.value;
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
});
</script>

<style scoped>
.scroll-to-top-sticky {
  z-index: 1100;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
