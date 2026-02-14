<template>
  <div class="scene" @click="togglePause">
    <div 
      class="card" 
      ref="cardRef"
      :class="{ 'is-paused': isPaused }"
      :style="cardStyle"
    >
      <div class="face front">
        <img :src="frontSrc" alt="Front view" loading="lazy" />
      </div>
      <div class="face back">
        <img :src="backSrc" alt="Back view" loading="lazy" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

defineProps<{
  frontSrc: string;
  backSrc: string;
}>();

const cardRef = ref<HTMLElement | null>(null);
const isPaused = ref(false);
const pausedSide = ref<'front' | 'back'>('front');
const animDelay = ref('0s');

const togglePause = () => {
  if (isPaused.value) {
    // Resuming: Snap animation timeline to the current static view
    // Front (0deg) is centered at 20% of the 10s animation
    // Back (180deg) is centered at 70% of the 10s animation
    const duration = 10;
    const offset = pausedSide.value === 'front' ? duration * 0.2 : duration * 0.7;
    animDelay.value = `-${offset}s`;
    
    isPaused.value = false;
    return;
  }
  
  if (cardRef.value) {
    const style = window.getComputedStyle(cardRef.value);
    const matrixStr = style.transform;
    
    // Default to front if no transform or none
    let showFront = true;
    
    if (matrixStr && matrixStr !== 'none') {
      // matrix(a, b, c, d, tx, ty) or matrix3d(...)
      // We care about the first value (m11) which relates to cos(angle)
      try {
        const values = matrixStr.split('(')[1].split(')')[0].split(',');
        const m11 = parseFloat(values[0]);
        // If m11 is positive (roughly -90 to 90 deg), it's front
        showFront = m11 > 0;
      } catch (e) {
        console.error('Error parsing transform matrix', e);
      }
    }
    
    pausedSide.value = showFront ? 'front' : 'back';
    isPaused.value = true;
  }
};

const cardStyle = computed(() => {
  const styles: Record<string, string> = {
      animationDelay: animDelay.value
  };
  
  if (isPaused.value) {
    styles.transform = pausedSide.value === 'front' ? 'rotateY(0deg)' : 'rotateY(180deg)';
  }
  
  return styles;
});
</script>

<style scoped>
.scene {
  width: 100%;
  max-width: 240px;
  aspect-ratio: 0.7;
  perspective: 1000px;
  margin: 0 auto 1.5rem;
  padding-top: 10px;
  cursor: pointer;
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  animation: rotate 10s infinite ease-in-out;
  transition: transform 0.3s ease; /* smooth snap when pausing */
}

.card.is-paused {
  animation: none;
}


.face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  box-shadow: 
    0 4px 12px rgba(0,0,0,0.2), 
    inset 0 0 0 2px rgba(255,255,255,0.3); /* Subtle inner edge to look like plastic thickness */
  overflow: hidden;
  background: white;
}

/* Lamination Gloss/Sheen */
.face::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    135deg, 
    rgba(255,255,255,0.4) 0%, 
    rgba(255,255,255,0.1) 30%, 
    rgba(255,255,255,0) 50%
  );
  pointer-events: none;
  transform: rotate(-10deg); /* Slight angle to the sheen */
}

/* Highlighting/Reflections */
.face::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: radial-gradient(circle at 10% 10%, rgba(255,255,255,0.5), transparent 60%);
  pointer-events: none;
  z-index: 2;
  mix-blend-mode: overlay;
}

.face img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.front {
  transform: rotateY(0deg);
}

.back {
  transform: rotateY(180deg);
}

@keyframes rotate {
  0% {
    transform: rotateY(-20deg);
  }
  40% {
    transform: rotateY(20deg);
  }
  50% {
    transform: rotateY(160deg);
  }
  90% {
    transform: rotateY(200deg);
  }
  100% {
    transform: rotateY(340deg); /* Effectively -20deg */
  }
}
</style>
