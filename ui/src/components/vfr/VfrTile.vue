<template>
    <div class="tile">
        <Header :title="getTitle()" :showReplace="displaySelection"
            @replace="emits('replace')" @display="displaySelection = !displaySelection"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="displayModes" @keep="displaySelection=false" />
        <div v-else-if="displayMode==DisplayModeVfr.Altitudes" >
            <ImageContent src="vfr-altitudes.png" /> 
            <RegLink :regs="[Regulation.VfrAltitudes]" />
        </div>
        <Nordo v-else-if="displayMode==DisplayModeVfr.LostComms" />
        <div v-else-if="displayMode==DisplayModeVfr.Msa">
            <ImageContent src="safe-altitudes.png" />
            <RegLink :regs="[Regulation.MinimumSafeAltitudes]" />
        </div>
        <SunLight v-else-if="displayMode==DisplayModeVfr.Sunlight" :showHeader="false" :params="sunlightParams" @update="onSunlightUpdate" />
        <CloudClearance v-else />
        <TileModeDots 
            v-if="!displaySelection"
            v-model="displayMode" 
            :modes="displayModes" 
        />
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Airport } from '../../models/Airport.ts';
import { DisplayModeChoice, DisplayModeVfr } from '../../models/DisplayMode.ts';
import { getAirport } from '../../services/AirportDataService';
import { Regulation } from '../../models/Regulation.ts';
import { TileData } from '../../models/TileData.ts';
import { TileType } from '../../models/TileType.ts';

import Header from '../shared/Header.vue';
import ImageContent from '../shared/ImageContent.vue';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import Nordo from '../radios/Nordo.vue';
import CloudClearance from '../atis/CloudClearance.vue';
import SunLight from '../sunlight/SunLight.vue';
import RegLink from '../regulations/RegLink.vue';
import TileModeDots from '../shared/TileModeDots.vue';

// Enum with display modes

const noAirport = new Airport()
const airport = ref(noAirport)
const emits = defineEmits(['replace','update'])
const defaultMode = DisplayModeVfr.CloudClearance
const displayMode=ref(DisplayModeVfr.Unknown)
const sunlightParams=ref({})
const props = defineProps({
    params: { type: Object, default: null},
})
const displaySelection=ref(false)
const displayModes = [
    new DisplayModeChoice( 'VFR Altitudes', DisplayModeVfr.Altitudes),
    new DisplayModeChoice( 'Cloud Clearance', DisplayModeVfr.CloudClearance),
    new DisplayModeChoice( 'Sunlight', DisplayModeVfr.Sunlight),
    new DisplayModeChoice( 'Lost Comms', DisplayModeVfr.LostComms),
    new DisplayModeChoice( 'Minimum Safe Altitudes', DisplayModeVfr.Msa)
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
    // console.debug('[VfrTile.loadProps]', props)
    displayMode.value = defaultMode
    if( props.params) {
        // console.debug('[VfrTile.loadProps] params', props.params)
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
         if( props.params.sunlight) {
            sunlightParams.value = props.params.sunlight
         }
    } else {
        // console.debug('[VfrTile] show display selection')
        displaySelection.value = true
    }
}

function saveConfig() {
    // build parameters
    const params:any = {mode:displayMode.value, airport:airport.value.code}
    if(sunlightParams.value && Object.keys(sunlightParams.value).length > 0) {
        params.sunlight = sunlightParams.value
    }
    emits('update', new TileData( TileType.vfr, params))
}

function onSunlightUpdate(newTileData: TileData) {
    sunlightParams.value = newTileData.data;
    saveConfig();
}

function getTitle() {
    if( displaySelection.value) return "VFR Tile Mode"
    let title:string;
    if( displayMode.value==DisplayModeVfr.Altitudes) {
        title =  'VFR Altitudes'
    } else if( displayMode.value==DisplayModeVfr.CloudClearance) {
        title = 'Clouds Clearance'
    } else if( displayMode.value==DisplayModeVfr.Sunlight) {
        title = 'Sunlight'
    } else if( displayMode.value==DisplayModeVfr.LostComms) {
        title = 'VFR Lost Comms'
    } else if( displayMode.value==DisplayModeVfr.Msa) {
        title = 'Minimum Safe Altitudes'
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