<template>
  <div class="aircraftCard" @click="$emit('selection', aircraft)">
    <div class="preview">
      <div class="icon">
        <img v-if="aircraft.data.icon && aircraft.data.icon.endsWith('.png')" :src="aircraft.data.icon" class="aircraft-image" />
        <img v-else-if="aircraft.data.icon && !aircraft.data.icon.startsWith('fa-')" :src="'/aircrafts/' + aircraft.data.icon" class="aircraft-image" />
        <font-awesome-icon v-else :icon="aircraft.data.icon || 'fa-plane'" />
      </div>
    </div>
    <div class="name">{{ aircraft.tailNumber || (aircraft.data.make + ' ' + aircraft.data.model) }}</div>
  </div>
</template>

<script setup lang="ts">
import { Aircraft } from '@gak/shared'

defineProps<{
  aircraft: Aircraft
}>()

defineEmits(['selection'])
</script>

<style scoped>
.aircraftCard {
  display: flex;
  flex-flow: column;
  justify-content: center;
  cursor: pointer;
  width: calc(var(--page-width) / 5 + 6px);
}
.preview {
  background-color: #e0f2fe;
  border-radius: 5px;
  border: 3px solid #0369a1;
  height: calc(var(--page-width) / 5 + 6px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  transition: transform 0.2s;
}
.preview:hover {
    transform: scale(1.05);
}
.icon {
  font-size: 2.5rem;
  color: #0c4a6e;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 1rem;
}
.aircraft-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.name {
  text-align: center;
  font-size: small;
  padding: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
