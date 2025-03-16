<template>
    <div class="tile">
        <Header :title="displaySelection ? 'Notes Tile Mode' : 'Notes'"
            :stealth="!displaySelection && displayMode==DisplayModeNotes.Blank" :showReplace="displaySelection"
            @replace="emits('replace')" @display="displaySelection = !displaySelection"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="displayModes" :expandable
            @selection="changeDisplayMode" @expand="onExpand" />
        <div v-else-if="editMode" class="edit">
            <div class="paddedEdit">
                <InputGroup>
                    <InputGroupAddon>Word</InputGroupAddon>
                    <InputText v-model="word" class="editWord"/>
                </InputGroup>
            </div>
            <ActionBar @apply="onEditApply" @cancel="onEditCancel" />
        </div>
        <div v-else-if="displayMode==DisplayModeNotes.Blank" class="tileContent">
            <div class="blank">&nbsp;</div>
        </div>
        <div v-else-if="displayMode==DisplayModeNotes.Grid" class="modeGrid tileContent">
            <div v-for="i in [1,2,3,4,5,6,7,8,9,10,11,12]">&nbsp;</div>
        </div>
        <CompassContent v-else-if="displayMode==DisplayModeNotes.Compass" />
        <WordContent v-else-if="displayMode==DisplayModeNotes.Word"  :word="word"
             @letterclick="onLetterClick" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { DisplayModeChoice, DisplayModeNotes } from '../../model/DisplayMode'; 
import WordContent from './WordContent.vue';
import CompassContent from './CompassContent.vue';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import InputText from 'primevue/inputtext';
import ActionBar from '../shared/ActionBar.vue';

import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import Header from '../shared/Header.vue';

// Enum with display modes

const displayMode = ref(DisplayModeNotes.Blank)
const emits = defineEmits(['replace','update','expand'])
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
const expandable = ref(true)
const word = ref('CRAFT')
let wordBeforeEdit = ''

function loadProps(props:any) {
    // console.log('[NotesTile.loadProps] ' + JSON.stringify(props))
    // restore display mode without update
    changeDisplayMode(props?.params?.mode,false)
    // Restore custom word
    if(props?.params?.word) word.value = props.params.word

    expandable.value = !props?.span2;
}

function onLetterClick(letter:string) {
    wordBeforeEdit = word.value
    editMode.value = true;
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


function changeDisplayMode(newMode:DisplayModeNotes,update=true) {
    // console.log('[NotesTiles.changeMode]', newMode)
    // Crap in => default out
    if(!newMode) newMode = DisplayModeNotes.Blank
    // For compatibility Craft => Word
    if(newMode == DisplayModeNotes.Craft_deprecated) newMode = DisplayModeNotes.Word

    displayMode.value = newMode
    displaySelection.value = false;

    if(update) emitUpdate()
}

function emitUpdate() {
    emits('update', {mode:displayMode.value, word:word.value})
}

function onEditApply() {
    console.log('NotesTiles.onEditApply]', word.value)
    editMode.value = false;
    emitUpdate()
}

function onEditCancel() {
    word.value = wordBeforeEdit
    editMode.value = false;
}

function onExpand() {
    changeDisplayMode(DisplayModeNotes.Blank)
    emits('expand')
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

</style>