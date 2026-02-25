<template>
    <div class="tile">
        <Header :title="getTitle()" :showReplace="displaySelection"
            @replace="emits('replace')" @display="displaySelection = !displaySelection"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="displayModes" @keep="displaySelection=false" />
        
        <Nordo v-else-if="displayMode==DisplayModeEmergency.VfrLostComms" />
        
        <div v-else-if="displayMode==DisplayModeEmergency.IfrLostComms" >
            <ImageContent src="lostcomms-ifr.png" /> 
            <RegLink :regs="[Regulation.IFRTwoWayRadioFailure]" />
        </div>

        <div v-else-if="displayMode==DisplayModeEmergency.DistressCall" class="placeholder">
            <h3>Distress Call (Mayday)</h3>
            <p>Placeholder for Distress Call procedure</p>
        </div>

        <LostProcedure v-else-if="displayMode==DisplayModeEmergency.LostProcedure" />

        <TileModeDots 
            v-if="!displaySelection"
            v-model="displayMode" 
            :modes="displayModes" 
        />
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { DisplayModeChoice, DisplayModeEmergency } from '../../models/DisplayMode.ts';
import { Regulation } from '../../models/Regulation.ts';
import { TileData } from '../../models/TileData.ts';
import { TileType } from '../../models/TileType.ts';

import Header from '../shared/Header.vue';
import ImageContent from '../shared/ImageContent.vue';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import Nordo from '../radios/Nordo.vue';
import RegLink from '../regulations/RegLink.vue';
import TileModeDots from '../shared/TileModeDots.vue';
import LostProcedure from '../shared/LostProcedure.vue';

// Enum with display modes

const emits = defineEmits(['replace','update'])
const defaultMode = DisplayModeEmergency.VfrLostComms
const displayMode=ref(DisplayModeEmergency.Unknown)
const props = defineProps({
    params: { type: Object, default: null},
})
const displaySelection=ref(false)
const displayModes = [
    new DisplayModeChoice( 'VFR Lost Comms', DisplayModeEmergency.VfrLostComms),
    new DisplayModeChoice( 'IFR Lost Comms', DisplayModeEmergency.IfrLostComms),
    new DisplayModeChoice( 'Distress Call', DisplayModeEmergency.DistressCall),
    new DisplayModeChoice( 'Lost Procedure', DisplayModeEmergency.LostProcedure)
]

onMounted(() => {   
    loadProps(props)
})

watch( props, async() => {
    loadProps(props)
})

watch( displayMode, (newValue, oldValue) => {
    if( newValue == oldValue || oldValue == DisplayModeEmergency.Unknown) return;
    displaySelection.value = false;
    saveConfig()
})

function loadProps(props:any) {
    displayMode.value = defaultMode
    if( props.params) {
         if( props.params.mode) {
                displayMode.value = props.params.mode
         } else {
            displaySelection.value = true
         }
    } else {
        displaySelection.value = true
    }
}

function saveConfig() {
    const params:any = {mode:displayMode.value}
    emits('update', new TileData( TileType.emergency, params))
}

function getTitle() {
    if( displaySelection.value) return "Emergency Tile Mode"
    let title:string;
    if( displayMode.value==DisplayModeEmergency.VfrLostComms) {
        title =  'VFR Lost Comms'
    } else if( displayMode.value==DisplayModeEmergency.IfrLostComms) {
        title = 'IFR Lost Comms'
    } else if( displayMode.value==DisplayModeEmergency.DistressCall) {
        title = 'Distress Call'
    } else if( displayMode.value==DisplayModeEmergency.LostProcedure) {
        title = 'Lost Procedure'
    } else {
        title = 'Emergencies'
    }

    return title
}

</script>

<style scoped>
.placeholder {
    padding: 20px;
    text-align: center;
    color: #666;
}
</style>
