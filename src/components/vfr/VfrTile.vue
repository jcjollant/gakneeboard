<template>
    <div class="tile">
        <Header :title="getTitle()" :showReplace="displaySelection" :showDisplayMode="true"
            @replace="emits('replace')" @display="displaySelection = !displaySelection"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="displayModes" @keep="displaySelection=false" />
        <ImageContent v-else-if="displayMode==DisplayModeVfr.Altitudes" src="vfr-altitudes.png" /> 
        <Nordo v-else-if="displayMode==DisplayModeVfr.LostComms" />
        <CloudClearance v-else />
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Airport } from '../../model/Airport.ts';
import { DisplayModeChoice, DisplayModeVfr } from '../../model/DisplayMode.ts';
import { getAirport } from '../../assets/data.js';

import Header from '../shared/Header.vue';
import ImageContent from '../shared/ImageContent.vue';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import { TileData } from '../../model/TileData.ts';
import { TileType } from '../../model/TileType.ts';
import Nordo from '../radios/Nordo.vue';
import CloudClearance from '../atis/CloudClearance.vue';

// Enum with display modes

const noAirport = new Airport()
const airport = ref(noAirport)
const emits = defineEmits(['replace','update'])
const defaultMode = DisplayModeVfr.CloudClearance
const displayMode=ref(DisplayModeVfr.Unknown)
const props = defineProps({
    params: { type: Object, default: null},
})
const displaySelection=ref(false)
const displayModes = [
    new DisplayModeChoice( 'VFR Altitudes', DisplayModeVfr.Altitudes),
    new DisplayModeChoice( 'Cloud Clearance', DisplayModeVfr.CloudClearance),
    new DisplayModeChoice( 'Lost Comms', DisplayModeVfr.LostComms)
]

onMounted(() => {   
    loadProps(props)
})

watch( props, async() => {
    loadProps(props)
})

watch( displayMode, (newValue, oldValue) => {
    if( newValue == oldValue || oldValue == DisplayModeVfr.Unknown) return;
    displaySelection.value = false;
    saveConfig()
})

function loadProps(props:any) {
    console.debug('[VfrTile.loadProps]', props)
    displayMode.value = defaultMode
    if( props.params) {
        console.debug('[VfrTile.loadProps] params', props.params)
         if( props.params.mode) {
            // for compatibility with old versions
            if(props.params.mode=="") {

                props.params.mode = defaultMode;
            } else {
                displayMode.value = props.params.mode
            }
         } else {
            displaySelection.value = true
         }
         if( props.params.airport) {
            getAirport(props.params.airport).then( output => {
                if( output) {
                    airport.value = Airport.copy(output)
                }
            })
         }
    } else {
        console.debug('[VfrTile] show display selection')
        displaySelection.value = true
    }
}

function saveConfig() {
    // build parameters
    const params = {mode:displayMode.value, airport:airport.value.code}
    emits('update', new TileData( TileType.vfr, params))
}

function getTitle() {
    if( displaySelection.value) return "VFR Tile Mode"
    let title:string;
    if( displayMode.value==DisplayModeVfr.Altitudes) {
        title =  'VFR Altitudes'
    } else if( displayMode.value==DisplayModeVfr.CloudClearance) {
        title = 'Clouds Clearance'
    } else if( displayMode.value==DisplayModeVfr.LostComms) {
        title = 'VFR Lost Comms'
    } else {
        title = 'VFR Tile'
    }

    return title
}

</script>

<style scoped>
.editMode {
    padding: 10px;
}
</style>