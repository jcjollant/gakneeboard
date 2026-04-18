<template>
  <div class="icon-selector-grid">
    <div 
        v-for="icon in AIRCRAFT_ICONS" 
        :key="icon.id" 
        class="icon-option" 
        :class="{ selected: isSelected(icon) }"
        @click="selectIcon(icon)"
        :title="icon.label"
    >
        <div class="icon-preview">
            <template v-if="icon.type === 'image'">
                <img :src="icon.path" :alt="icon.label" />
            </template>
            <template v-else>
                <font-awesome-icon :icon="icon.faIcon" />
            </template>
        </div>
        <div class="icon-label">{{ icon.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AIRCRAFT_ICONS, AircraftIcon } from '../../utils/aircraftIcons'

const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits(['update:modelValue'])

function isSelected(icon: AircraftIcon) {
    if (icon.type === 'font-awesome') {
        return props.modelValue === icon.faIcon || (!props.modelValue && icon.id === 'default');
    }
    return props.modelValue === icon.path || props.modelValue === icon.id;
}

function selectIcon(icon: AircraftIcon) {
    const value = icon.type === 'font-awesome' ? icon.faIcon : icon.path;
    emit('update:modelValue', value);
}
</script>

<style scoped>
.icon-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.icon-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  border: 1px solid #f1f5f9;
}

.icon-option:hover {
  background: #f1f5f9;
  border-color: #e2e8f0;
  transform: translateY(-1px);
}

.icon-option.selected {
  border-color: #0ea5e9;
  background: #f0f9ff;
  box-shadow: 0 2px 4px rgba(14, 165, 233, 0.1);
}

.icon-preview {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: #0369a1;
}

.icon-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.icon-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: #64748b;
  text-align: center;
}

.selected .icon-label {
    color: #0369a1;
}
</style>
