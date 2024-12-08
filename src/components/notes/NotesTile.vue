<template>
    <div class="tile">
        <Header title="Notes"
            :stealth="!settingsMode && displayMode==''" :hideReplace="!settingsMode"
            @click="onClick" @replace="emits('replace')"></Header>
        <div v-if="settingsMode" class="list" >
            <Button label="Blank" @click="changeMode(DisplayMode.Blank)"></Button>
            <Button label="Grid" @click="changeMode(DisplayMode.Grid)" title="2x6 grid"></Button>
            <Button label="Compass" @click="changeMode(DisplayMode.Compass)" title="Compass"></Button>
            <Button label="C R A F T" @click="changeMode(DisplayMode.Craft)" title="CRAFT Clearance"></Button>
            <!-- <font-awesome-icon :icon="['fas', 'video']" class="videoButton"
                @click="onVideo" title="Quick Intro on note tiles"></font-awesome-icon> -->
        </div>
        <div v-else-if="displayMode=='grid'" class="grid tileContent">
            <div v-for="i in [1,2,3,4,5,6,7,8,9,10,11,12]">&nbsp;</div>
        </div>
        <CompassContent v-else-if="displayMode==DisplayMode.Compass" />
        <CraftContent v-else-if="displayMode==DisplayMode.Craft" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import Button from 'primevue/button';
import CompassContent from './CompassContent.vue';
import CraftContent from '../clearance/CraftContent.vue';
import Header from '../shared/Header.vue';
import { UserUrl } from '../../lib/UserUrl';

// Enum with display modes
enum DisplayMode {
    Blank = '',
    Grid = 'grid',
    Compass = 'compass',
    Craft = 'craft',
}

const displayMode = ref(DisplayMode.Blank)
const emits = defineEmits(['replace','update'])
const settingsMode = ref(false)

// Props management
const props = defineProps({
    params: { type: Object, default: null},
})

function loadProps(props:any) {
    // console.log('[NotesTile.loadProps] ' + JSON.stringify(props))
    // load display mode without update
    changeMode(props?.params?.mode,false)
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


function changeMode(newMode:DisplayMode,update=true) {
    // console.log('[NotesTiles.changeMode]', newMode)
    // Crap in => default out
    if(!newMode) newMode = DisplayMode.Blank

    displayMode.value = newMode
    settingsMode.value = false;

    // console.log('[NotesTiles.changeMode] title ' + title.value)
    const params = {mode:newMode}

    // notify the parent if needed
    if(update) emits('update', params)
}

function onClick() {
    settingsMode.value = !settingsMode.value
}

function onVideo() {
    window.open( UserUrl.noteTilesVideo, '_blank');
}
</script>

<style scoped>

.grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(6, 1fr);
}
.grid div {
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