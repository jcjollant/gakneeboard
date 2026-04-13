<template>
    <div class="notes-settings">

        <!-- Watermark Configuration -->
        <div class="settings-section">
            <Separator name="Watermarks" :leftAligned="true" />
            <div class="settings-grid">
                <span class="selection-label">Banner</span>
                <div class="input-container">
                    <span class="p-float-label">
                        <InputText id="acronym-input" v-model="customWord" class="w-full" />
                    </span>
                </div>
                <span class="selection-label">Columns</span>
                <div class="pill-options">
                    <AnyOf v-model="columnSelection" :allowsNoSelection="true" />
                </div>
                <span class="selection-label">Pills</span>
                <div class="pill-options">
                    <AnyOf v-model="pillSelection" :allowsNoSelection="true" />
                </div>
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
import { ref, watch, computed, onMounted, inject, nextTick } from 'vue';
import InputText from 'primevue/inputtext';
import Separator from '../shared/Separator.vue';
import SeparatorChoice from '../shared/SeparatorChoice.vue';
import ChoiceList from '../shared/ChoiceList.vue';
import AnyOf from '../shared/AnyOf.vue';

import { DisplayModeNotes } from '../../models/DisplayMode';
import { OneChoiceValue } from '../../models/OneChoiceValue';
import { TileData } from '../../models/TileData';
import { NotesTileConfig } from './NotesTileConfig';

const props = defineProps({
    tileData: { type: TileData, required: true },
});

// State
const modeOptions = NotesTileConfig.modesList;
const currentMode = ref(DisplayModeNotes.Blank);
const customWord = ref('');
const compassHeading = ref(true);
const expanded = ref(false);
const isInternalUpdate = ref(false);

const columnSelection = ref<OneChoiceValue[]>(
    NotesTileConfig.columnOptions.map(opt => new OneChoiceValue(opt.label, opt.value, undefined, false))
);

const pillSelection = ref<OneChoiceValue[]>(
    NotesTileConfig.pillsOptions.map(opt => new OneChoiceValue(opt.label, opt.value, undefined, false))
);

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

watch([columnSelection, pillSelection], () => {
    if (!isInternalUpdate.value) {
        emitUpdate();
    }
}, { deep: true });

async function loadFromTileData(tile: TileData) {
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
    
    // Restore columns
    const columns = config?.cols ?? [];
    columnSelection.value.forEach(opt => {
        opt.active = columns.includes(opt.value);
    });

    // Restore pills
    const pills = config?.pills ?? [];
    pillSelection.value.forEach(opt => {
        opt.active = pills.includes(opt.value);
    });
    
    // Wait for the watchers triggered by the sync to "flush" 
    // before we allow them to emit updates again.
    await nextTick();
    isInternalUpdate.value = false;
}


function emitUpdate() {
    const newConfig = new NotesTileConfig(
        currentMode.value,
        customWord.value,
        currentMode.value === DisplayModeNotes.Hold ? false : true, // comp legacy field
        pillSelection.value.filter(opt => opt.active).map(opt => opt.value),
        columnSelection.value.filter(opt => opt.active).map(opt => opt.value)
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

.settings-grid {
    display: grid;
    grid-template-columns: 110px auto;
    gap: 8px 15px;
    align-items: center;
}

.selection-label {
    font-size: 0.8rem;
    color: var(--bg-secondary);
    font-weight: bold;
}

.pill-options {
    display: flex;
    justify-content: flex-start;
}
</style>
