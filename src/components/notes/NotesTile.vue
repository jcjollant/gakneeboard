<template>
    <div class="tile">
        <Header :title="displaySelection ? 'Notes Tile Mode' : 'Notes'"
            :stealth="!displaySelection && displayMode==DisplayModeNotes.Blank" :showReplace="displaySelection"
            @replace="emits('replace')" @display="displaySelection = !displaySelection"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="displayModes" :expandable="true" :expanded="expanded"
            @expand="onExpand" @keep="displaySelection=false" />
        <div v-else-if="editMode" class="edit">
            <div class="paddedEdit" v-show="displayMode==DisplayModeNotes.Word">
                <InputGroup>
                    <InputGroupAddon>Word</InputGroupAddon>
                    <InputText v-model="word" class="editWord"/>
                </InputGroup>
            </div>
            <div class="paddedEdit" v-show="displayMode==DisplayModeNotes.Compass">
                <div class="miniSection">Compass Mode</div>
                <EitherOr v-model="compassHeading" either="Heading" or="Hold"/>
            </div>
            <ActionBar @apply="onEditApply" @cancel="onEditCancel" />
        </div>
        <div v-else-if="displayMode==DisplayModeNotes.Blank" class="tileContent">
            <div class="blank">&nbsp;</div>
        </div>
        <div v-else-if="displayMode==DisplayModeNotes.Grid" class="modeGrid tileContent">
            <div v-for="i in [1,2,3,4,5,6,7,8,9,10,11,12]">&nbsp;</div>
        </div>
        <CompassContent v-else-if="displayMode==DisplayModeNotes.Compass" :heading="compassHeading" class="clickable"
            @click="onEditMode"/>
        <WordContent v-else-if="displayMode==DisplayModeNotes.Word"  :word="word"
             @letterclick="onEditMode" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { DisplayModeChoice, DisplayModeNotes } from '../../model/DisplayMode'; 
import { TileType } from '../../model/TileType';
import { TileData } from '../../model/TileData';

import WordContent from './WordContent.vue';
import CompassContent from './CompassContent.vue';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import InputText from 'primevue/inputtext';
import ActionBar from '../shared/ActionBar.vue';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import Header from '../shared/Header.vue';
import EitherOr from '../shared/EitherOr.vue';

// Enum with display modes

const compassHeading = ref(true)
let compassHeadingBeforeEdit = true
const displayMode = ref(DisplayModeNotes.Unknown)
const emits = defineEmits(['replace','update'])
const displaySelection = ref(false)
const displayModes = [
    new DisplayModeChoice('Blank', DisplayModeNotes.Blank, true),
    new DisplayModeChoice('W O R D',DisplayModeNotes.Word),
    new DisplayModeChoice('Compass',DisplayModeNotes.Compass),
    new DisplayModeChoice('Grid',DisplayModeNotes.Grid),
]
const editMode = ref(false)
// Props management
const props = defineProps({
    params: { type: Object, default: null},
    span2: { type: Boolean, default: false}
})
const expanded = ref(false)
const word = ref('CRAFT')
let wordBeforeEdit = ''

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
    editMode.value = false

    if(oldValue != DisplayModeNotes.Unknown) {
        saveConfig()
    }
})

function saveConfig() {
    // save non default data
    const data = {}
    if(displayMode.value != DisplayModeNotes.Blank) data['mode'] = displayMode.value
    if(word.value.length) data['word'] = word.value
    if(compassHeading.value != true) data['comp'] = compassHeading.value

    emits('update', new TileData( TileType.notes, data, expanded.value))
}

function onEditApply() {
    // console.log('NotesTiles.onEditApply]', word.value)
    editMode.value = false;
    saveConfig()
}

function onEditCancel() {
    // console.log('[NotesTile] onEditCancel', word.value, wordBeforeEdit)
    word.value = wordBeforeEdit
    compassHeading.value = compassHeadingBeforeEdit
    editMode.value = false;
}

function onEditMode() {
    compassHeadingBeforeEdit = compassHeading.value
    wordBeforeEdit = word.value
    editMode.value = true
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