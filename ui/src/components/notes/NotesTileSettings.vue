<template>
    <div class="notes-settings">

        <!-- Watermark Configuration -->
        <div class="settings-section">
            <Separator name="Watermark" :leftAligned="true" />
            <div class="input-container">
                <span class="p-float-label">
                    <InputText id="acronym-input" v-model="customWord" class="w-full" />
                    <!-- <label for="acronym-input">Acronym</label> -->
                </span>
                <small class="help-text">Used in 'Blank' display mode.</small>
            </div>
        </div>

        <!-- Display Configuration -->
        <div class="settings-section display-section">
            <SeparatorChoice name="Display" choiceA="Normal" choiceB="Expanded" v-model="isNormalSize" />
            <ChoiceList v-model="currentMode" :choices="modeOptions" :small="true" />
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, inject } from 'vue';
import InputText from 'primevue/inputtext';
import Separator from '../shared/Separator.vue';
import SeparatorChoice from '../shared/SeparatorChoice.vue';
import ChoiceList from '../shared/ChoiceList.vue';

import { DisplayModeNotes, DisplayModeChoice } from '../../models/DisplayMode';
import { TileData } from '../../models/TileData';
import { NotesTileConfig } from './NotesTileConfig';

const props = defineProps({
    tileData: { type: TileData, required: true },
});

// State
// State
const modeOptions = NotesTileConfig.modesList;
const currentMode = ref(DisplayModeNotes.Blank);
const customWord = ref('');
const compassHeading = ref(true);
const expanded = ref(false);
const isInternalUpdate = ref(false);

const isNormalSize = computed({
    get: () => !expanded.value,
    set: (val: boolean) => expanded.value = !val
});

const tileData = ref<TileData>(props.tileData);
const tileSettingsUpdate = inject('tileSettingsUpdate') as ((data: any) => void) | undefined;


// Initialization
onMounted(() => {
    loadFromTileData(props.tileData);
});

watch(() => props.tileData, (newTileData) => {
    loadFromTileData(newTileData);
}, { deep: true });

// Watch for changes via UI
watch([currentMode, customWord, compassHeading, expanded], () => {
    if (!isInternalUpdate.value) {
        emitUpdate();
    }
});

function loadFromTileData(tile: TileData) {
    if (!tile) return;
    
    // Handle both raw config object and typed config
    const config = tile.data as any; // Allow loose typing for legacy data
    
    isInternalUpdate.value = true;
    
    // Restore display mode
    let newMode = config?.mode ?? DisplayModeNotes.Blank;
    // For compatibility Craft/Word/blank => Blank
    if(newMode === 'craft' || newMode === 'word' || newMode === 'blank') newMode = DisplayModeNotes.Blank; 
    
    // Migration: if mode is compass and comp is false, it's now Hold
    if(newMode == DisplayModeNotes.Compass && config?.comp === false) {
        newMode = DisplayModeNotes.Hold;
    }

    currentMode.value = newMode;
    expanded.value = tile.span2;
    
    // Restore custom word
    customWord.value = config?.word ?? '';
    
    // Restore compass setting (legacy)
    compassHeading.value = config?.comp ?? true;
    
    isInternalUpdate.value = false;
}

function emitUpdate() {
    const newConfig = new NotesTileConfig(
        currentMode.value,
        customWord.value,
        currentMode.value === DisplayModeNotes.Hold ? false : true // comp legacy field
    );

    tileData.value.data = newConfig;
    tileData.value.span2 = expanded.value;

    if (tileSettingsUpdate) {
        tileSettingsUpdate(tileData.value);
    }
}
</script>

<style scoped>
.notes-settings {
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
    margin-top: 10px;
}

.help-text {
    color: var(--text-color-secondary);
    font-size: 0.85rem;
    margin-left: 2px;
}

.compass-options {
    display: flex;
    justify-content: center;
    margin-top: 5px;
}

.w-full {
    width: 100%;
}

.display-section :deep(.choicelist) {
    justify-content: center;
}
</style>
