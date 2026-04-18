<template>
  <div class="aircraftCard" @click="$emit('selection', aircraft)">
    <div class="preview">
      <div class="icon">
        <font-awesome-icon icon="fa-plane" />
      </div>
      <div class="tailNumber">{{ aircraft.tailNumber }}</div>
    </div>
    <div class="name">{{ aircraft.make }} {{ aircraft.model }}</div>
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
  width: calc(var(--page-width) / 5);
}
.preview {
  background-color: #e0f2fe;
  border-radius: 5px;
  border: 3px solid #0369a1;
  height: calc(var(--page-width) / 5);
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
}
.tailNumber {
  position: absolute;
  bottom: 5px;
  font-weight: bold;
  color: #0c4a6e;
  font-size: 0.8rem;
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
