<template>
  <div class="gak-banner">
    <div class="logo-container">
      <img src="/assets/logo-720.png" alt="GAPilot Logo" class="logo" />
      <div class="website-text">Kneeboard.ga</div>
    </div>
    <div class="text-container">
      <div class="head-text">Better Kneeboards for Safer Pilots</div>
      <div class="sub-text">Make Your Kneeboard Work For You</div>
    </div>
    <div class="action-container">
      <Button label="Start for Free" class="p-button-rounded cta-button" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
</script>

<style scoped>
.gak-banner {
  width: 728px;
  height: 90px;
  background-image: url('/assets/banner-bg.png');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  overflow: hidden;
  font-family: var(--font-family, sans-serif);
  border-radius: 4px;
}

.logo-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: 20px;
}

.logo {
  max-height: 55px;
  width: auto;
}

.website-text {
  font-size: 0.9rem;
  color: #3E2723;
  font-weight: 500;
}

.text-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-grow: 1; 
  padding: 0 15px;
  padding-left: 55px; /* Offset center to left by 20px (15 + 40) */
}

.head-text {
  font-weight: bold;
  font-size: 1.25rem;
  color: white;
  margin-bottom: 4px;
}

.sub-text {
  font-size: 1rem;
  color: white;
}

.action-container {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

:deep(.cta-button) {
    background-color: #f97316 !important;
    border-color: #f97316 !important;
    color: white !important;
    font-weight: 600;
}

:deep(.cta-button:hover) {
    background-color: #ea580c !important;
    border-color: #ea580c !important;
}
</style>
