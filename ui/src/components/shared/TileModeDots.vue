<template>
    <div class="tile-mode-dots">
        <div 
            v-for="mode in modes" 
            :key="mode.value"
            class="dot"
            :class="{ active: modelValue === mode.value }"
            :title="mode.description || mode.label"
            @click.stop="selectMode(mode.value)"
        >{{ (mode.initial || mode.label || '').charAt(0).toUpperCase() }}</div>
        <template v-if="expandable">
            <div class="divider"></div>
            <font-awesome-icon 
                icon="arrows-left-right"
                class="toggle-expanded"
                :class="{ 'active': expanded }"
                :title="expanded ? 'Collapse' : 'Expand'"
                @click.stop="toggleExpanded"
            />
        </template>
    </div>
</template>

<script setup lang="ts">
import { DisplayModeChoice } from '../../models/DisplayMode';

interface Props {
    modes: DisplayModeChoice[];
    modelValue: any;
    expanded?: boolean;
    expandable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    expandable: false
});
const emit = defineEmits(['update:modelValue', 'update:expanded']);

function selectMode(value: any) {
    if (props.modelValue !== value) {
        emit('update:modelValue', value);
    }
}

function toggleExpanded() {
    emit('update:expanded', !props.expanded);
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
    align-items: center;
    gap: 8px;
    padding: 6px;
    background-color: rgba(230, 230, 230, 0.4);
    border: 1px solid rgba(200, 200, 200, 0.8);
    border-radius: 20px;
    backdrop-filter: blur(2px);
}

.dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: var(--bg-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid transparent;

    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    color: rgba(0, 0, 0, 0.4);
    user-select: none;
}

.dot:hover {
    transform: scale(1.2);
    border-color: var(--bg);
}

.dot.active {
    background-color: var(--bg);
    color: white;
    transform: scale(1.1);
}

.divider {
    width: 1px;
    height: 18px;
    background-color: var(--bg-secondary);
    opacity: 0.5;
    margin: 0 4px;
}

.toggle-expanded {
    font-size: 12px;
    color: var(--bg-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.toggle-expanded.active {
    color: var(--bg);
    transform: scale(1.1);
}

.toggle-expanded:hover {
    color: var(--bg);
    transform: scale(1.2);
}
</style>
