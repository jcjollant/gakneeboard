<template>
    <div class="tile">
        <Header :title="displaySelection ? 'Notes Tile Mode' : 'Notes'"
            :stealth="!displaySelection && displayMode==DisplayModeNotes.Blank" :showReplace="displaySelection"
            leftButton="settings"
            @replace="emits('replace')" @settings="emits('settings')" @display="displaySelection = !displaySelection"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="displayModes" :expandable="true" :expanded="expanded"
            @expand="onExpand" @keep="displaySelection=false" />
        <div v-else-if="displayMode==DisplayModeNotes.Blank" class="tileContent">
            <div class="blank">&nbsp;</div>
        </div>
        <div v-else-if="displayMode==DisplayModeNotes.Grid" class="modeGrid tileContent" :class="{ expanded: expanded }">
            <div v-for="i in gridCells" :key="i">&nbsp;</div>
        </div>
        <CompassContent v-else-if="displayMode==DisplayModeNotes.Compass" :heading="compassHeading" />
        <WordContent v-else-if="displayMode==DisplayModeNotes.Word"  :word="word" />
        
        <TileModeDots 
            v-if="!displaySelection"
            v-model="displayMode" 
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
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import TileModeDots from '../shared/TileModeDots.vue';
import Header from '../shared/Header.vue';
import { NotesTileConfig } from './NotesTileConfig';

// Enum with display modes

const compassHeading = ref(true)
const displayMode = ref(DisplayModeNotes.Unknown)
const emits = defineEmits(['replace','update','settings'])
const displaySelection = ref(false)
const word = ref('CRAFT')
const displayModes = NotesTileConfig.modesList

// Props management
const props = defineProps({
    params: { type: Object, default: null},
    span2: { type: Boolean, default: false}
})
const expanded = ref(false)
const gridCells = computed(() => expanded.value ? 24 : 12)

function loadProps(props:any) {
    // console.debug('[NotesTile.loadProps]', props)

    // restore display mode
    let newMode = props?.params?.mode ?? DisplayModeNotes.Blank
    // For compatibility Craft => Word
    if(newMode == DisplayModeNotes.Craft_deprecated) newMode = DisplayModeNotes.Word
    displayMode.value = newMode
    
    // Restore custom word
    word.value = props?.params?.word ?? 'CRAFT'
    compassHeading.value = props?.params?.comp ?? true
    expanded.value = props?.span2 ?? false
}

onMounted(() => {   
    // console.log('ATIS mounted with ' + JSON.stringify(props.params))
    loadProps(props)
    // console.log('onMounted mode ' + mode.value)
})

watch( props, async() => {
    // console.log("Airport props changed " + JSON.stringify(props));
    loadProps(props)
})

watch(displayMode, (newValue, oldValue) => {
    // console.debug('[NotesTiles.changeMode]', oldValue, '=>', newValue, displayMode.value)
    if(newValue == oldValue) return;

    // Crap in => default out
    if(!newValue) newValue = DisplayModeNotes.Blank

    displaySelection.value = false;

    if(oldValue != DisplayModeNotes.Unknown) {
        saveConfig()
    }
})

function saveConfig() {
    // save non default data
    const data: any = {}
    if(displayMode.value != DisplayModeNotes.Blank) data['mode'] = displayMode.value
    if(word.value.length) data['word'] = word.value
    if(compassHeading.value != true) data['comp'] = compassHeading.value

    emits('update', new TileData( TileType.notes, data, expanded.value))
}

function onExpand(newValue:boolean) {
    expanded.value = newValue
    saveConfig()
}

</script>

<style scoped>

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
.list {
    position: relative;
    display: grid;
    padding: 10px;
    gap:10px;
    grid-template-rows: repeat(3, 3rem);
    height: var(--tile-content-height);
}

.videoButton {
    position:absolute;
    left: 0;
    bottom: 0;
    line-height: 1.5rem;
    display: flex;
    padding: 5px 10px;
    gap: 10px;
    cursor: pointer;
    align-items: center;
    color: var(--bg);
    font-size: 0.9rem;
}

.paddedEdit {
    padding: 10px;
}

.miniSection {
    font-size: 0.7rem;
    display: flex;
    font-weight: bold;
    padding-bottom: 10px;
    justify-content: center;
}

</style>