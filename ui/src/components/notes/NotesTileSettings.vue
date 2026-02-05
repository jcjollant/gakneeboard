<template>
    <div class="notes-settings">
        <!-- Display Mode Section -->
        <Separator name="Display" class="separator" />
        <DisplayModeSelector :choices="modesList" v-model="selectedModeChoice" :show-previews="true" />
        <div class="display-onechoice">
            <EitherOr either="Normal" or="Wide" v-model="isNormal" />
        </div>

        <!-- Acronym Mode Configuration -->
        <div v-if="currentMode === DisplayModeNotes.Word" class="settings-section">
            <Separator name="Custom Acronym" />
            <div class="input-container">
                <span class="p-float-label">
                    <InputText id="acronym-input" v-model="customWord" class="w-full" />
                    <label for="acronym-input">Acronym</label>
                </span>
                <small class="help-text">Enter the word or acronym to display on the left side.</small>
            </div>
        </div>

        <!-- Compass Mode Configuration -->
        <div v-if="currentMode === DisplayModeNotes.Compass" class="settings-section">
            <Separator name="Compass Options" />
            <div class="compass-options">
                <EitherOr v-model="compassHeading" either="Heading" or="Hold" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, inject } from 'vue';
import InputText from 'primevue/inputtext';
import DisplayModeSelector from '../shared/DisplayModeSelector.vue';
import EitherOr from '../shared/EitherOr.vue';
import Separator from '../shared/Separator.vue';

import { DisplayModeNotes, DisplayModeChoice } from '../../models/DisplayMode';
import { TileData } from '../../models/TileData';
import { NotesTileConfig } from './NotesTileConfig';

const props = defineProps({
    tileData: { type: TileData, required: true },
});

// State
const currentMode = ref(DisplayModeNotes.Blank);
const customWord = ref('CRAFT');
const compassHeading = ref(true);
const expanded = ref(false);
const isInternalUpdate = ref(false);

const tileData = ref<TileData>(props.tileData);
const tileSettingsUpdate = inject('tileSettingsUpdate') as ((data: any) => void) | undefined;

// Lists
const modesList = ref([
    new DisplayModeChoice('Blank', DisplayModeNotes.Blank, true, "Well, A blank Tile", '/tiles/notes-blank.png'),
    new DisplayModeChoice('Acronym', DisplayModeNotes.Word, true, "A configurable acronym on the left side", '/tiles/notes-word.png'),
    new DisplayModeChoice('Compass', DisplayModeNotes.Compass, true, "A blank compass with numerical headings", '/tiles/notes-compass.png'),
    new DisplayModeChoice('Grid', DisplayModeNotes.Grid, true, "A blank grid to organize things", '/tiles/notes-grid.png'),
]);

const selectedModeChoice = computed({
    get: () => modesList.value.find(c => c.value === currentMode.value),
    set: (val) => { 
        if(val) currentMode.value = val.value as DisplayModeNotes 
    }
});

const isNormal = computed({
    get: () => !expanded.value,
    set: (val) => { expanded.value = !val; emitUpdate(); }
})

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
    // For compatibility Craft => Word
    if(newMode === 'craft') newMode = DisplayModeNotes.Word; // Hardcoded check for deprecated value just in case
    
    currentMode.value = newMode;
    expanded.value = tile.span2;
    
    // Restore custom word
    customWord.value = config?.word ?? 'CRAFT';
    
    // Restore compass setting
    // 'comp' might be missing in old data, default to true
    compassHeading.value = config?.comp ?? true;
    
    isInternalUpdate.value = false;
}

function emitUpdate() {
    const newConfig = new NotesTileConfig(
        currentMode.value,
        customWord.value,
        compassHeading.value
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

.display-onechoice {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}
</style>
