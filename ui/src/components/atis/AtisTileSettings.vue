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

        <!-- Watermarks Configuration -->
        <div class="settings-section">
            <SeparatorChoice name="Watermarks" choiceA="Show" choiceB="Hide" v-model="showWatermarks" />
            <small class="help-text" style="text-align: center;">Display faded placeholder text internally.</small>
        </div>
        <!-- Display Configuration -->
        <div class="settings-section display-section">
            <SeparatorChoice name="Display" choiceA="Normal" choiceB="Expanded" v-model="isNormalSize" />
            <ChoiceList v-model="displayMode" :choices="modeOptions" :small="true" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, inject, computed } from 'vue';
import { TileData } from '../../models/TileData';
import OneChoice from '../shared/OneChoice.vue';
import Separator from '../shared/Separator.vue';
import SeparatorChoice from '../shared/SeparatorChoice.vue';
import ChoiceList from '../shared/ChoiceList.vue';
import { DisplayModeAtis, DisplayModeChoice } from '../../models/DisplayMode';
import { AtisTileDisplayModeLabels } from './AtisTileDisplayModeLabel';

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
const showWatermarks = ref(true);
const displayMode = ref(DisplayModeAtis.FullATIS);

const modeOptions = ref([
    new DisplayModeChoice(AtisTileDisplayModeLabels.fullATIS, DisplayModeAtis.FullATIS, true),
    new DisplayModeChoice(AtisTileDisplayModeLabels.compactATIS, DisplayModeAtis.CompactATIS, true),
    new DisplayModeChoice(AtisTileDisplayModeLabels.categories, DisplayModeAtis.Categories, false),
]);

const isNormalSize = computed({
    get: () => !expanded.value,
    set: (val: boolean) => expanded.value = !val
});

// Initialization
onMounted(() => {
    loadFromTileData(props.tileData);
});

watch(() => props.tileData, (newTileData) => {
    loadFromTileData(newTileData);
}, { deep: true });

// Watch for changes via UI
watch([selectedLines, showWatermarks, displayMode, expanded], () => {
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
    
    showWatermarks.value = config?.showWatermarks !== false; // defaults to true
    
    let newMode = config?.mode ?? DisplayModeAtis.FullATIS;
    displayMode.value = newMode;
    
    isInternalUpdate.value = false;
}

function emitUpdate() {
    const newConfig = {
        ...tileData.value.data as any,
        lines: selectedLines.value.value,
        showWatermarks: showWatermarks.value,
        mode: displayMode.value
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

.display-section :deep(.choicelist) {
    justify-content: center;
}
</style>
