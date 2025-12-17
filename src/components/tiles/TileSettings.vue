<template>
    <div class="tile-settings-overlay">
        <div class="settings-container">
            <div class="settings-header">
                <div class="header-left">
                    <div class="mini-grid">
                        <!-- Placeholder for mini-grid visualization based on tile prop -->
                        <div class="grid-icon mini-grid-css">
                            <div v-for="i in 6" :key="i" class="mini-cell" 
                                :class="{ active: (i-1) === index }"></div>
                        </div>
                    </div>
                    <div class="settings-title">{{ title }}</div>
                </div>
                <div class="close-button" @click="emits('close')">
                    <font-awesome-icon :icon="['fas','fa-times']" />
                </div>
            </div>
            
            <div class="settings-body">
                <slot></slot>
            </div>

            <ActionBar :video="video" :help="help" :canApply="canApply" :showCancel="true"
                @apply="emits('apply')" @cancel="emits('close')" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { TileData } from '../../models/TileData';
import ActionBar from '../shared/ActionBar.vue';

const emits = defineEmits(['close', 'apply']);

const props = defineProps({
    tile: { type: TileData, required: true },
    video: { type: String, default: undefined },
    help: { type: String, default: undefined },
    canApply: { type: Boolean, default: false },
    index: { type: Number, default: -1 },
});

onMounted(() => {
    console.debug('[TileSettings] props', props);
});

const title = computed(() => {
    if (!props.tile) return 'Settings';
    // Capitalize first letter
    const name = props.tile.name.charAt(0).toUpperCase() + props.tile.name.slice(1);
    return `${name} Tile Settings`;
});
</script>

<style scoped>
.tile-settings-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent backdrop */
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px; /* Padding to see underlying content edges */
}

.settings-container {
    background-color: var(--bg-primary); /* Assuming theme variable */
    width: 100%;
    height: 100%;
    max-width: 600px; /* Optional max width */
    max-height: 800px; /* Optional max height */
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background-color: var(--bg-secondary); /* Assuming theme variable */
    border-bottom: 1px solid var(--border-color, #ccc);
}

.header-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.settings-title {
    font-weight: bold;
    font-size: 1.1rem;
}

.close-button {
    cursor: pointer;
    font-size: 1.2rem;
    padding: 5px;
}

.close-button:hover {
    color: var(--primary-color, blue);
}

.settings-body {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
}

/* Default colors if variables not defined */
:root {
    --bg-primary: white;
    --bg-secondary: #f0f0f0;
}

.mini-grid-css {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2px;
}
.mini-cell {
    width: 5px;
    height: 5px;
    background-color: darkgrey;
    border-radius: 1px;
}
.mini-cell.active {
    background-color: var(--primary-color, blue);
}
</style>
