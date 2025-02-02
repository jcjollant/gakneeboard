<template>
    <div class="tile">
        <Header :title="displaySelection ? 'Notes Tile Mode' : 'Notes'"
            :stealth="!displaySelection && displayMode==DisplayModeNotes.Blank" :showReplace="displaySelection"
            @replace="emits('replace')" @display="displaySelection = !displaySelection"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="displayModes" @selection="changeDisplayMode" />
        <div v-else-if="displayMode==DisplayModeNotes.Blank" class="tileContent">
            <div class="blank">&nbsp;</div>
        </div>
        <div v-else-if="displayMode==DisplayModeNotes.Grid" class="modeGrid tileContent">
            <div v-for="i in [1,2,3,4,5,6,7,8,9,10,11,12]">&nbsp;</div>
        </div>
        <CompassContent v-else-if="displayMode==DisplayModeNotes.Compass" />
        <CraftContent v-else-if="displayMode==DisplayModeNotes.Craft" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { UserUrl } from '../../lib/UserUrl';
import { DisplayModeNotes } from '../../model/DisplayMode'; 

import CompassContent from './CompassContent.vue';
import CraftContent from '../clearance/CraftContent.vue';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import Header from '../shared/Header.vue';

// Enum with display modes

const displayMode = ref(DisplayModeNotes.Blank)
const emits = defineEmits(['replace','update'])
const displaySelection = ref(false)
const displayModes = [
    {label:'Blank',value:DisplayModeNotes.Blank},
    {label:'C R A F T',value:DisplayModeNotes.Craft},
    {label:'Compass',value:DisplayModeNotes.Compass},
    {label:'Grid',value:DisplayModeNotes.Grid},
]
// Props management
const props = defineProps({
    params: { type: Object, default: null},
})

function loadProps(props:any) {
    // console.log('[NotesTile.loadProps] ' + JSON.stringify(props))
    // restore display mode without update
    changeDisplayMode(props?.params?.mode,false)
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

    displayMode.value = newMode
    displaySelection.value = false;

    // console.log('[NotesTiles.changeMode] title ' + title.value)
    const params = {mode:newMode}

    // notify the parent if needed
    if(update) emits('update', params)
}

function onVideo() {
    window.open( UserUrl.noteTilesVideo, '_blank');
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

</style>