<template>
  <div v-if="visible" class="print-animation-overlay">
    <div class="content">
      <h2>Generating PDF</h2>
      <p>Preparing your perfect kneeboard...</p>
      <div class="pattern-container">
        <div class="pattern-path"></div>
        <div class="runway"></div>
        <div class="airplane">
          <font-awesome-icon class="plane-icon" icon="fa-solid fa-plane" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
}>()
</script>

<style scoped>
.print-animation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pattern-container {
  --pattern-height: 100px;
  --pattern-width: 400px;
  margin-top: 3rem;
  width: var(--pattern-width);
  height: calc(var(--pattern-height) + 20px); /* Add space for runway height */
  position: relative;
}
.pattern-path {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--pattern-height); /* Explicit height for the path */
  border: 2px dashed #ccc;
  border-radius: 20px;
}
.runway {
  position: absolute;
  top: calc(var(--pattern-height) - 10px);
  left: calc(var(--pattern-width) / 2 - 90px);
  width: 180px;
  height: 20px;
  background: #555;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
.runway::after {
  content: "";
  width: 160px;
  height: 2px;
  background: repeating-linear-gradient(to right, #fff 0, #fff 10px, transparent 10px, transparent 20px);
}
.airplane {
  position: absolute;
  top: -12px; /* Center with respect to corner */
  left: -12px;
  font-size: 24px;
  color: var(--primary-color, #0f4c81);
  animation: flyPattern 6s linear infinite;
  text-align: center;
  line-height: 24px; 
  width: 24px;
  height: 24px;
  z-index: 2;
}

@keyframes flyPattern {
  0% { transform: translate(0px, var(--pattern-height)) rotate(0deg); }
  35% { transform: translate(var(--pattern-width), var(--pattern-height)) rotate( 0deg); }
  40% { transform: translate(var(--pattern-width), var(--pattern-height)) rotate(-90deg); }
  45% { transform: translate(var(--pattern-width), 0px) rotate(-90deg); }
  50% { transform: translate(var(--pattern-width), 0px) rotate(-180deg); }
  85% { transform: translate(0px, 0px) rotate(-180deg); }
  90% { transform: translate(0px, 0px) rotate(-270deg); }
  95% { transform: translate(0px, var(--pattern-height)) rotate(-270deg); }
  100% { transform: translate(0px, var(--pattern-height)) rotate(-360deg); }
}
</style>
