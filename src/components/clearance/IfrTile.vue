<template>
    <div class="tile">
        <Header :title="getTitle()" :showReplace="displaySelection" :showDisplayMode="true"
            @replace="emits('replace')" @display="displaySelection = !displaySelection"></Header>
        <DisplayModeSelection v-if="displaySelection" v-model="displayMode" :modes="displayModes" @keep="displaySelection=false" />
        <div v-else-if="editMode" class="editMode">
            <AirportInput v-model="airport" :expanded="true" @valid="onAirportUpdate"/>
            <ActionBar :actions="[{action:'cancel',label:'Manual'}]" :showApply="false" @cancel="editMode=false" @action="onManual"/>
        </div>
        <ApproachContent v-else-if="displayMode==DisplayModeIfr.Approach" :airport="airport" class="clickable"
            @click="editMode=true" />
        <DepartureContent v-else-if="displayMode==DisplayModeIfr.Departure" :airport="airport" class="clickable"
            @click="editMode=true" />
        <div v-else-if="displayMode==DisplayModeIfr.Alternate">
            <ImageContent src="alternate.png" /> 
            <RegLink :regs="[Regulation.IFRFlightPlanInformation]" />
        </div>
        <div v-else-if="displayMode==DisplayModeIfr.LostComms" >
            <ImageContent src="lostcomms-ifr.png" /> 
            <RegLink :regs="[Regulation.IFRTwoWayRadioFailure]" />
        </div>
        <CraftBoxedContent v-else />
    </div>

</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Airport } from '../../model/Airport.ts';
import { DisplayModeChoice, DisplayModeIfr } from '../../model/DisplayMode.ts';
import { getAirport } from '../../assets/data.js';
import { TileData } from '../../model/TileData.ts';
import { TileType } from '../../model/TileType.ts';
import { Regulation } from '../../model/Regulation.ts';

import ActionBar from '../shared/ActionBar.vue';
import ApproachContent from './ApproachContent.vue';
import CraftBoxedContent from './CraftBoxedContent.vue';
import DepartureContent from './DepartureContent.vue';
import Header from '../shared/Header.vue';
import ImageContent from '../shared/ImageContent.vue';
import AirportInput from '../shared/AirportInput.vue';
import DisplayModeSelection from '../shared/DisplayModeSelection.vue';
import RegLink from '../regulations/RegLink.vue';

// Enum with display modes

const noAirport = new Airport()
const airport = ref(noAirport)
const emits = defineEmits(['replace','update'])
const defaultMode = DisplayModeIfr.BoxV
const displayMode=ref(DisplayModeIfr.Unknown)
const editMode = ref(false)
const props = defineProps({
    params: { type: Object, default: null},
})
const displaySelection=ref(false)
const displayModes = [
    new DisplayModeChoice( 'CRAFT Clearance', DisplayModeIfr.BoxV),
    new DisplayModeChoice( 'Departure', DisplayModeIfr.Departure),
    new DisplayModeChoice( 'Approach', DisplayModeIfr.Approach),
    new DisplayModeChoice( 'Alternate', DisplayModeIfr.Alternate),
    new DisplayModeChoice( 'Lost Comms', DisplayModeIfr.LostComms),
]

onMounted(() => {   
    loadProps(props)
})

watch( props, async() => {
    loadProps(props)
})

watch( displayMode, (newValue, oldValue) => {
    // console.debug('[Clearance.displayMode]', newValue, oldValue)
    displaySelection.value = false;
    if( newValue == oldValue) return;
    saveConfig()
})

function loadProps(props:any) {
    // console.debug('[Clearance.loadProps]', JSON.stringify(props))
    // displayMode.value = defaultMode
    if( props.params) {
         if( props.params.mode) {
            // for compatibility with old versions
            if(props.params.mode == DisplayModeIfr.BoxH_deprecated 
                || props.params.mode==DisplayModeIfr.Craft_deprecated 
                || props.params.mode=="") {
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
        displaySelection.value = true
    }
}

function saveConfig() {
    // build parameters
    const params = {mode:displayMode.value, airport:airport.value.code}
    emits('update', new TileData( TileType.clearance, params))
}

function getTitle() {
    if( displaySelection.value) return "IFR Tile Mode"
    let title:string;
    let airportPosition:string = 'none';
    const airportCode = airport.value.code || ''
    if( displayMode.value==DisplayModeIfr.Approach) {
        title =  `${airportCode} Apch`
        airportPosition = 'prepend'
    } else if( displayMode.value==DisplayModeIfr.Alternate) {
        title = 'IFR Alternate'
    } else if( displayMode.value==DisplayModeIfr.LostComms) {
        title = 'IFR Lost Comms'
    } else if( displayMode.value==DisplayModeIfr.Departure) {
        title = airportCode.length ? `Depart ${airportCode} IFR` : 'IFR Departure'
    } else {
        title = 'IFR Flight'
    }

    return title
}

// This is used to switch to manual mode
function onManual() {
    editMode.value = false
    airport.value = noAirport
    saveConfig()
}

function onAirportUpdate() {
    editMode.value = false
    saveConfig()
}

</script>

<style scoped>
.editMode {
    padding: 10px;
}
</style>