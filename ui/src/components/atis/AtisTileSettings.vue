<template>
    <div class="atis-settings">
        <!-- Lines Configuration -->
        <div class="settings-section">
            <Separator name="Number of Lines" :leftAligned="true" />
            <div class="input-container">
                <OneChoice v-model="selectedLines" :choices="linesChoices" :full="true" />
                <small class="help-text" style="text-align: center; margin-top: 5px;">Select how many lines to display in weather tiles.</small>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, inject } from 'vue';
import { TileData } from '../../models/TileData';
import OneChoice from '../shared/OneChoice.vue';
import Separator from '../shared/Separator.vue';

const props = defineProps({
    tileData: { type: TileData, required: true },
});

// State
const isInternalUpdate = ref(false);
const expanded = ref(false);
const tileData = ref<TileData>(props.tileData);
const tileSettingsUpdate = inject('tileSettingsUpdate') as ((data: any) => void) | undefined;

const linesChoices = ref([
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
]);

const selectedLines = ref(linesChoices.value[3]); // default 5

// Initialization
onMounted(() => {
    loadFromTileData(props.tileData);
});

watch(() => props.tileData, (newTileData) => {
    loadFromTileData(newTileData);
}, { deep: true });

// Watch for changes via UI
watch([selectedLines], () => {
    if (!isInternalUpdate.value) {
        emitUpdate();
    }
});

function loadFromTileData(tile: TileData) {
    if (!tile) return;
    
    const config = tile.data as any; 
    
    isInternalUpdate.value = true;
    expanded.value = tile.span2;
    
    // Restore lines
    const lines = config?.lines ?? 5;
    const found = linesChoices.value.find(c => c.value === lines);
    if(found) {
        selectedLines.value = found;
    }
    
    isInternalUpdate.value = false;
}

function emitUpdate() {
    const newConfig = {
        ...tileData.value.data as any,
        lines: selectedLines.value.value
    };

    tileData.value.data = newConfig;
    tileData.value.span2 = expanded.value;

    if (tileSettingsUpdate) {
        tileSettingsUpdate(tileData.value);
    }
}
</script>

<style scoped>
.atis-settings {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 10px 0;
}

.settings-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.input-container {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 5px;
}

.help-text {
    color: var(--text-color-secondary);
    font-size: 0.85rem;
    margin-left: 2px;
}
</style>
