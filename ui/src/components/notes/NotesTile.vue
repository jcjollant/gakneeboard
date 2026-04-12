<template>
    <div class="tile">
        <Header title="Notes"
            :stealth="displayMode==DisplayModeNotes.Blank" 
            leftButton="settings"
            @replace="emits('replace')" @settings="emits('settings')"></Header>
        <div v-if="displayMode==DisplayModeNotes.Blank" class="tileContent">&nbsp;</div>
        <div v-else-if="displayMode==DisplayModeNotes.Watermark" class="blank-grid">
            <div class="cell-word">
                <WordContent v-if="word?.length" :word="word" />
            </div>
            <div class="cell-columns">
                <div v-if="columns.length" class="box">
                    <div v-for="c in columns" :key="c" class="column">{{ c }}</div>
                </div>
            </div>
            <div v-if="pills.length" class="cell-pills">
                <div class="box">
                    <div v-for="p in pills" :key="p" class="pill">{{ p }}</div>
                </div>
            </div>
        </div>
        <CompassContent v-else-if="displayMode==DisplayModeNotes.Compass || displayMode==DisplayModeNotes.Hold" :heading="displayMode == DisplayModeNotes.Compass" />
        <div v-else-if="displayMode==DisplayModeNotes.Grid" class="modeGrid tileContent" :class="{ expanded: expanded }">
            <div v-for="i in gridCells" :key="i">&nbsp;</div>
        </div>
        
        <TileModeDots 
            v-model="displayMode" 
            v-model:expanded="expanded"
            :expandable="true"
            :modes="displayModes" 
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, computed } from 'vue'
import { DisplayModeNotes } from '../../models/DisplayMode'; 
import { TileType } from '../../models/TileType';
import { TileData } from '../../models/TileData';

import WordContent from './WordContent.vue';
import CompassContent from './CompassContent.vue';
import TileModeDots from '../shared/TileModeDots.vue';
import Header from '../shared/Header.vue';
import { NotesTileConfig } from './NotesTileConfig';

// Enum with display modes

const compassHeading = ref(true)
const displayMode = ref(DisplayModeNotes.Unknown)
const emits = defineEmits(['replace','update','settings'])
const word = ref('')
const pills = ref<string[]>([])
const columns = ref<string[]>([])
const displayModes = NotesTileConfig.modesList

// Props management
const props = defineProps({
    params: { type: Object, default: null},
    span2: { type: Boolean, default: false}
})
const expanded = ref(false)
const gridCells = computed(() => expanded.value ? 24 : 12)

function loadProps(props:any) {
    // restore display mode
    let newMode = props?.params?.mode ?? DisplayModeNotes.Blank
    // For compatibility Craft/Word/blank => Blank
    if(newMode == DisplayModeNotes.Craft_deprecated || newMode == (DisplayModeNotes as any).Word_deprecated || newMode == 'word' || newMode == 'blank') newMode = DisplayModeNotes.Blank
    
    // Migration: if mode is compass and comp is false, it's now Hold
    if(newMode == DisplayModeNotes.Compass && props?.params?.comp === false) {
        newMode = DisplayModeNotes.Hold
    }
    displayMode.value = newMode
    
    // Restore custom word
    word.value = props?.params?.word ?? ''
    // Restore watermarks
    pills.value = props?.params?.pills ?? []
    // Restore columns
    columns.value = props?.params?.cols ?? []
    // We keep compassHeading for legacy if needed, but it's now derived from displayMode for rendering
    compassHeading.value = props?.params?.comp ?? true
    expanded.value = props?.span2 ?? false
}

onMounted(() => {   
    loadProps(props)
})

watch( props, async() => {
    loadProps(props)
})

watch(displayMode, (newValue, oldValue) => {
    if(newValue == oldValue) return;

    // Crap in => default out
    if(!newValue) newValue = DisplayModeNotes.Blank

    if(oldValue != DisplayModeNotes.Unknown) {
        saveConfig()
    }
})

watch(expanded, (val, oldVal) => {
    if (val !== oldVal) {
        saveConfig()
    }
})

function saveConfig() {
    // save non default data
    const data: any = {}
    if(displayMode.value != DisplayModeNotes.Blank) data['mode'] = displayMode.value
    if(word.value.length) data['word'] = word.value
    // Logic for 'comp' legacy field: true for Compass, false for Hold, undefined otherwise (it was only used for Compass)
    if(displayMode.value === DisplayModeNotes.Compass) data['comp'] = true
    else if(displayMode.value === DisplayModeNotes.Hold) data['comp'] = false
    if(pills.value.length) data['pills'] = pills.value
    if(columns.value.length) data['cols'] = columns.value

    emits('update', new TileData( TileType.notes, data, expanded.value))
}

function onExpand(newValue:boolean) {
    expanded.value = newValue
    // saveConfig() will be called by watch
}

</script>

<style scoped>
.blank-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: 1fr auto;
    height: var(--tile-content-height);
    width: 100%;
    gap: 5px;
    padding: 5px;
}

.cell-word {
    grid-column: 1;
    grid-row: 1 / span 2;
    height: 100%;
}

.cell-columns {
    grid-column: 2;
    grid-row: 1;
    border-left: 1px solid var(--border-color);
    width: 100%; /* Ensure it takes full width of cell */
    height: 100%; /* Ensure it takes full height of cell */
}

.cell-columns.tileContent {
    width: 100%;
    height: 100%;
}

.cell-word :deep(.tileContent) {
    width: auto; /* Fit word content width */
    height: 100%;
}

.cell-pills {
    grid-column: 2;
    grid-row: 2;
    border-left: 1px solid var(--border-color);
    width: 100%;
}

.modeGrid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(6, 1fr);
    width: auto;
}
.modeGrid.expanded {
    grid-template-columns: repeat(4, 1fr);
}
.modeGrid div {
    border: 1px dashed lightgrey;
}
.box {
    display: flex;
    gap: 5px;
    font-size: 10px;
    font-weight: 600;
    color : darkgrey;
    height: 100%;
}    

.box>* {
    border: 1px dashed darkgrey;
    border-radius: 4px;
    padding: 2px;
    min-width: 65px;
}    

.pill {
    /* Pill styling */
    height: 45px;
}

</style>