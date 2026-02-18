<template>
    <div class="tile-mode-dots">
        <div 
            v-for="mode in modes" 
            :key="mode.value"
            class="dot"
            :class="{ active: modelValue === mode.value }"
            :title="mode.description || mode.label"
            @click.stop="selectMode(mode.value)"
        ></div>
    </div>
</template>

<script setup lang="ts">
import { DisplayModeChoice } from '../../models/DisplayMode';

interface Props {
    modes: DisplayModeChoice[];
    modelValue: any;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

function selectMode(value: any) {
    if (props.modelValue !== value) {
        emit('update:modelValue', value);
    }
}
</script>

<style scoped>
.tile-mode-dots {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    z-index: 10;
    
    display: flex;
    gap: 8px;
    padding: 8px;
    background-color: rgba(230, 230, 230, 0.4);
    border: 1px solid rgba(200, 200, 200, 0.8);
    border-radius: 16px;
    backdrop-filter: blur(2px);
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--bg-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;
}

.dot:hover {
    transform: scale(1.2);
    border-color: var(--bg);
}

.dot.active {
    background-color: var(--bg);
    transform: scale(1.1);
}
</style>
